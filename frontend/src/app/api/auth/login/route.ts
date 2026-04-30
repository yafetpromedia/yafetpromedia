import { cookies } from "next/headers";
import { createSessionToken, getSessionCookieName, verifyAdminCredentials } from "@backend/auth";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const csrf = csrfGuard(request);
    if (csrf) return csrf;

    const ip = clientIpFromRequest(request);
    const limiter = hitRateLimit(`auth:login:${ip}`, { limit: 10, windowMs: 60_000 });
    if (!limiter.ok) {
      return Response.json(
        { error: "Too many login attempts. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limiter.retryAfterSec) },
        }
      );
    }

    const body = (await request.json()) as { email?: string; password?: string };
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!(await verifyAdminCredentials(email, password))) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set(getSessionCookieName(), createSessionToken(email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
