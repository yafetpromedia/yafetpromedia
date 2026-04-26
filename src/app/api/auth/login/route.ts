import { cookies } from "next/headers";
import { createSessionToken, getSessionCookieName, verifyAdminCredentials } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");

  if (!verifyAdminCredentials(email, password)) {
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
}
