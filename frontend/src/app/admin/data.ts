import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getSessionCookieName,
  verifySessionToken,
  getEmailFromSessionToken,
  getAdminAccessForEmail,
} from "@backend/auth";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { readSiteContent } from "@backend/site-content";
import { query } from "@db";
import { readLeadsFromFile } from "@backend/leads-file";
import { readTestimonialSubmissionsFromFile } from "@backend/testimonial-submissions-file";
import {
  AdminSection,
  DashboardAnalytics,
  TestimonialSubmission,
} from "@/app/admin/types";
import type { AdminPermission } from "@/app/admin/types";

const SECTION_PERMISSIONS: Partial<Record<AdminSection, AdminPermission>> = {
  overview: "content.view",
  hero: "content.view",
  systems: "content.view",
  explore: "content.view",
  services: "content.view",
  products: "content.view",
  caseStudies: "content.view",
  publications: "content.view",
  trust: "content.view",
  testimonials: "testimonials.view",
  processFaq: "content.view",
  contact: "content.view",
  team: "team.view",
  leads: "leads.view",
  security: "security.view",
  ai: "ai.view",
};

function hasPermission(role: "owner" | "messages", permissions: string[], required: AdminPermission): boolean {
  if (role === "owner") return true;
  return permissions.includes("*") || permissions.includes(required);
}

function sectionToPath(section: AdminSection): string {
  if (section === "overview") return "/admin";
  if (section === "caseStudies") return "/admin/case-studies";
  if (section === "processFaq") return "/admin/process-faq";
  return `/admin/${section}`;
}

function emptyAnalytics(): DashboardAnalytics {
  return {
    totals: {
      leads: 0,
      testimonialsPending: 0,
      testimonialsApproved: 0,
      testimonialsRejected: 0,
      chatTurns: 0,
      adminUsers: 0,
    },
    series: [],
    recentLeads: [],
    recentChats: [],
    siteContentUpdatedAt: null,
  };
}

async function fetchDashboardAnalytics(): Promise<DashboardAnalytics> {
  const empty = emptyAnalytics();
  try {
    const [counts] = await query<{
      leads: string;
      chats: string;
      tm_pending: string;
      tm_approved: string;
      tm_rejected: string;
      admins: string;
    }>(
      `
      SELECT
        (SELECT COUNT(*)::text FROM leads) AS leads,
        (SELECT COUNT(*)::text FROM chat_logs) AS chats,
        (SELECT COUNT(*)::text FROM testimonial_submissions WHERE status = 'pending') AS tm_pending,
        (SELECT COUNT(*)::text FROM testimonial_submissions WHERE status = 'approved') AS tm_approved,
        (SELECT COUNT(*)::text FROM testimonial_submissions WHERE status = 'rejected') AS tm_rejected,
        (SELECT COUNT(*)::text FROM admin_users) AS admins
      `
    );

    const seriesRows = await query<{ date: string; leads: string; chats: string }>(
      `
      WITH series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '29 days',
          CURRENT_DATE,
          INTERVAL '1 day'
        )::date AS day
      ),
      lead_daily AS (
        SELECT date_trunc('day', created_at)::date AS d, COUNT(*)::int AS n
        FROM leads
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY 1
      ),
      chat_daily AS (
        SELECT date_trunc('day', created_at)::date AS d, COUNT(*)::int AS n
        FROM chat_logs
        WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
        GROUP BY 1
      )
      SELECT
        series.day::text AS date,
        COALESCE(lead_daily.n, 0)::text AS leads,
        COALESCE(chat_daily.n, 0)::text AS chats
      FROM series
      LEFT JOIN lead_daily ON lead_daily.d = series.day
      LEFT JOIN chat_daily ON chat_daily.d = series.day
      ORDER BY series.day
      `
    ).catch(() => []);

    const recentLeads = await query<{
      id: number;
      name: string;
      email: string;
      company: string;
      handled: boolean;
      created_at: string;
    }>(
      `
      SELECT id, name, email, company, COALESCE(handled, false) AS handled, created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT 8
      `
    ).catch(() => []);

    const recentChats = await query<{
      id: number;
      preview: string;
      created_at: string;
    }>(
      `
      SELECT id, SUBSTRING(user_message, 1, 140) AS preview, created_at
      FROM chat_logs
      ORDER BY created_at DESC
      LIMIT 8
      `
    ).catch(() => []);

    const [updatedRow] = await query<{ updated_at: string }>(
      `SELECT updated_at::text AS updated_at FROM site_content WHERE id = 1`
    ).catch(() => []);

    const parseCt = (v: string | undefined) => Number.parseInt(v ?? "0", 10) || 0;

    const series = seriesRows.map((row) => ({
      date: row.date,
      leads: parseCt(row.leads),
      chats: parseCt(row.chats),
    }));

    return {
      totals: {
        leads: parseCt(counts?.leads),
        testimonialsPending: parseCt(counts?.tm_pending),
        testimonialsApproved: parseCt(counts?.tm_approved),
        testimonialsRejected: parseCt(counts?.tm_rejected),
        chatTurns: parseCt(counts?.chats),
        adminUsers: parseCt(counts?.admins),
      },
      series,
      recentLeads,
      recentChats,
      siteContentUpdatedAt: updatedRow?.updated_at ?? null,
    };
  } catch {
    return empty;
  }
}

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

  const viewerEmail = getEmailFromSessionToken(session);
  const viewerAccess = await getAdminAccessForEmail(viewerEmail);
  const viewerRole = viewerAccess.role;
  const viewerPermissions = viewerAccess.permissions as AdminPermission[];

  const initialRequired = SECTION_PERMISSIONS[initialSection];
  if (initialRequired && !hasPermission(viewerRole, viewerPermissions, initialRequired)) {
    const firstAllowed = (Object.entries(SECTION_PERMISSIONS) as [AdminSection, AdminPermission][])
      .find(([, required]) => hasPermission(viewerRole, viewerPermissions, required))
      ?.[0];
    redirect(firstAllowed ? sectionToPath(firstAllowed) : "/login");
  }

  const content = await readSiteContent().catch(() => defaultSiteContent);
  const fromDbLeads = await query<{
    id: number;
    name: string;
    email: string;
    company: string;
    phone: string;
    message: string;
    handled: boolean;
    created_at: string;
  }>(
    `
      SELECT id, name, email, company, COALESCE(phone, '') AS phone, message,
             COALESCE(handled, false) AS handled, created_at
      FROM leads
      ORDER BY id DESC
      LIMIT 100
    `
  ).catch(() => []);

  const fromFileLeadsRaw = await readLeadsFromFile();
  const fromFileLeads: typeof fromDbLeads = fromFileLeadsRaw.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    phone: r.phone,
    message: r.message,
    handled: r.handled ?? false,
    created_at: r.created_at,
  }));

  const leads = [...fromDbLeads, ...fromFileLeads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 100);

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

  const canViewTestimonials = hasPermission(viewerRole, viewerPermissions, "testimonials.view");

  const fromDb = canViewTestimonials
    ? await query<{
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
          WHERE status IN ('pending', 'approved', 'rejected')
          ORDER BY id DESC
          LIMIT 100
        `
      ).catch(() => [])
    : [];

  const fromFile = canViewTestimonials ? await readTestimonialSubmissionsFromFile() : [];
  const fileForAdmin: TestimonialSubmission[] = fromFile
    .filter((r) => r.status === "pending" || r.status === "approved" || r.status === "rejected")
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
    status:
      r.status === "approved"
        ? "approved"
        : r.status === "rejected"
          ? "rejected"
          : "pending",
    created_at: r.created_at,
    approved_at: r.approved_at,
  }));

  const testimonialSubmissions = canViewTestimonials
    ? [...dbForAdmin, ...fileForAdmin].sort(sortSubmissions).slice(0, 50)
    : [];

  const analytics = hasPermission(viewerRole, viewerPermissions, "content.view")
    ? await fetchDashboardAnalytics()
    : emptyAnalytics();
  if (canViewTestimonials) {
    analytics.totals.testimonialsPending = testimonialSubmissions.filter((s) => s.status === "pending").length;
  }

  return {
    content,
    leads,
    testimonialSubmissions,
    aiStatus,
    analytics,
    initialSection,
    viewerRole,
    viewerPermissions,
  };
}
