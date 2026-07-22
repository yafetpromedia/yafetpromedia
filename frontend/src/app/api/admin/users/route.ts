import { cookies } from "next/headers";
import {
  getEmailFromSessionToken,
  getSessionCookieName,
  hashAdminPassword,
  verifySessionToken,
} from "@backend/auth";
import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { query } from "@db";
import { csrfGuard } from "@/lib/request-security";
import { auditAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

type DbRole = "owner" | "messages";
type DbPermission =
  | "content.view"
  | "content.edit"
  | "leads.view"
  | "leads.edit"
  | "leads.delete"
  | "testimonials.view"
  | "testimonials.edit"
  | "testimonials.delete"
  | "team.view"
  | "team.add"
  | "team.delete"
  | "security.view"
  | "security.edit"
  | "ai.view"
  | "upload.add";
const KNOWN_PERMISSIONS: readonly DbPermission[] = [
  "content.view",
  "content.edit",
  "leads.view",
  "leads.edit",
  "leads.delete",
  "testimonials.view",
  "testimonials.edit",
  "testimonials.delete",
  "team.view",
  "team.add",
  "team.delete",
  "security.view",
  "security.edit",
  "ai.view",
  "upload.add",
] as const;
const KNOWN_PERMISSIONS_SET = new Set<string>(KNOWN_PERMISSIONS);
const DEFAULT_MESSAGES_PERMISSIONS: DbPermission[] = ["leads.view", "leads.edit", "security.view", "security.edit"];

async function bodyJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function normalizeRole(value: unknown): DbRole | null {
  if (value === "owner" || value === "messages") return value;
  return null;
}

function normalizePermissions(value: unknown): DbPermission[] {
  const input = Array.isArray(value) ? value : [];
  const unique = new Set<DbPermission>();
  for (const item of input) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!KNOWN_PERMISSIONS_SET.has(trimmed)) continue;
    unique.add(trimmed as DbPermission);
  }
  return [...unique];
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function roleLabel(role: DbRole) {
  return role === "messages" ? "Restricted (custom permissions)" : "Owner (full dashboard)";
}

export async function GET() {
  const denied = await jsonForbiddenUnlessPermission("team.view");
  if (denied) return denied;

  const envPrimaryEmail = (process.env.ADMIN_EMAIL ?? "admin@awuddigitals.com").trim().toLowerCase();
  const rows = await query<{ id: number; email: string; role: string; permissions: unknown }>(
    `SELECT id, email, role, permissions FROM admin_users ORDER BY id ASC`
  );
  const users = rows.map((r) => ({
    id: r.id,
    email: r.email,
    role: normalizeRole(r.role) ?? "owner",
    roleLabel: roleLabel((normalizeRole(r.role) ?? "owner") as DbRole),
    permissions: normalizePermissions(r.permissions),
    isPrimary: r.email.trim().toLowerCase() === envPrimaryEmail,
  }));
  return Response.json({ users });
}

function isPgUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "23505";
}

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("team.add");
  if (denied) return denied;

  const body = await bodyJson(request);
  const emailRaw = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = normalizeRole(body?.role);
  const requestedPermissions = normalizePermissions(body?.permissions);

  if (!emailRaw || !isValidEmail(emailRaw)) {
    return Response.json({ error: "Valid email is required." }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }
  if (!role) {
    return Response.json({ error: "Role must be owner or messages." }, { status: 400 });
  }

  const permissions: DbPermission[] =
    role === "owner"
      ? []
      : requestedPermissions.length > 0
        ? requestedPermissions
        : DEFAULT_MESSAGES_PERMISSIONS;
  if (role === "messages" && permissions.length === 0) {
    return Response.json({ error: "Restricted users need at least one permission." }, { status: 400 });
  }

  const email = emailRaw.toLowerCase();
  const hash = hashAdminPassword(password);

  try {
    const existing = await query<{ id: number }>(
      `SELECT id FROM admin_users WHERE LOWER(TRIM(email)) = $1 LIMIT 1`,
      [email]
    );
    if (existing.length > 0) {
      return Response.json({ error: "That email is already registered." }, { status: 409 });
    }

    const inserted = await query<{ id: number }>(
      `INSERT INTO admin_users (email, password_hash, role, permissions) VALUES ($1, $2, $3, $4::jsonb) RETURNING id`,
      [email, hash, role, JSON.stringify(permissions)]
    );
    const id = inserted[0]?.id;
    if (!id) {
      return Response.json({ error: "Could not create user." }, { status: 500 });
    }
    await auditAdminAction("team.user.create", { targetEmail: email, role });
    return Response.json({ ok: true, user: { id, email, role, permissions } });
  } catch (err) {
    if (isPgUniqueViolation(err)) {
      return Response.json({ error: "That email is already registered." }, { status: 409 });
    }
    console.error("[admin/users POST]", err);
    return Response.json(
      {
        error:
          "Could not create user. Your database may need updating or the connection failed — check the server logs.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("team.add");
  if (denied) return denied;

  const body = await bodyJson(request);
  const id = Number(body?.id);
  const role = normalizeRole(body?.role);
  const requestedPermissions = normalizePermissions(body?.permissions);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  if (!role) {
    return Response.json({ error: "Role must be owner or messages." }, { status: 400 });
  }

  const envPrimaryEmail = (process.env.ADMIN_EMAIL ?? "admin@awuddigitals.com").trim().toLowerCase();
  const targetRows = await query<{ email: string }>(`SELECT email FROM admin_users WHERE id = $1 LIMIT 1`, [id]);
  const target = targetRows[0];
  if (!target) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (target.email.trim().toLowerCase() === envPrimaryEmail) {
    return Response.json({ error: "Primary admin access cannot be modified." }, { status: 400 });
  }

  const permissions: DbPermission[] =
    role === "owner"
      ? []
      : requestedPermissions.length > 0
        ? requestedPermissions
        : DEFAULT_MESSAGES_PERMISSIONS;
  if (role === "messages" && permissions.length === 0) {
    return Response.json({ error: "Restricted users need at least one permission." }, { status: 400 });
  }

  const rows = await query<{ id: number }>(
    `UPDATE admin_users SET role = $2, permissions = $3::jsonb WHERE id = $1 RETURNING id`,
    [id, role, JSON.stringify(permissions)]
  );
  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  await auditAdminAction("team.user.update", { targetId: id, role });
  return Response.json({ ok: true, user: { id, role, permissions } });
}

export async function DELETE(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("team.delete");
  if (denied) return denied;

  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  if (!verifySessionToken(session)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const selfEmail = (getEmailFromSessionToken(session) ?? "").trim().toLowerCase();

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const rows = await query<{ email: string }>(`SELECT email FROM admin_users WHERE id = $1 LIMIT 1`, [id]);
  const target = rows[0];
  if (!target) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (target.email.trim().toLowerCase() === selfEmail) {
    return Response.json({ error: "You cannot remove your own account." }, { status: 400 });
  }
  const envPrimaryEmail = (process.env.ADMIN_EMAIL ?? "admin@awuddigitals.com").trim().toLowerCase();
  if (target.email.trim().toLowerCase() === envPrimaryEmail) {
    return Response.json({ error: "Primary admin account cannot be removed." }, { status: 400 });
  }

  await query(`DELETE FROM admin_users WHERE id = $1`, [id]);
  await auditAdminAction("team.user.delete", { targetId: id, targetEmail: target.email });
  return Response.json({ ok: true });
}
