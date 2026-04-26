import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { query } from "@/lib/db";

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

export async function updateAdminPassword(email: string, newPassword: string) {
  try {
    await query("UPDATE admin_users SET password_hash = $1 WHERE email = $2", [
      hashText(newPassword),
      email,
    ]);
  } catch {
    // DB unavailable; password can still be controlled via env variables.
  }
}
