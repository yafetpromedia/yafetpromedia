import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/server/auth";

export const runtime = "nodejs";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  return verifySessionToken(session);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
