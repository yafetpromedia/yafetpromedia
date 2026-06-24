import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_PREFIX = "scrypt:";
const KEYLEN = 64;

function legacySha256Hex(plain: string) {
  return createHash("sha256").update(plain).digest("hex");
}

/** Hash a new admin password (scrypt + random salt). */
export function hashAdminPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, KEYLEN);
  return `${SCRYPT_PREFIX}${salt.toString("hex")}:${hash.toString("hex")}`;
}

/** Verify plain password against scrypt or legacy sha256 hex hash. */
export function verifyAdminPassword(plain: string, storedHash: string): boolean {
  const stored = storedHash.trim();
  if (!stored) return false;

  if (stored.startsWith(SCRYPT_PREFIX)) {
    const body = stored.slice(SCRYPT_PREFIX.length);
    const [saltHex, hashHex] = body.split(":");
    if (!saltHex || !hashHex) return false;
    try {
      const salt = Buffer.from(saltHex, "hex");
      const expected = Buffer.from(hashHex, "hex");
      const computed = scryptSync(plain, salt, expected.length);
      if (computed.length !== expected.length) return false;
      return timingSafeEqual(computed, expected);
    } catch {
      return false;
    }
  }

  const legacy = legacySha256Hex(plain);
  try {
    const a = Buffer.from(legacy, "hex");
    const b = Buffer.from(stored, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Legacy helper for env ADMIN_PASSWORD_HASH (sha256 hex). */
export function hashAdminPasswordLegacySha256(plain: string): string {
  return legacySha256Hex(plain);
}
