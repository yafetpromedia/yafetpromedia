import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { readSiteContent } from "@/lib/site-content";
import { query } from "@/lib/db";
import { AdminSection } from "@/app/admin/types";

export async function getAdminPageData(initialSection: AdminSection) {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  if (!verifySessionToken(session)) {
    redirect("/login");
  }

  const content = await readSiteContent().catch(() => defaultSiteContent);
  const leads = await query<{
    id: number;
    name: string;
    email: string;
    company: string;
    message: string;
    created_at: string;
  }>(
    `
      SELECT id, name, email, company, message, created_at
      FROM leads
      ORDER BY id DESC
      LIMIT 25
    `
  ).catch(() => []);

  const aiStatus = {
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
    activeProvider: (Boolean(process.env.GEMINI_API_KEY)
      ? "Gemini"
      : Boolean(process.env.OPENAI_API_KEY)
        ? "OpenAI"
        : "Fallback") as "Gemini" | "OpenAI" | "Fallback",
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    openAIModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  };

  return { content, leads, aiStatus, initialSection };
}
