import { cookies } from "next/headers";
import {
  getSessionCookieName,
  verifySessionToken,
  getEmailFromSessionToken,
  getAdminAccessForEmail,
  type AdminRole,
} from "@backend/auth";

export type { AdminRole };
export type AdminPermission =
  | "*"
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

export type ViewerAccess = {
  email: string;
  role: AdminRole;
  permissions: string[];
  isPrimary: boolean;
};

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  "*",
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
];

/** Resolved admin role from session cookie, or null when logged out / invalid. */
export async function getViewerRole(): Promise<AdminRole | null> {
  const access = await getViewerAccess();
  return access?.role ?? null;
}

/** Resolved viewer access (role + granular permissions), or null when logged out / invalid. */
export async function getViewerAccess(): Promise<ViewerAccess | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  if (!verifySessionToken(session)) return null;
  const email = (getEmailFromSessionToken(session) ?? "").trim().toLowerCase();
  const access = await getAdminAccessForEmail(email);
  return {
    email,
    role: access.role,
    permissions: access.permissions,
    isPrimary: access.isPrimary,
  };
}

export function hasPermission(
  access: Pick<ViewerAccess, "role" | "permissions"> | null,
  permission: AdminPermission
): boolean {
  if (!access) return false;
  if (access.role === "owner") return true;
  const perms = access.permissions ?? [];
  return perms.includes("*") || perms.includes(permission);
}

export async function jsonForbiddenUnlessPermission(permission: AdminPermission): Promise<Response | null> {
  const access = await getViewerAccess();
  if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasPermission(access, permission)) return Response.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

/** CMS, uploads, team management — primary dashboard owners only. */
export async function jsonForbiddenUnlessOwner(): Promise<Response | null> {
  const access = await getViewerAccess();
  if (!access) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (access.role !== "owner") return Response.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

/** Leads / inbox API — full admins plus delegated messages-only accounts. */
export async function jsonForbiddenUnlessMessagesOrOwner(): Promise<Response | null> {
  return jsonForbiddenUnlessPermission("leads.view");
}
