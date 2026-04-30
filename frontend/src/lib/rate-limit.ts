type Entry = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Entry>();

function now() {
  return Date.now();
}

export function hitRateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number }
): { ok: true } | { ok: false; retryAfterSec: number } {
  const limit = opts?.limit ?? 10;
  const windowMs = opts?.windowMs ?? 60_000;
  const t = now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= t) {
    buckets.set(key, { count: 1, resetAt: t + windowMs });
    return { ok: true };
  }

  existing.count += 1;
  if (existing.count > limit) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - t) / 1000));
    return { ok: false, retryAfterSec };
  }
  return { ok: true };
}

export function clientIpFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

