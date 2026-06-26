import { readSiteContent } from "@backend/site-content";
import { query } from "@db";
import {
  buildAssistantSystemPrompt,
  parseOpenAiStreamDelta,
  requestChatCompletion,
  requestChatCompletionStream,
  resolveFreeModelConfig,
} from "@/lib/ai-chat-provider";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";
import { AI_PLAN_ACTION_MARKER } from "@/lib/ai-hub.shared";

type ChatMessage = { role: "user" | "assistant"; content: string };
export const runtime = "nodejs";

const MAX_USER_MESSAGE = 2000;
const MAX_HISTORY = 12;

async function logChat(userMessage: string, reply: string) {
  try {
    await query("INSERT INTO chat_logs (user_message, ai_reply) VALUES ($1, $2)", [
      userMessage,
      reply,
    ]);
  } catch {
    // Chat should still work if logging fails.
  }
}

function offlineReply(userMessage: string, businessName: string, siteContent?: Awaited<ReturnType<typeof readSiteContent>>) {
  const lower = userMessage.toLowerCase();
  const about = siteContent?.aboutYafet;
  if (
    about &&
    (lower.includes("owner") ||
      lower.includes("founder") ||
      lower.includes("who runs") ||
      lower.includes("who is yafet") ||
      lower.includes("who started") ||
      lower.includes("ceo"))
  ) {
    return `${about.pageTitle} is the founder and owner of ${businessName} — ${about.pageSubtitle}. ${about.heroTagline} Read the full story at /about/yafet or contact us at ${siteContent?.contactEmail ?? "hello@yafetpromedia.com"}.`;
  }
  if (lower.includes("price") || lower.includes("cost") || lower.includes("budget")) {
    return `Pricing depends on scope — websites, automation, and branding bundles are quoted after a short discovery call. For a tailored estimate, open the Plan tab in this chat panel — it walks you through scope and generates a project brief.\n${AI_PLAN_ACTION_MARKER}`;
  }
  if (lower.includes("time") || lower.includes("timeline") || lower.includes("how long")) {
    return "Most website and brand projects land in 3–8 weeks. Larger systems with integrations or Mr.Software rollout can take longer — we map milestones in discovery.";
  }
  if (
    lower.includes("project") ||
    lower.includes("quote") ||
    lower.includes("proposal") ||
    lower.includes("build") ||
    lower.includes("start") ||
    lower.includes("plan my") ||
    lower.includes("website") ||
    lower.includes("app")
  ) {
    return `Great — the Plan tab in this panel is built for that. It asks a few quick questions and generates a project brief with features, timeline, and cost range.\n${AI_PLAN_ACTION_MARKER}`;
  }
  if (lower.includes("service") || lower.includes("what do you do") || lower.includes("mr.software")) {
    return "We design and build full digital systems: websites, automation workflows, brand and media pipelines, and our Mr.Software platform for operations. What are you trying to launch or fix first?";
  }
  return `Thanks for reaching ${businessName}. Tell me your goals, timeline, and budget range — I’ll point you to the right package or book a call with the team.`;
}

async function streamOpenAiCompatibleReply(
  upstream: Response,
  userMessage: string
): Promise<Response> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullReply = "";

  const stream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const delta = parseOpenAiStreamDelta(line);
            if (!delta) continue;
            fullReply += delta;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`));
          }
        }
        if (!fullReply.trim()) {
          throw new Error("Empty stream response");
        }
        await logChat(userMessage, fullReply.trim());
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
        controller.close();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Stream failed";
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: Request) {
  try {
    const csrf = csrfGuard(request);
    if (csrf) return csrf;

    const ip = clientIpFromRequest(request);
    const limiter = hitRateLimit(`ai-chat:${ip}`, { limit: 15, windowMs: 60_000 });
    if (!limiter.ok) {
      return Response.json(
        { reply: "Too many messages. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limiter.retryAfterSec) } }
      );
    }

    const body = (await request.json()) as {
      message?: string;
      history?: ChatMessage[];
      businessName?: string;
      stream?: boolean;
    };
    const userMessage = (body.message ?? "").trim();
    const businessName = (body.businessName ?? "Yafetpromedia").slice(0, 80);
    const siteContent = await readSiteContent();
    const wantsStream = Boolean(body.stream);

    if (!userMessage) {
      return Response.json({ reply: "Please share your question so I can help." }, { status: 400 });
    }
    if (userMessage.length > MAX_USER_MESSAGE) {
      return Response.json({ reply: "Message is too long. Please shorten it." }, { status: 400 });
    }

    const history = (body.history ?? []).slice(-MAX_HISTORY);
    const systemPrompt = buildAssistantSystemPrompt(siteContent, businessName);
    const fallbackReply = `Thanks for reaching ${businessName}. You can contact us at ${siteContent.contactEmail}.`;

    let providerError: string | null = null;

    const freeModel = resolveFreeModelConfig();
    if (freeModel) {
      try {
        if (wantsStream) {
          const upstream = await requestChatCompletionStream({
            baseUrl: freeModel.baseUrl,
            apiKey: freeModel.apiKey,
            model: freeModel.model,
            systemPrompt,
            history,
            userMessage,
          });
          return streamOpenAiCompatibleReply(upstream, userMessage);
        }

        const reply = await requestChatCompletion({
          baseUrl: freeModel.baseUrl,
          apiKey: freeModel.apiKey,
          model: freeModel.model,
          systemPrompt,
          history,
          userMessage,
        });
        await logChat(userMessage, reply);
        return Response.json({ reply, provider: "FreeModel" });
      } catch (error) {
        providerError = error instanceof Error ? error.message : "FreeModel request failed";
        console.error("FreeModel request failed", {
          model: freeModel.model,
          baseUrl: freeModel.baseUrl,
          reason: providerError,
        });
      }
    }

    const openAiKey = process.env.OPENAI_API_KEY?.trim();
    if (openAiKey) {
      const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
      try {
        if (wantsStream) {
          const upstream = await requestChatCompletionStream({
            baseUrl: "https://api.openai.com/v1",
            apiKey: openAiKey,
            model,
            systemPrompt,
            history,
            userMessage,
          });
          return streamOpenAiCompatibleReply(upstream, userMessage);
        }

        const reply = await requestChatCompletion({
          baseUrl: "https://api.openai.com/v1",
          apiKey: openAiKey,
          model,
          systemPrompt,
          history,
          userMessage,
        });
        await logChat(userMessage, reply);
        return Response.json({ reply, provider: "OpenAI" });
      } catch (error) {
        providerError = error instanceof Error ? error.message : "OpenAI request failed";
        console.error("OpenAI request failed", { model, reason: providerError });
      }
    }

    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    if (geminiKey) {
      const preferredGeminiModel = process.env.GEMINI_MODEL ?? "gemini-1.5-flash-latest";
      const geminiModels = [
        preferredGeminiModel,
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash",
      ].filter((model, index, all) => model && all.indexOf(model) === index);

      for (const geminiModel of geminiModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": geminiKey,
              },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemPrompt }] },
                contents: [
                  ...(history.slice(-10).map((item) => ({
                    role: item.role === "assistant" ? "model" : "user",
                    parts: [{ text: item.content }],
                  })) as Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>),
                  { role: "user", parts: [{ text: userMessage }] },
                ],
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

          const reply = data.candidates[0]?.content?.parts?.[0]?.text?.trim() ?? fallbackReply;
          await logChat(userMessage, reply);
          return Response.json({ reply, provider: "Gemini" });
        } catch (error) {
          providerError = error instanceof Error ? error.message : "Gemini request failed";
          console.error("Gemini request failed", { model: geminiModel, reason: providerError });
        }
      }
    }

    if (providerError) {
      const reply =
        "Our AI is temporarily unavailable. Please try again in a moment or contact us directly — the team can help right away.";
      await logChat(userMessage, reply);
      return Response.json({ reply, provider: "error" });
    }

    const reply = offlineReply(userMessage, businessName, siteContent);
    await logChat(userMessage, reply);
    return Response.json({ reply, provider: "Fallback" });
  } catch {
    return Response.json({ reply: "Server error. Please try again." }, { status: 500 });
  }
}
