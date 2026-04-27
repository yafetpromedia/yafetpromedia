import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { readSiteContent } from "@/lib/site-content";
import { query } from "@/lib/db";
import { readTestimonialSubmissionsFromFile } from "@/lib/testimonial-submissions-file";
import { AdminSection, TestimonialSubmission } from "@/app/admin/types";

function sortSubmissions(a: TestimonialSubmission, b: TestimonialSubmission): number {
  const pa = a.status === "pending" ? 0 : a.status === "approved" ? 1 : 2;
  const pb = b.status === "pending" ? 0 : b.status === "approved" ? 1 : 2;
  if (pa !== pb) return pa - pb;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

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
  ).catch(() => []);

  const fromDb = await query<{
    id: number;
    quote: string;
    author: string;
    role: string;
    email: string;
    rating: number;
    status: string;
    created_at: string;
    approved_at: string | null;
  }>(
    `
      SELECT id, quote, author, role, email, rating, status, created_at, approved_at
      FROM testimonial_submissions
      WHERE status IN ('pending', 'approved')
      ORDER BY id DESC
      LIMIT 100
    `
  ).catch(() => []);

  const fromFile = await readTestimonialSubmissionsFromFile();
  const fileForAdmin: TestimonialSubmission[] = fromFile
    .filter((r) => r.status === "pending" || r.status === "approved")
    .map((r) => ({
      id: r.id,
      quote: r.quote,
      author: r.author,
      role: r.role,
      email: r.email,
      rating: r.rating,
      status: r.status,
      created_at: r.created_at,
      approved_at: r.approved_at,
    }));

  const dbForAdmin: TestimonialSubmission[] = fromDb.map((r) => ({
    id: r.id,
    quote: r.quote,
    author: r.author,
    role: r.role,
    email: r.email,
    rating: Math.min(5, Math.max(1, Math.round(Number(r.rating)) || 5)),
    status: r.status === "approved" || r.status === "pending" ? r.status : "pending",
    created_at: r.created_at,
    approved_at: r.approved_at,
  }));

  const testimonialSubmissions = [...dbForAdmin, ...fileForAdmin].sort(sortSubmissions).slice(0, 50);

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

  return { content, leads, testimonialSubmissions, aiStatus, initialSection };
}
