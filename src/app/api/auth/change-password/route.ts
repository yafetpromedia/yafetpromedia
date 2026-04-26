import { cookies } from "next/headers";
import {
  getEmailFromSessionToken,
  getSessionCookieName,
  updateAdminPassword,
  verifyAdminCredentials,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  const email = getEmailFromSessionToken(session);

  if (!email) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  if (!verifyAdminCredentials(email, currentPassword)) {
    return Response.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  updateAdminPassword(email, newPassword);
  return Response.json({ ok: true });
}
