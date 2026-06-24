import { cookies } from "next/headers";
import { getSessionCookieName } from "@backend/auth";
import { csrfGuard } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return Response.json({ ok: true });
}
