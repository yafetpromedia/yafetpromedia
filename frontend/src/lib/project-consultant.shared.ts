import type { ProjectModel } from "@/lib/project-model";

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

/** Coarse UI stage — not a questionnaire phase machine. */
export type ConsultationPhase =
  | "welcome"
  | "exploring"
  | "scoping"
  | "refining"
  | "contact"
  | "complete"
  | "intent"
  | "need"
  | "industry"
  | "expectations"
  | "payments"
  | "budget"
  | "timeline";

export type ConsultationRequirements = {
  products?: string;
  need?: string;
  expectations?: string;
  paymentMethods?: string[];
  features?: string[];
  notes?: string;
  conversationHistory?: { role: "user" | "assistant"; content: string }[];
  /** Provenance-aware structured project model. */
  projectModel?: ProjectModel;
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
  clientSummary?: string;
  markdown: string;
  teamMarkdown?: string;
  salesNotes?: string;
  preliminary?: boolean;
  documentVersion?: number;
  lastUpdated?: string;
};

const INTERNAL_BRIEF_SECTION =
  /^#{1,3}\s*(?:notes?\s+for\s+(?:the\s+)?sales\s+team|internal\s+(?:consultation\s+)?(?:brief|notes?)|sales\s+team\s+notes?|opportunity\s+assessment|lead\s+assessment)\b/im;

export function stripInternalBriefSections(markdown: string): string {
  const sections = markdown.split(/(?=^#{1,3}\s)/m);
  return sections
    .filter((section) => !INTERNAL_BRIEF_SECTION.test(section.trim()))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function clientFacingBriefMarkdown(brief: ProjectBrief): string {
  return stripInternalBriefSections(brief.markdown);
}

export function briefMarkdownForTeam(brief: ProjectBrief): string {
  const client = clientFacingBriefMarkdown(brief);
  const team = brief.teamMarkdown?.trim();
  const notes = brief.salesNotes?.trim();

  if (team) {
    const extras = notes && !team.includes(notes) ? `\n\n## Additional sales notes\n\n${notes}` : "";
    return [
      team,
      extras,
      "",
      "---",
      "",
      "## Client-facing brief (reference)",
      "",
      client,
    ]
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

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
  project?: ProjectModel;
  providerError?: boolean;
  preliminary?: boolean;
};

export const CONSULTANT_SYSTEM_PROMPT = `You are Awud Digitals' AI Project Consultant.

You are an experienced human-like digital project consultant having a real conversation — not a form, wizard, or questionnaire.

Conversation rules:
1. Respond to the meaning of the client's latest message first.
2. Acknowledge or observe naturally; vary openings — never start every reply the same way.
3. Ask at most ONE primary follow-up question when useful. Sometimes respond without a question.
4. Remember earlier facts. Never re-ask what is already known.
5. Decide adaptively what to learn next (need, users, outcome, features, constraints, budget/timeline only when appropriate).
6. Greetings like "Hey" get a warm welcome — do NOT invent a project, industry, budget, features, or integrations.
7. Never fabricate client requirements. Unknown stays unknown.
8. Separate AI suggestions from client-confirmed facts in your structured output.
9. Challenge unrealistic assumptions respectfully; explain tech in plain language.
10. Keep replies short (1–3 sentences typical). No markdown headers in reply text.

You also return structured JSON for the app to update the shared project model.`;
