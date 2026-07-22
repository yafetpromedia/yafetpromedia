import { hashAdminPasswordLegacySha256 } from "./password";

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production";
}

export function getBootstrapAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL?.trim();
  if (email) return email;
  if (isProductionEnv()) {
    throw new Error("ADMIN_EMAIL must be set in production.");
  }
  return "admin@awuddigitals.com";
}

export function hasAdminBootstrapSecret(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH?.trim() || process.env.ADMIN_PASSWORD?.trim());
}

export function resolveBootstrapPasswordHash(): string | null {
  const hashed = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hashed) return hashed;
  const plain = process.env.ADMIN_PASSWORD?.trim();
  if (plain) return hashAdminPasswordLegacySha256(plain);
  if (isProductionEnv()) return null;
  return hashAdminPasswordLegacySha256("Admin@12345");
}
