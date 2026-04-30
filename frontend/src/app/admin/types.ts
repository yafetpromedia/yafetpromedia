import { ComponentType } from "react";
import { SiteContent } from "@/lib/site-content.shared";

export type Lead = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  /** When true, you marked this thread handled (replied or closed). */
  handled: boolean;
  created_at: string;
};

export type TestimonialSubmission = {
  id: number;
  quote: string;
  author: string;
  role: string;
  email: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  approved_at: string | null;
};

export type AIStatus = {
  geminiConfigured: boolean;
  openAIConfigured: boolean;
  activeProvider: "Gemini" | "OpenAI" | "Fallback";
  geminiModel: string;
  openAIModel: string;
};

export type DashboardAnalytics = {
  totals: {
    leads: number;
    /** Includes DB + file-backed submissions */
    testimonialsPending: number;
    testimonialsApproved: number;
    testimonialsRejected: number;
    chatTurns: number;
    adminUsers: number;
  };
  /** Last 30 calendar days, ISO date → counts */
  series: { date: string; leads: number; chats: number }[];
  recentLeads: {
    id: number;
    name: string;
    email: string;
    company: string;
    handled: boolean;
    created_at: string;
  }[];
  recentChats: { id: number; preview: string; created_at: string }[];
  siteContentUpdatedAt: string | null;
};

export type AdminSection =
  | "overview"
  | "hero"
  | "systems"
  | "explore"
  | "services"
  | "products"
  | "caseStudies"
  | "publications"
  | "trust"
  | "testimonials"
  | "processFaq"
  | "contact"
  | "team"
  | "leads"
  | "security"
  | "ai";

/** Primary dashboard account vs delegated inbox-only access. */
export type ViewerRole = "owner" | "messages";
export type AdminPermission =
  | "*"
  | "content.view"
  | "content.edit"
  | "leads.view"
  | "leads.edit"
  | "leads.delete"
  | "testimonials.view"
  | "testimonials.edit"
  | "testimonials.delete"
  | "team.view"
  | "team.add"
  | "team.delete"
  | "security.view"
  | "security.edit"
  | "ai.view"
  | "upload.add";

export type AdminNavItem = {
  id: AdminSection;
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
};

export type AdminClientProps = {
  initialContent: SiteContent;
  initialLeads: Lead[];
  initialTestimonialSubmissions: TestimonialSubmission[];
  aiStatus: AIStatus;
  analytics: DashboardAnalytics;
  initialSection: AdminSection;
  viewerRole: ViewerRole;
  viewerPermissions: AdminPermission[];
};
