const SESSION_COOKIE = "yafet_session";
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const DEV_AUTH_SECRET = "dev-only-auth-secret-change-me-32chars-minimum";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    return "";
  }
  return DEV_AUTH_SECRET;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

function base64UrlToString(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const binary = atob(padded + pad);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return bytesToBase64Url(new Uint8Array(signature));
}

function timingSafeEqualText(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Edge/middleware-safe session verification (Web Crypto, no node:crypto). */
export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const payload = base64UrlToString(encodedPayload);
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

  const secret = getAuthSecret();
  if (!secret) return false;

  const expected = await signPayload(payload, secret);
  return timingSafeEqualText(signature, expected);
}
