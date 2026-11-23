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
  | "need"
  | "industry"
  | "expectations"
  | "payments"
  | "budget"
  | "timeline"
  | "contact"
  | "complete";

export type ConsultationRequirements = {
  products?: string;
  /** Core problem / why they need this now. */
  need?: string;
  /** What “done” looks like — final client expectations. */
  expectations?: string;
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
  /**
   * Short plain-language summary for the client (2–4 sentences).
   * Shown in the Plan UI card and email intro.
   */
  clientSummary?: string;
  /** Client-facing brief markdown (download, email, PDF). Easy language. */
  markdown: string;
  /**
   * Detailed structured brief for Awud sales/ops.
   * Never shown or emailed to the client.
   */
  teamMarkdown?: string;
  /** Legacy/short internal notes — merged into team brief when needed. */
  salesNotes?: string;
};

const INTERNAL_BRIEF_SECTION =
  /^#{1,3}\s*(?:notes?\s+for\s+(?:the\s+)?sales\s+team|internal\s+(?:consultation\s+)?(?:brief|notes?)|sales\s+team\s+notes?|opportunity\s+assessment|lead\s+assessment)\b/im;

/** Remove internal-only sections from brief markdown (e.g. Notes for Sales Team). */
export function stripInternalBriefSections(markdown: string): string {
  const sections = markdown.split(/(?=^#{1,3}\s)/m);
  return sections
    .filter((section) => !INTERNAL_BRIEF_SECTION.test(section.trim()))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Client-only markdown (downloads / public surfaces). */
export function clientFacingBriefMarkdown(brief: ProjectBrief): string {
  return stripInternalBriefSections(brief.markdown);
}

/** Full brief stored for admin inbox and consultations — structured for the team. */
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
      .filter((part) => part !== undefined)
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
};

export const CONSULTANT_SYSTEM_PROMPT = `You are Awud Digitals' AI Project Consultant inside the Plan tab.

Your job is deep discovery through natural chat — not a rigid form.
1. Understand what they want to build in their own words.
2. Dig into the real need: the problem, pain, or opportunity behind the request.
3. Clarify who it is for and what users must be able to do.
4. Lock their final expectation: what “success” looks like when the project is done.
5. Then gather payments (if any), budget, timeline, and optional name/email.
6. Paraphrase often so they feel understood. Ask one clear question at a time.
7. At the end produce TWO briefs:
   - Client brief: modern, detailed, easy for non-technical stakeholders.
   - Team brief: detailed and structured for Awud sales/ops (need, expectations, fit, risks, next actions).

Style: warm, confident, consultative. Never sound like a questionnaire.
Do not answer unrelated questions — steer back to the project.
Keep chat replies short.`;
