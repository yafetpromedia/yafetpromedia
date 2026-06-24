import { createHash, timingSafeEqual } from "node:crypto";
import { query } from "@db";
import { getBootstrapAdminEmail, isProductionEnv } from "./env-admin";
import { hashAdminPassword, verifyAdminPassword } from "./password";
import {
  createSessionToken,
  getEmailFromSessionToken,
  getSessionCookieName,
  verifySessionToken,
} from "./session-token";

export {
  createSessionToken,
  getEmailFromSessionToken,
  getSessionCookieName,
  verifySessionToken,
};

export { hashAdminPassword };

export type AdminRole = "owner" | "messages";
export type AdminPermission = string;

const DEFAULT_MESSAGES_PERMISSIONS: AdminPermission[] = [
  "leads.view",
  "leads.edit",
  "security.view",
  "security.edit",
];

const OWNER_PERMISSIONS: AdminPermission[] = ["*"];

export type AdminAccess = {
  role: AdminRole;
  permissions: AdminPermission[];
  isPrimary: boolean;
};

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

function primaryOwnerAccess(isPrimary: boolean): AdminAccess {
  return { role: "owner", permissions: OWNER_PERMISSIONS, isPrimary };
}

export async function getAdminAccessForEmail(
  email: string | null | undefined
): Promise<AdminAccess | null> {
  const normalized = String(email ?? "").trim().toLowerCase();
  if (!normalized) return null;

  const envEmail = getBootstrapAdminEmail().trim().toLowerCase();
  const isPrimary = normalized === envEmail;

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
        return primaryOwnerAccess(true);
      }
      return { role, permissions, isPrimary: false };
    }

    if (isPrimary) {
      return primaryOwnerAccess(true);
    }
    return null;
  } catch {
    if (isPrimary) {
      return primaryOwnerAccess(true);
    }
    return null;
  }
}

export async function getAdminRoleForEmail(email: string | null | undefined): Promise<AdminRole | null> {
  const access = await getAdminAccessForEmail(email);
  return access?.role ?? null;
}

export async function getAdminPermissionsForEmail(
  email: string | null | undefined
): Promise<AdminPermission[]> {
  const access = await getAdminAccessForEmail(email);
  return access?.permissions ?? [];
}

export async function getAdminRoleFromSession(sessionToken?: string | null): Promise<AdminRole | null> {
  if (!verifySessionToken(sessionToken)) return null;
  const email = getEmailFromSessionToken(sessionToken);
  return getAdminRoleForEmail(email);
}

function verifyAgainstEnv(email: string, password: string): boolean {
  if (isProductionEnv() && !process.env.ADMIN_PASSWORD_HASH?.trim() && !process.env.ADMIN_PASSWORD?.trim()) {
    return false;
  }
  const adminEmail = getBootstrapAdminEmail();
  const hashedPassword = process.env.ADMIN_PASSWORD_HASH?.trim();
  const plainPassword = process.env.ADMIN_PASSWORD?.trim();
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  if (hashedPassword) {
    return verifyAdminPassword(password, hashedPassword);
  }
  if (plainPassword) return password === plainPassword;
  if (isProductionEnv()) return false;
  return password === "Admin@12345";
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = String(email).trim().toLowerCase();
  try {
    const users = await query<{ password_hash: string }>(
      "SELECT password_hash FROM admin_users WHERE LOWER(TRIM(email)) = $1 LIMIT 1",
      [normalizedEmail]
    );
    const user = users[0];
    if (!user) return verifyAgainstEnv(normalizedEmail, password);
    const ok = verifyAdminPassword(password, user.password_hash);
    if (ok && !user.password_hash.startsWith("scrypt:")) {
      const upgraded = hashAdminPassword(password);
      await query("UPDATE admin_users SET password_hash = $1 WHERE LOWER(TRIM(email)) = $2", [
        upgraded,
        normalizedEmail,
      ]).catch(() => undefined);
    }
    return ok;
  } catch {
    return verifyAgainstEnv(normalizedEmail, password);
  }
}

function verifyRecoverySecret(submitted: string): boolean {
  const configured = process.env.ADMIN_PASSWORD_RECOVERY_SECRET?.trim();
  if (!configured || !submitted.trim()) return false;
  const aHex = createHash("sha256").update(submitted.trim()).digest("hex");
  const bHex = createHash("sha256").update(configured).digest("hex");
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
  const hash = hashAdminPassword(newPasswordPlain);
  const normalized = emailRaw.trim().toLowerCase();
  const updated = await query<{ id: number }>(
    `UPDATE admin_users SET password_hash = $1 WHERE LOWER(TRIM(email)) = $2 RETURNING id`,
    [hash, normalized]
  );
  if (updated.length > 0) return;
  const envEmail = getBootstrapAdminEmail().trim().toLowerCase();
  if (normalized !== envEmail) {
    throw new Error("Unknown admin email.");
  }
  const canonical = getBootstrapAdminEmail();
  await query(
    `INSERT INTO admin_users (email, password_hash) VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [canonical, hash]
  );
}

async function isAuthorizedAdminEmail(emailRaw: string): Promise<boolean> {
  const normalized = emailRaw.trim().toLowerCase();
  const envEmail = getBootstrapAdminEmail().trim().toLowerCase();
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
