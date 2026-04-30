import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";

export const runtime = "nodejs";

export async function GET() {
  const denied = await jsonForbiddenUnlessPermission("ai.view");
  if (denied) return denied;

  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY);
  const openAIConfigured = Boolean(process.env.OPENAI_API_KEY);
  const activeProvider = geminiConfigured ? "Gemini" : openAIConfigured ? "OpenAI" : "Fallback";

  return Response.json({
    geminiConfigured,
    openAIConfigured,
    activeProvider,
    geminiModel: process.env.GEMINI_MODEL ?? "gemini-1.5-flash",
    openAIModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  });
}
