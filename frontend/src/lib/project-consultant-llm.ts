import {
  BUDGET_OPTIONS,
  CONSULTANT_SYSTEM_PROMPT,
  PAYMENT_OPTIONS,
  TIMELINE_OPTIONS,
  stripInternalBriefSections,
  type ConsultationPhase,
  type ProjectBrief,
} from "@/lib/project-consultant.shared";
import type { ConsultationSession } from "@/lib/project-consultant-engine";
import { requestChatCompletion, resolveFreeModelConfig } from "@/lib/ai-chat-provider";

type LlmStepResult = { reply: string };

type LlmBriefResult = {
  /** Plain-language client brief markdown. */
  markdown: string;
  /** Short 2–4 sentence client summary. */
  clientSummary?: string;
  /** Detailed structured internal brief for Awud. */
  teamMarkdown?: string;
  /** Short extras; merged into team storage if needed. */
  salesNotes?: string;
  recommendedFeatures: string[];
  estimatedTimeline: string;
  estimatedCost: string;
  complexity: "Low" | "Medium" | "High";
  leadLabel: string;
};

function extractJson<T>(raw: string): T | null {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence?.[1]?.trim() ?? trimmed;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    } catch {
      return null;
    }
  }
}

function phaseGoal(phase: ConsultationPhase): string {
  switch (phase) {
    case "intent":
      return "Welcome them warmly and invite them to describe what they want to build in their own words.";
    case "need":
      return "Paraphrase the idea briefly, then dig into the real need: what problem, pain, or opportunity makes this necessary now? Ask for concrete detail.";
    case "industry":
      return "Acknowledge the need, then ask who this is for (audience/industry) and what those people must be able to do.";
    case "expectations":
      return "Confirm audience/scope, then ask what success looks like when the project is finished — their final expectation in plain terms (outcomes, not tech features).";
    case "payments":
      return "Acknowledge their success criteria, then ask how payments should work (if at all). Invite free typing or suggestion chips — do not dump every payment brand.";
    case "budget":
      return "Acknowledge payments (or that none are needed), then ask for a realistic budget range in conversational language.";
    case "timeline":
      return "Acknowledge budget, then ask when they want to launch — conversational, not form-like.";
    case "contact":
      return "Acknowledge timeline, then ask for name + email so Awud can send the brief, and mention they can skip to preview it.";
    case "complete":
      return "Celebrate briefly and introduce the personalized project brief without sounding like a template.";
    default:
      return "Welcome them and ask what they would like to build.";
  }
}

function sessionSnapshot(session: ConsultationSession) {
  return {
    projectType: session.projectType || null,
    industry: session.industry || null,
    products: session.requirements.products || null,
    need: session.requirements.need || null,
    expectations: session.requirements.expectations || null,
    paymentMethods: session.requirements.paymentMethods ?? [],
    budget: session.budget || null,
    timeline: session.timeline || null,
    clientName: session.clientName || null,
    clientEmail: session.clientEmail || null,
  };
}

async function callConsultantLlm(system: string, user: string): Promise<string | null> {
  const freeModel = resolveFreeModelConfig();
  if (freeModel) {
    try {
      return await requestChatCompletion({
        ...freeModel,
        systemPrompt: system,
        history: [],
        userMessage: user,
      });
    } catch (err) {
      console.error("[consultant-llm] FreeModel failed:", err);
    }
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (openAiKey) {
    try {
      return await requestChatCompletion({
        baseUrl: "https://api.openai.com/v1",
        apiKey: openAiKey,
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
        systemPrompt: system,
        history: [],
        userMessage: user,
      });
    } catch (err) {
      console.error("[consultant-llm] OpenAI failed:", err);
    }
  }

  return null;
}

/** Natural follow-up question or acknowledgment for the current step. */
export async function generateConsultantStepReply(
  session: ConsultationSession,
  userInput: string,
  nextPhase: ConsultationPhase,
  fallbackReply: string
): Promise<string> {
  const history = session.requirements.conversationHistory ?? [];
  const recent = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "Client" : "Consultant"}: ${m.content}`)
    .join("\n");

  const prompt = [
    "Return valid JSON only: { \"reply\": \"...\" }",
    "",
    `Next phase: ${nextPhase}`,
    `Goal: ${phaseGoal(nextPhase)}`,
    "",
    "Rules:",
    "- Sound like a real consultant chatting — not a survey form.",
    "- First paraphrase or acknowledge what they just said in plain language.",
    "- Then ask exactly ONE next question that deepens understanding of need or final expectations when relevant.",
    "- If their answer is vague, gently ask for a concrete example — still only one question.",
    "- 1–3 short sentences max. No markdown headers or bullet dumps.",
    "- Optional suggestion chips exist in the UI; invite typing freely.",
    "- Do not answer unrelated questions — redirect to the project.",
    "",
    `Collected: ${JSON.stringify(sessionSnapshot(session))}`,
    recent ? `Recent conversation:\n${recent}` : "",
    userInput ? `Client just said: ${userInput}` : "Conversation is starting.",
    "",
    `If stuck, use this fallback tone: ${fallbackReply}`,
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await callConsultantLlm(CONSULTANT_SYSTEM_PROMPT, prompt);
  if (!raw) return fallbackReply;

  const parsed = extractJson<LlmStepResult>(raw);
  const reply = parsed?.reply?.trim();
  return reply && reply.length <= 500 ? reply : fallbackReply;
}

/** Dual briefs: plain-language client + structured internal team. */
export async function generateConsultantBrief(
  session: ConsultationSession,
  fallback: ProjectBrief
): Promise<ProjectBrief> {
  const payments = session.requirements.paymentMethods ?? [];
  const history = session.requirements.conversationHistory ?? [];
  const recentChat = history
    .slice(-12)
    .map((m) => `${m.role === "user" ? "Client" : "Consultant"}: ${m.content}`)
    .join("\n");

  const prompt = [
    "Return valid JSON only with this shape:",
    "{",
    '  "clientSummary": "2–4 plain sentences the client instantly understands",',
    '  "markdown": "# Your Project Brief\\n...",',
    '  "teamMarkdown": "# Internal Consultation Brief\\n...",',
    '  "salesNotes": "Optional short extras for sales",',
    '  "recommendedFeatures": ["..."],',
    '  "estimatedTimeline": "4–6 Weeks",',
    '  "estimatedCost": "$3,500–$5,000",',
    '  "complexity": "Low" | "Medium" | "High",',
    '  "leadLabel": "High Potential Client"',
    "}",
    "",
    "=== CLIENT BRIEF (markdown + clientSummary) ===",
    "Audience: non-technical founders/managers. Modern, clear, warm — never sales-jargon heavy.",
    "clientSummary: 2–4 short sentences covering the need AND what success looks like.",
    "markdown MUST use these sections (## headings):",
    "  In plain terms | What you need | What success looks like | What you told us | What we’ll include | Timeline & investment | Next steps",
    "Ground ‘What you need’ and ‘What success looks like’ in what the client said — do not invent.",
    "Use everyday language. Explain features as benefits, not tech buzzwords.",
    "Do NOT include lead score, complexity labels, upsell tactics, or internal notes in markdown.",
    "",
    "=== TEAM BRIEF (teamMarkdown) ===",
    "Audience: Awud Digitals sales/ops. Detailed and structured for handoff.",
    "teamMarkdown MUST use these sections (## headings):",
    "  Opportunity snapshot | Core need (why now) | Final expectations (definition of done) | Requirements (structured) | Recommended feature set | Fit & delivery notes | Conversation signals | Open questions / risks | Recommended next actions",
    "Include lead label, complexity, budget/timeline fit, risks, and concrete next actions.",
    "Never put teamMarkdown content into the client markdown.",
    "",
    "Base estimates on scope and budget — realistic for Ethiopia/Africa + international clients.",
    "",
    `Project data: ${JSON.stringify({
      ...sessionSnapshot(session),
      payments,
      products: session.requirements.products || "Not specified",
    })}`,
    recentChat ? `Conversation:\n${recentChat}` : "",
    "",
    `Budget options reference: ${BUDGET_OPTIONS.join(", ")}`,
    `Timeline options reference: ${TIMELINE_OPTIONS.join(", ")}`,
    `Payment options reference: ${PAYMENT_OPTIONS.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const raw = await callConsultantLlm(
    `${CONSULTANT_SYSTEM_PROMPT}\n\nYou produce TWO briefs in one JSON: a client-friendly proposal and a detailed internal consultation brief.`,
    prompt
  );
  if (!raw) return fallback;

  const parsed = extractJson<LlmBriefResult>(raw);
  if (!parsed?.markdown?.trim()) return fallback;

  const complexity =
    parsed.complexity === "Low" || parsed.complexity === "Medium" || parsed.complexity === "High"
      ? parsed.complexity
      : fallback.complexity;

  return {
    projectType: session.projectType || fallback.projectType,
    industry: session.industry || fallback.industry,
    products: session.requirements.products?.trim() || fallback.products,
    payments,
    timeline: session.timeline || fallback.timeline,
    budget: session.budget || fallback.budget,
    recommendedFeatures:
      parsed.recommendedFeatures?.length ? parsed.recommendedFeatures.slice(0, 12) : fallback.recommendedFeatures,
    estimatedTimeline: parsed.estimatedTimeline?.trim() || fallback.estimatedTimeline,
    estimatedCost: parsed.estimatedCost?.trim() || fallback.estimatedCost,
    complexity,
    leadLabel: parsed.leadLabel?.trim() || fallback.leadLabel,
    clientSummary: parsed.clientSummary?.trim() || fallback.clientSummary,
    markdown: stripInternalBriefSections(parsed.markdown.trim()),
    teamMarkdown: parsed.teamMarkdown?.trim() || fallback.teamMarkdown,
    salesNotes: parsed.salesNotes?.trim() || undefined,
  };
}

export function isConsultantLlmAvailable(): boolean {
  return Boolean(resolveFreeModelConfig() || process.env.OPENAI_API_KEY?.trim());
}
