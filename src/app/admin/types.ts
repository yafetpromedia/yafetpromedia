import { ComponentType } from "react";
import { SiteContent } from "@/lib/site-content.shared";

export type Lead = {
  id: number;
  name: string;
  email: string;
  company: string;
  message: string;
  created_at: string;
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
  | "services"
  | "products"
  | "caseStudies"
  | "trust"
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
  aiStatus: AIStatus;
  initialSection: AdminSection;
};
