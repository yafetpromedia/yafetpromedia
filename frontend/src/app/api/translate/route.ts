import { NextResponse } from "next/server";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BATCH = 20;
const MAX_TEXT_LEN = 320;
const CACHE_MAX = 3000;

const cache = new Map<string, string>();

function cacheGet(key: string) {
  return cache.get(key);
}

function cacheSet(key: string, value: string) {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first !== undefined) cache.delete(first);
  }
  cache.set(key, value);
}

function toTarget(target: string): string {
  const t = target.trim();
  if (t === "zh") return "zh-CN";
  return t;
}

function looksTranslated(target: string, source: string, translated: string) {
  const s = source.trim();
  const t = translated.trim();
  if (!t || t === s) return false;
  if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|^Sorry/i.test(t)) return false;
  // Reject truncated echo of the English source
  if (s.startsWith(t) && t.length >= 24) return false;
  if (t.startsWith(s.slice(0, Math.min(48, s.length))) && t.length < s.length) return false;

  if (target === "am" || target === "ti") {
    return /[\u1200-\u137F]/.test(t); // Ethiopic
  }
  if (target === "ar") return /[\u0600-\u06FF]/.test(t);
  if (target === "zh-CN" || target === "zh") return /[\u4e00-\u9fff]/.test(t);
  if (target === "hi") return /[\u0900-\u097F]/.test(t);
  if (target === "ru") return /[\u0400-\u04FF]/.test(t);
  if (target === "ja") return /[\u3040-\u30ff\u4e00-\u9faf]/.test(t);
  if (target === "ko") return /[\uac00-\ud7af]/.test(t);
  // Latin-script targets: require a clear difference
  return t.toLowerCase() !== s.toLowerCase();
}

async function translateViaChromeDict(text: string, target: string): Promise<string | null> {
  const url = new URL("https://clients5.google.com/translate_a/t");
  url.searchParams.set("client", "dict-chrome-ex");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", toTarget(target));
  url.searchParams.set("q", text);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as unknown;
  let out = "";
  if (Array.isArray(data)) {
    if (typeof data[0] === "string") out = data[0];
    else if (Array.isArray(data[0]) && typeof data[0][0] === "string") out = data[0][0];
  }
  out = out.trim();
  return looksTranslated(target, text, out) ? out : null;
}

async function translateOne(text: string, target: string): Promise<string | null> {
  const key = `${target}::${text}`;
  const hit = cacheGet(key);
  if (hit !== undefined) return hit;

  const payload = text.length > MAX_TEXT_LEN ? text.slice(0, MAX_TEXT_LEN) : text;
  const out = await translateViaChromeDict(payload, target);
  if (!out) return null;
  cacheSet(key, out);
  return out;
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

export async function POST(req: Request) {
  const ip = clientIpFromRequest(req);
  const limited = hitRateLimit(`translate:${ip}`, { limit: 300, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many translation requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  let body: { texts?: unknown; target?: unknown };
  try {
    body = (await req.json()) as { texts?: unknown; target?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const target = typeof body.target === "string" ? body.target.trim() : "";
  if (!target || target.length > 12 || target.toLowerCase() === "en") {
    return NextResponse.json({ error: "Invalid target language" }, { status: 400 });
  }

  if (!Array.isArray(body.texts)) {
    return NextResponse.json({ error: "texts must be an array" }, { status: 400 });
  }

  const texts = body.texts
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, MAX_BATCH);

  if (texts.length === 0) {
    return NextResponse.json({ translations: [] });
  }

  try {
    // null = failed; client keeps English and does not cache
    const translations = await mapPool(texts, 3, async (text) => {
      try {
        return await translateOne(text, target);
      } catch {
        return null;
      }
    });
    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ error: "Translation failed" }, { status: 502 });
  }
}
