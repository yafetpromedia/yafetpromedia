import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "yafet_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is missing or too short. Set AUTH_SECRET to at least 32 characters.");
  }
  return "dev-only-auth-secret-change-me-32chars-minimum";
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function createSessionToken(email: string) {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + SESSION_MAX_AGE_MS;
  const payload = `${email}:${issuedAt}:${expiresAt}`;
  const signature = createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;
  const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
  const parts = payload.split(":");
  const expiresAt =
    parts.length >= 3
      ? Number(parts[2])
      : parts.length >= 2
        ? Number(parts[1]) + SESSION_MAX_AGE_MS
        : Number.NaN;
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }
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
