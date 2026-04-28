import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/server/auth";
import { query } from "@/database";

export const runtime = "nodejs";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  return verifySessionToken(session);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await query<{
    id: number;
    name: string;
    email: string;
    company: string;
    phone: string;
    message: string;
    created_at: string;
  }>(
    `
      SELECT id, name, email, company, COALESCE(phone, '') AS phone, message, created_at
      FROM leads
      ORDER BY id DESC
      LIMIT 100
    `
  );

  return Response.json({ leads });
}
