import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { getDb } from "@/lib/db";

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

  const leads = getDb()
    .prepare(
      `
      SELECT id, name, email, company, message, created_at
      FROM leads
      ORDER BY id DESC
      LIMIT 100
    `
    )
    .all() as Array<{
    id: number;
    name: string;
    email: string;
    company: string;
    message: string;
    created_at: string;
  }>;

  return Response.json({ leads });
}
