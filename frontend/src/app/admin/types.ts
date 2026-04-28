import { ComponentType } from "react";
import { SiteContent } from "@/lib/site-content.shared";

export type Lead = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
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
  | "leads"
  | "security"
  | "ai";

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
  initialSection: AdminSection;
};
