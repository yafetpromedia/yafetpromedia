import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminClient from "@/app/admin/AdminClient";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { readSiteContent } from "@/lib/site-content";
import { getDb } from "@/lib/db";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  if (!verifySessionToken(session)) {
    redirect("/login");
  }
  const content = await readSiteContent();
  const leads = getDb()
    .prepare(
      `
      SELECT id, name, email, company, message, created_at
      FROM leads
      ORDER BY id DESC
      LIMIT 25
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

  return <AdminClient initialContent={content} initialLeads={leads} />;
}
