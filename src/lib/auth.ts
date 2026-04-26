import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";

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

export function verifyAdminCredentials(email: string, password: string) {
  const user = getDb()
    .prepare("SELECT password_hash FROM admin_users WHERE email = ? LIMIT 1")
    .get(email) as { password_hash: string } | undefined;
  if (!user) return false;
  return user.password_hash === hashText(password);
}

export function updateAdminPassword(email: string, newPassword: string) {
  return getDb()
    .prepare("UPDATE admin_users SET password_hash = ? WHERE email = ?")
    .run(hashText(newPassword), email);
}
