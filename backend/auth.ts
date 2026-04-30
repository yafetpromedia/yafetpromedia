import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { query } from "@db";

const SESSION_COOKIE = "yafet_session";

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "change-this-secret-in-env";
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function createSessionToken(email: string) {
  const payload = `${email}:${Date.now()}`;
  const signature = createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;
  const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
  const expected = createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getEmailFromSessionToken(token?: string | null) {
  if (!verifySessionToken(token)) return null;
  const [encodedPayload] = String(token).split(".");
  if (!encodedPayload) return null;
  const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
  const [email] = payload.split(":");
  return email || null;
}

export function hashAdminPassword(plain: string): string {
  return hashText(plain);
}

export type AdminRole = "owner" | "messages";
export type AdminPermission = string;

const DEFAULT_MESSAGES_PERMISSIONS: AdminPermission[] = [
  "leads.view",
  "leads.edit",
  "security.view",
  "security.edit",
];

const OWNER_PERMISSIONS: AdminPermission[] = ["*"];

function normalizeRole(value: unknown): AdminRole {
  return value === "messages" ? "messages" : "owner";
}

function normalizePermissionList(value: unknown): AdminPermission[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter((item) => item.length > 0);
      }
    } catch {
      return [];
    }
  }
  return [];
}

function defaultsForRole(role: AdminRole): AdminPermission[] {
  return role === "owner" ? OWNER_PERMISSIONS : DEFAULT_MESSAGES_PERMISSIONS;
}

export async function getAdminAccessForEmail(
  email: string | null | undefined
): Promise<{ role: AdminRole; permissions: AdminPermission[]; isPrimary: boolean }> {
  const normalized = String(email ?? "").trim().toLowerCase();
  const envEmail = (process.env.ADMIN_EMAIL ?? "admin@yafetpromedia.com").trim().toLowerCase();
  const isPrimary = normalized !== "" && normalized === envEmail;
  if (!normalized) {
    return { role: "owner", permissions: OWNER_PERMISSIONS, isPrimary: false };
  }
  try {
    const rows = await query<{ role: string; permissions: unknown }>(
      `SELECT role, permissions FROM admin_users WHERE LOWER(TRIM(email)) = $1 LIMIT 1`,
      [normalized]
    );
    const row = rows[0];
    if (row) {
      const role = normalizeRole(row.role);
      const fromDb = normalizePermissionList(row.permissions);
      const permissions =
        role === "owner" ? OWNER_PERMISSIONS : fromDb.length > 0 ? fromDb : defaultsForRole(role);
      if (isPrimary) {
        return { role: "owner", permissions: OWNER_PERMISSIONS, isPrimary: true };
      }
      return { role, permissions, isPrimary: false };
    }
  } catch {
    // DB unavailable — fallback below.
  }
  if (isPrimary) {
    return { role: "owner", permissions: OWNER_PERMISSIONS, isPrimary: true };
  }
  return { role: "owner", permissions: OWNER_PERMISSIONS, isPrimary: false };
}

/** Resolve dashboard permissions for an admin email. Env bootstrap account is always owner. */
export async function getAdminRoleForEmail(email: string | null | undefined): Promise<AdminRole> {
  const access = await getAdminAccessForEmail(email);
  return access.role;
}

export async function getAdminPermissionsForEmail(email: string | null | undefined): Promise<AdminPermission[]> {
  const access = await getAdminAccessForEmail(email);
  return access.permissions;
}

export async function getAdminRoleFromSession(sessionToken?: string | null): Promise<AdminRole | null> {
  if (!verifySessionToken(sessionToken)) return null;
  const email = getEmailFromSessionToken(sessionToken);
  return getAdminRoleForEmail(email);
}

function hashText(text: string) {
  return createHash("sha256").update(text).digest("hex");
}

function verifyAgainstEnv(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@yafetpromedia.com";
  const plainPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
  if (email !== adminEmail) return false;
  if (hashedPassword) return hashText(password) === hashedPassword;
  return password === plainPassword;
}

export async function verifyAdminCredentials(email: string, password: string) {
  try {
    const users = await query<{ password_hash: string }>(
      "SELECT password_hash FROM admin_users WHERE email = $1 LIMIT 1",
      [email]
    );
    const user = users[0];
    if (!user) return verifyAgainstEnv(email, password);
    return user.password_hash === hashText(password);
  } catch {
    return verifyAgainstEnv(email, password);
  }
}

/** Timing-safe comparison for ADMIN_PASSWORD_RECOVERY_SECRET vs submitted recovery passphrase. */
function verifyRecoverySecret(submitted: string): boolean {
  const configured = process.env.ADMIN_PASSWORD_RECOVERY_SECRET?.trim();
  if (!configured || !submitted.trim()) return false;
  const aHex = hashText(submitted.trim());
  const bHex = hashText(configured);
  try {
    const a = Buffer.from(aHex, "hex");
    const b = Buffer.from(bHex, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

async function setAdminPasswordForEmail(emailRaw: string, newPasswordPlain: string): Promise<void> {
  const hash = hashText(newPasswordPlain);
  const normalized = emailRaw.trim().toLowerCase();
  const updated = await query<{ id: number }>(
    `UPDATE admin_users SET password_hash = $1 WHERE LOWER(TRIM(email)) = $2 RETURNING id`,
    [hash, normalized]
  );
  if (updated.length > 0) return;
  const envEmail = (process.env.ADMIN_EMAIL ?? "admin@yafetpromedia.com").trim().toLowerCase();
  if (normalized !== envEmail) {
    throw new Error("Unknown admin email.");
  }
  const canonical = process.env.ADMIN_EMAIL ?? "admin@yafetpromedia.com";
  await query(
    `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [canonical, hash]
  );
}

async function isAuthorizedAdminEmail(emailRaw: string): Promise<boolean> {
  const normalized = emailRaw.trim().toLowerCase();
  const envEmail = (process.env.ADMIN_EMAIL ?? "admin@yafetpromedia.com").trim().toLowerCase();
  if (normalized === envEmail) return true;
  try {
    const rows = await query<{ id: number }>(
      `SELECT id FROM admin_users WHERE LOWER(TRIM(email)) = $1 LIMIT 1`,
      [normalized]
    );
    return rows.length > 0;
  } catch {
    return normalized === envEmail;
  }
}

/**
 * Reset password using ADMIN_PASSWORD_RECOVERY_SECRET — intended when logged-out admins lose access.
 * Keeps timing-stable responses via hashed comparison on recovery inputs.
 */
export async function resetAdminPasswordWithRecovery(
  emailRaw: string,
  recoverySecret: string,
  newPassword: string
): Promise<{ ok: true } | { error: string }> {
  if (!process.env.ADMIN_PASSWORD_RECOVERY_SECRET?.trim()) {
    return { error: "Password recovery is not configured." };
  }
  if (!verifyRecoverySecret(recoverySecret)) {
    return { error: "Invalid recovery secret." };
  }
  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }
  const email = emailRaw.trim();
  if (!(await isAuthorizedAdminEmail(email))) {
    return { error: "Unknown admin email." };
  }
  try {
    await setAdminPasswordForEmail(email, newPassword);
  } catch {
    return { error: "Could not update password. Check database connection." };
  }
  return { ok: true };
}

export async function updateAdminPassword(email: string, newPassword: string) {
  try {
    await setAdminPasswordForEmail(email, newPassword);
  } catch {
    // DB unavailable; password can still be controlled via env variables.
  }
}
