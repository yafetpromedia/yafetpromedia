import {
  BUDGET_OPTIONS,
  CONSULTANT_SYSTEM_PROMPT,
  PAYMENT_OPTIONS,
  TIMELINE_OPTIONS,
  type ConsultationPhase,
  type ProjectBrief,
} from "@/lib/project-consultant.shared";
import type { ConsultationSession } from "@/lib/project-consultant-engine";
import { requestChatCompletion, resolveFreeModelConfig } from "@/lib/ai-chat-provider";

type LlmStepResult = { reply: string };

type LlmBriefResult = {
  markdown: string;
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
      return "Ask what they want to build. One open question.";
    case "industry":
      return "Ask about their industry, niche, and what they sell or offer.";
    case "payments":
      return "Introduce payment method selection. Buttons show Chapa, Telebirr, CBE Birr, Stripe, PayPal — do not list every option in prose.";
    case "budget":
      return "Ask about estimated budget. Buttons show the budget tiers.";
    case "timeline":
      return "Ask when they need the project completed. Buttons show timeline options.";
    case "contact":
      return "Ask for name and email for follow-up. Mention they can skip to see the brief.";
    case "complete":
      return "Briefly introduce the generated project brief.";
    default:
      return "Welcome them and ask what they would like to build.";
  }
}

function sessionSnapshot(session: ConsultationSession) {
  return {
    projectType: session.projectType || null,
    industry: session.industry || null,
    products: session.requirements.products || null,
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
    "- One or two short sentences max.",
    "- Professional, warm, confident.",
    "- Ask only ONE question when gathering info.",
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

/** Full markdown brief plus structured estimates from the LLM. */
export async function generateConsultantBrief(
  session: ConsultationSession,
  fallback: ProjectBrief
): Promise<ProjectBrief> {
  const payments = session.requirements.paymentMethods ?? [];
  const prompt = [
    "Return valid JSON only with this shape:",
    "{",
    '  "markdown": "# Project Brief\\n...",',
    '  "recommendedFeatures": ["..."],',
    '  "estimatedTimeline": "4–6 Weeks",',
    '  "estimatedCost": "$3,500–$5,000",',
    '  "complexity": "Low" | "Medium" | "High",',
    '  "leadLabel": "High Potential Client"',
    "}",
    "",
    "Write a professional project brief markdown for YafetPromedia sales team.",
    "Include sections: Client Requirements, Recommended Features (with checkmarks), Estimated Timeline, Estimated Cost, Lead Score label.",
    "Base estimates on scope and budget — be realistic for Ethiopia/Africa + international clients.",
    "",
    `Project data: ${JSON.stringify({
      ...sessionSnapshot(session),
      payments,
      products: session.requirements.products || "Not specified",
    })}`,
    "",
    `Budget options reference: ${BUDGET_OPTIONS.join(", ")}`,
    `Timeline options reference: ${TIMELINE_OPTIONS.join(", ")}`,
    `Payment options reference: ${PAYMENT_OPTIONS.join(", ")}`,
  ].join("\n");

  const raw = await callConsultantLlm(
    `${CONSULTANT_SYSTEM_PROMPT}\n\nYou generate structured project briefs as JSON.`,
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
    markdown: parsed.markdown.trim(),
  };
}

export function isConsultantLlmAvailable(): boolean {
  return Boolean(resolveFreeModelConfig() || process.env.OPENAI_API_KEY?.trim());
}
