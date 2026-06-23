import { NextRequest, NextResponse } from "next/server";
import { query } from "@db";

export const runtime = "nodejs";

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 120;
const hits = new Map<string, { count: number; reset: number }>();

function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.reset) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= RATE_MAX;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: { path?: string; referrer?: string };
  try {
    body = (await request.json()) as { path?: string; referrer?: string };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = String(body.path ?? "/").slice(0, 500);
  const referrer = String(body.referrer ?? "").slice(0, 500);
  if (!path.startsWith("/")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await query(`INSERT INTO page_views (path, referrer) VALUES ($1, $2)`, [path, referrer]);
  } catch {
    // DB optional in dev — still return ok
  }

  return NextResponse.json({ ok: true });
}
