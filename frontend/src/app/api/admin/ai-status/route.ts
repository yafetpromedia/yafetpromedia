import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { resolveActiveAiProvider } from "@/lib/ai-chat-provider";

export const runtime = "nodejs";

export async function GET() {
  const denied = await jsonForbiddenUnlessPermission("ai.view");
  if (denied) return denied;

  const freeModelConfigured = Boolean(process.env.AI_API_KEY?.trim());
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());
  const openAIConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());

  return Response.json({
    freeModelConfigured,
    geminiConfigured,
    openAIConfigured,
    activeProvider: resolveActiveAiProvider(),
    freeModel: process.env.AI_MODEL?.trim() || "claude-t0",
    freeModelBaseUrl: process.env.AI_BASE_URL?.trim() || "https://api.freemodel.dev/v1",
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    openAIModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  });
}
