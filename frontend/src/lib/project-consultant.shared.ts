export const PAYMENT_OPTIONS = [
  "Chapa",
  "Telebirr",
  "CBE Birr",
  "Stripe",
  "PayPal",
] as const;

export const BUDGET_OPTIONS = [
  "Under $500",
  "$500–$2,000",
  "$2,000–$10,000",
  "Enterprise",
] as const;

export const TIMELINE_OPTIONS = ["ASAP", "1 Month", "3 Months", "Flexible"] as const;

export type ConsultationPhase =
  | "welcome"
  | "intent"
  | "industry"
  | "payments"
  | "budget"
  | "timeline"
  | "contact"
  | "complete";

export type ConsultationRequirements = {
  products?: string;
  paymentMethods?: string[];
  features?: string[];
  notes?: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
  leadCreated?: boolean;
  leadId?: number;
};

export type ProjectBrief = {
  projectType: string;
  industry: string;
  products: string;
  payments: string[];
  timeline: string;
  budget: string;
  recommendedFeatures: string[];
  estimatedTimeline: string;
  estimatedCost: string;
  complexity: "Low" | "Medium" | "High";
  leadLabel: string;
  /** Client-facing brief markdown (download + display). */
  markdown: string;
  /** Internal sales notes — never shown to clients. */
  salesNotes?: string;
};

const INTERNAL_BRIEF_SECTION =
  /^#{1,3}\s*(?:notes?\s+for\s+(?:the\s+)?sales\s+team|internal\s+notes?|sales\s+team\s+notes?)\b/im;

/** Remove internal-only sections from brief markdown (e.g. Notes for Sales Team). */
export function stripInternalBriefSections(markdown: string): string {
  const sections = markdown.split(/(?=^#{1,3}\s)/m);
  return sections
    .filter((section) => !INTERNAL_BRIEF_SECTION.test(section.trim()))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Full brief stored for admin inbox and consultations — includes internal notes. */
export function briefMarkdownForTeam(brief: ProjectBrief): string {
  const client = stripInternalBriefSections(brief.markdown);
  const notes = brief.salesNotes?.trim();
  if (!notes) return client;
  return `${client}\n\n## Notes for Sales Team\n\n${notes}`;
}

export type ConsultationRecord = {
  id: number;
  session_id: string;
  project_type: string;
  industry: string;
  budget: string;
  timeline: string;
  requirements: ConsultationRequirements;
  generated_brief: string;
  lead_score: number;
  client_name: string;
  client_email: string;
  complexity: string;
  estimated_cost: string;
  estimated_timeline: string;
  status: string;
  created_at: string;
};

export type ConsultantUiChoice = {
  id: string;
  label: string;
};

export type ConsultantApiResponse = {
  reply: string;
  phase: ConsultationPhase;
  choices?: ConsultantUiChoice[];
  multiSelect?: boolean;
  complete?: boolean;
  brief?: ProjectBrief;
  consultationId?: number;
  leadScore?: number;
  sessionId: string;
};

export const CONSULTANT_SYSTEM_PROMPT = `You are YafetPromedia's AI Project Consultant.

Your job is to:
1. Understand client requirements.
2. Ask one question at a time.
3. Collect: Project Type, Industry, Features, Budget, Timeline.
4. Recommend suitable technologies.
5. Generate a professional project brief.
6. Estimate complexity: Low, Medium, or High.
7. Estimate development duration.
8. Suggest additional features.

Do not answer unrelated questions.
Keep responses short and professional.`;
