import type { SiteContent } from "@/lib/site-content.shared";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type ChatCompletionArgs = {
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatMessage[];
  userMessage: string;
  stream?: boolean;
};

type ChatCompletionResponse = {
  error?: { message?: string; code?: string };
  choices?: Array<{ message?: { content?: string } }>;
};

export function buildAssistantSystemPrompt(siteContent: SiteContent, businessName: string): string {
  const services = siteContent.servicesCards
    .slice(0, 6)
    .map((s) => `- ${s.title}: ${s.description}`)
    .join("\n");
  const products = siteContent.productsCards
    .slice(0, 4)
    .map((p) => `- ${p.title}: ${p.description}`)
    .join("\n");
  const systems = siteContent.systemsCards
    .slice(0, 4)
    .map((s) => `- ${s.title}`)
    .join("\n");

  return [
    `You are ${siteContent.aiName}, the live AI assistant for ${businessName}.`,
    "You represent a real digital agency that builds websites, automation, branding, media, and growth systems.",
    "",
    "Personality: warm, confident, concise, and practical — like a senior consultant on a sales call.",
    "Rules:",
    "- Keep every reply under 120 words unless the user explicitly asks for more detail.",
    "- Answer in 1–3 short paragraphs max. No markdown headers or long bullet lists.",
    "- Ask one clarifying question when scope, budget, or timeline is unclear.",
    "- Never invent prices; give ranges only when asked and note that final quotes follow discovery.",
    "- Steer toward booking a call or sending a project brief when intent is serious.",
    "- If you do not know something, say so and offer contact details.",
    "",
    `Contact email: ${siteContent.contactEmail}`,
    `Contact phone: ${siteContent.contactPhone}`,
    siteContent.whatsappNumber.trim()
      ? `WhatsApp: ${siteContent.whatsappNumber.trim()}`
      : "",
    "",
    siteContent.heroHeadline.trim()
      ? `Positioning: ${[siteContent.heroHeadline, siteContent.heroHighlight, siteContent.heroTail].filter(Boolean).join(" ")}`
      : "",
    "",
    "Core systems:",
    systems || "- Integrated digital infrastructure",
    "",
    "Services:",
    services || "- Website design, automation, growth, and security",
    "",
    "Products:",
    products || "- Mr.Software and supporting tools",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildMessagesPayload(systemPrompt: string, history: ChatMessage[], userMessage: string) {
  return [
    { role: "system" as const, content: systemPrompt },
    ...history.slice(-10).map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: "user" as const, content: userMessage },
  ];
}

export async function requestChatCompletion({
  baseUrl,
  apiKey,
  model,
  systemPrompt,
  history,
  userMessage,
}: ChatCompletionArgs): Promise<string> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.55,
      messages: buildMessagesPayload(systemPrompt, history, userMessage),
    }),
  });

  const data = (await response.json()) as ChatCompletionResponse;

  if (!response.ok || !data.choices?.length) {
    throw new Error(data.error?.message ?? "Chat provider did not return choices");
  }

  const reply = data.choices[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("Chat provider returned an empty reply");
  }

  return reply;
}

export async function requestChatCompletionStream({
  baseUrl,
  apiKey,
  model,
  systemPrompt,
  history,
  userMessage,
}: ChatCompletionArgs): Promise<Response> {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.55,
      stream: true,
      messages: buildMessagesPayload(systemPrompt, history, userMessage),
    }),
  });

  if (!response.ok || !response.body) {
    const data = (await response.json().catch(() => ({}))) as ChatCompletionResponse;
    throw new Error(data.error?.message ?? "Chat provider stream failed");
  }

  return response;
}

export function resolveFreeModelConfig() {
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: process.env.AI_BASE_URL?.trim() || "https://api.freemodel.dev/v1",
    model: process.env.AI_MODEL?.trim() || "claude-t0",
  };
}

export function resolveActiveAiProvider():
  | "FreeModel"
  | "Gemini"
  | "OpenAI"
  | "Fallback" {
  if (resolveFreeModelConfig()) return "FreeModel";
  if (process.env.GEMINI_API_KEY?.trim()) return "Gemini";
  if (process.env.OPENAI_API_KEY?.trim()) return "OpenAI";
  return "Fallback";
}

export function parseOpenAiStreamDelta(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === "[DONE]") return null;
  try {
    const json = JSON.parse(payload) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    return json.choices?.[0]?.delta?.content ?? null;
  } catch {
    return null;
  }
}
