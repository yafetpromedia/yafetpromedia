import {
  CONSULTANT_SYSTEM_PROMPT,
  type ProjectBrief,
} from "@/lib/project-consultant.shared";
import type { ConsultationSession, OrchestratorTurnResult } from "@/lib/project-consultant-engine";
import { getProjectModel } from "@/lib/project-consultant-engine";
import {
  hasClientSubstance,
  isGreetingOnly,
  type ExtractedUpdate,
  type OpenQuestion,
  type RecommendationItem,
} from "@/lib/project-model";
import { requestChatCompletion, resolveFreeModelConfig } from "@/lib/ai-chat-provider";

type LlmOrchestratorJson = {
  reply?: string;
  extractedUpdates?: ExtractedUpdate[];
  openQuestions?: OpenQuestion[];
  recommendations?: RecommendationItem[];
  canOfferPreliminaryBrief?: boolean;
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

async function callGemini(system: string, user: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (!geminiKey) return null;
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.5-flash-lite";
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0.55 },
        }),
      }
    );
    const data = (await response.json()) as {
      error?: { message?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    if (!response.ok || !data.candidates?.length) {
      throw new Error(data.error?.message ?? "Gemini did not return a candidate");
    }
    const text = data.candidates[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
    return text || null;
  } catch (err) {
    console.error("[consultant-llm] Gemini failed:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function callConsultantLlm(system: string, user: string): Promise<string | null> {
  const gemini = await callGemini(system, user);
  if (gemini) return gemini;

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

  return null;
}

export function isConsultantLlmAvailable(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      resolveFreeModelConfig()
  );
}

function sanitizeUpdates(raw: ExtractedUpdate[] | undefined): ExtractedUpdate[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((u) => u && typeof u.path === "string" && u.value != null)
    .map((u) => ({
      path: String(u.path).slice(0, 80),
      value: u.value,
      status: u.status,
      confidence: typeof u.confidence === "number" ? u.confidence : undefined,
    }))
    .slice(0, 12);
}

/** Main conversational turn — LLM owns reasoning; app validates merges. */
export async function orchestrateConsultantTurn(
  session: ConsultationSession,
  userMessage: string
): Promise<OrchestratorTurnResult> {
  if (isGreetingOnly(userMessage)) {
    return { reply: "Hey! What are you thinking about building?" };
  }

  const model = getProjectModel(session);
  const history = (session.requirements.conversationHistory ?? [])
    .slice(-12)
    .map((m) => `${m.role === "user" ? "Client" : "Consultant"}: ${m.content}`)
    .join("\n");

  const prompt = [
    "Return valid JSON only with this shape:",
    "{",
    '  "reply": "natural conversational response",',
    '  "extractedUpdates": [{ "path": "identity.projectType", "value": "...", "status": "client_provided", "confidence": 0.8 }],',
    '  "openQuestions": [{ "id": "q1", "question": "...", "area": "users|need|budget|timeline|payments|features|tech", "priority": "high" }],',
    '  "recommendations": [{ "id": "r1", "category": "feature", "title": "...", "detail": "...", "status": "ai_suggested" }],',
    '  "canOfferPreliminaryBrief": false',
    "}",
    "",
    "Allowed update paths only:",
    "identity.name|projectType|industry|shortDescription|vision|problem|opportunity",
    "stakeholders.clientName|organization|clientEmail|intendedUsers",
    "scope.objectives|products|deliverables|exclusions|platforms|integrations",
    "technical.architecture|stack|hosting|security",
    "commercial.clientBudget|estimatedCost|currency|paymentMethods",
    "timeline.clientTimeline|estimatedDuration|phases",
    "",
    "Critical anti-hallucination rules:",
    "- Only extract facts the client actually stated or clearly confirmed.",
    "- Never invent budget, deadline, integrations, client name, or features.",
    "- commercial.clientBudget and timeline.clientTimeline must be client_provided only.",
    "- estimatedCost / estimatedDuration may be ai_suggested only when you have real scope — label them as estimates in reply if mentioned.",
    "- If the message is vague, ask one clarifying question; leave extractedUpdates empty or minimal.",
    "- Do not re-ask facts already present in Current project model.",
    "",
    `Current project model: ${JSON.stringify(model)}`,
    history ? `Recent conversation:\n${history}` : "",
    `Client just said: ${userMessage}`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!isConsultantLlmAvailable()) {
    return {
      reply:
        "I’m having trouble reaching the AI service right now. Please try again in a moment — I won’t invent project details while offline.",
      providerFailed: true,
    };
  }

  const raw = await callConsultantLlm(CONSULTANT_SYSTEM_PROMPT, prompt);
  if (!raw) {
    return {
      reply:
        "I couldn’t get a response from the AI service. Please retry — your previous details are still saved in the plan.",
      providerFailed: true,
    };
  }

  const parsed = extractJson<LlmOrchestratorJson>(raw);
  if (!parsed?.reply?.trim()) {
    return {
      reply:
        "I received an unusable AI response. Please try sending that again — I won’t guess your requirements.",
      providerFailed: true,
    };
  }

  const reply = parsed.reply.trim().slice(0, 800);
  const updates = sanitizeUpdates(parsed.extractedUpdates);
  const openQuestions = Array.isArray(parsed.openQuestions)
    ? parsed.openQuestions.slice(0, 8).map((q, i) => ({
        id: String(q.id || `q-${i}`).slice(0, 40),
        question: String(q.question || "").slice(0, 280),
        area: String(q.area || "general").slice(0, 40),
        priority: (q.priority === "high" || q.priority === "low" ? q.priority : "medium") as
          | "high"
          | "medium"
          | "low",
      }))
    : [];
  const recommendations = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.slice(0, 8).map((r, i) => ({
        id: String(r.id || `r-${i}`).slice(0, 40),
        category: (r.category || "other") as RecommendationItem["category"],
        title: String(r.title || "").slice(0, 120),
        detail: String(r.detail || "").slice(0, 500),
        status: "ai_suggested" as const,
      }))
    : [];

  return {
    reply,
    extractedUpdates: updates,
    openQuestions,
    recommendations,
    offerBrief: Boolean(parsed.canOfferPreliminaryBrief) && hasClientSubstance(model),
  };
}

/** @deprecated Prefer orchestrateConsultantTurn — kept for transitional imports. */
export async function generateConsultantStepReply(
  session: ConsultationSession,
  userInput: string,
  _nextPhase: string,
  fallbackReply: string
): Promise<string> {
  const result = await orchestrateConsultantTurn(session, userInput || "continue");
  return result.reply || fallbackReply;
}

/** Brief is built from the model; optional light wording polish only (not new facts). */
export async function generateConsultantBrief(
  session: ConsultationSession,
  fallback: ProjectBrief
): Promise<ProjectBrief> {
  // Grounded brief is authoritative — do not let LLM invent sections.
  return fallback;
}

export { hasClientSubstance };
