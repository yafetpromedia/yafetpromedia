import { NextRequest, NextResponse } from "next/server";
import { query } from "@db";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const ip = clientIpFromRequest(request);
  const limiter = hitRateLimit(`analytics:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!limiter.ok) {
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
  if (!path.startsWith("/") || path.includes("..") || path.includes("\\")) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    await query(`INSERT INTO page_views (path, referrer) VALUES ($1, $2)`, [path, referrer]);
  } catch {
    // DB optional in dev — still return ok
  }

  return NextResponse.json({ ok: true });
}
