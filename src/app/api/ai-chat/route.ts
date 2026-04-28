import { readSiteContent } from "@/server/site-content";
import { query } from "@/database";

type ChatMessage = { role: "user" | "assistant"; content: string };
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      history?: ChatMessage[];
      businessName?: string;
    };
    const userMessage = (body.message ?? "").trim();
    const businessName = body.businessName ?? "our company";
    const siteContent = await readSiteContent();

    if (!userMessage) {
      return Response.json({ reply: "Please share your question so I can help." }, { status: 400 });
    }

    let providerError: string | null = null;

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const preferredGeminiModel = process.env.GEMINI_MODEL ?? "gemini-1.5-flash-latest";
      const geminiModels = [
        preferredGeminiModel,
        "gemini-1.5-flash-latest",
        "gemini-2.0-flash",
      ].filter((model, index, all) => model && all.indexOf(model) === index);
      const systemPrompt = [
        `You are ${siteContent.aiName}, a helpful sales and support AI assistant for ${businessName}.`,
        `Business contact email: ${siteContent.contactEmail}`,
        `Business contact phone: ${siteContent.contactPhone}`,
        "Goal: answer clearly, ask qualifying questions, and guide users to booking/contact.",
        "Keep replies concise, professional, and action-oriented.",
      ].join("\n");

      for (const geminiModel of geminiModels) {
        try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemPrompt }],
              },
              contents: [
                ...((body.history ?? []).slice(-8).map((item) => ({
                  role: item.role === "assistant" ? "model" : "user",
                  parts: [{ text: item.content }],
                })) as Array<{ role: "user" | "model"; parts: Array<{ text: string }> }>),
                {
                  role: "user",
                  parts: [{ text: userMessage }],
                },
              ],
              generationConfig: {
                temperature: 0.4,
              },
            }),
          }
        );

        const data = (await response.json()) as {
          error?: { message?: string; code?: number; status?: string };
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };

        if (!response.ok || !data.candidates?.length) {
          console.error("Gemini API error", {
            status: response.status,
            model: geminiModel,
            message: data.error?.message ?? "No candidates returned",
            code: data.error?.code,
            apiStatus: data.error?.status,
          });
          throw new Error(data.error?.message ?? "Gemini did not return a candidate");
        }

        const reply =
          data.candidates[0]?.content?.parts?.[0]?.text?.trim() ??
          `Thanks for reaching ${businessName}. You can contact us at ${siteContent.contactEmail}.`;
        await query("INSERT INTO chat_logs (user_message, ai_reply) VALUES ($1, $2)", [
          userMessage,
          reply,
        ]);
        return Response.json({ reply });
        } catch (error) {
          providerError = error instanceof Error ? error.message : "Gemini request failed";
          console.error("Gemini request failed", {
            model: geminiModel,
            reason: providerError,
          });
        }
      }
    }

    const openAiKey = process.env.OPENAI_API_KEY;
    if (openAiKey) {
      const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
      const systemPrompt = [
        `You are ${siteContent.aiName}, a helpful sales and support AI assistant for ${businessName}.`,
        `Business contact email: ${siteContent.contactEmail}`,
        `Business contact phone: ${siteContent.contactPhone}`,
        "Goal: answer clearly, ask qualifying questions, and guide users to booking/contact.",
        "Keep replies concise, professional, and action-oriented.",
      ].join("\n");

      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model,
            temperature: 0.4,
            messages: [
              { role: "system", content: systemPrompt },
              ...((body.history ?? []).slice(-8).map((item) => ({
                role: item.role,
                content: item.content,
              })) as Array<{ role: "user" | "assistant"; content: string }>),
              { role: "user", content: userMessage },
            ],
          }),
        });

        const data = (await response.json()) as {
          error?: { message?: string; code?: string };
          choices?: Array<{ message?: { content?: string } }>;
        };

        if (!response.ok || !data.choices?.length) {
          console.error("OpenAI API error", {
            status: response.status,
            model,
            message: data.error?.message ?? "No choices returned",
            code: data.error?.code,
          });
          throw new Error(data.error?.message ?? "OpenAI did not return choices");
        }

        const reply =
          data.choices[0]?.message?.content?.trim() ??
          `Thanks for reaching ${businessName}. You can contact us at ${siteContent.contactEmail}.`;
        await query("INSERT INTO chat_logs (user_message, ai_reply) VALUES ($1, $2)", [
          userMessage,
          reply,
        ]);
        return Response.json({ reply });
      } catch (error) {
        providerError = error instanceof Error ? error.message : "OpenAI request failed";
        console.error("OpenAI request failed", {
          model,
          reason: providerError,
        });
      }
    }

    if (providerError) {
      const reply =
        "AI provider is configured but currently unavailable (quota or key issue). Please check billing/keys in your provider dashboard.";
      await query("INSERT INTO chat_logs (user_message, ai_reply) VALUES ($1, $2)", [
        userMessage,
        reply,
      ]);
      return Response.json({ reply });
    }

    const lower = userMessage.toLowerCase();
    let reply = `Thanks for contacting ${businessName}. Please share your goals, timeline, and budget range so our team can suggest the best package.`;
    if (lower.includes("price") || lower.includes("cost") || lower.includes("budget")) {
      reply = "Pricing depends on project scope. We start with discovery, then share options with timeline and cost.";
    } else if (lower.includes("time") || lower.includes("timeline") || lower.includes("how long")) {
      reply = "Most website projects are delivered in 3-8 weeks. Advanced automation can take longer based on integrations.";
    } else if (lower.includes("service") || lower.includes("what do you do")) {
      reply = "We provide website design, development, automation workflows, branding systems, and growth optimization.";
    }
    await query("INSERT INTO chat_logs (user_message, ai_reply) VALUES ($1, $2)", [
      userMessage,
      reply,
    ]);
    return Response.json({ reply });
  } catch {
    return Response.json({ reply: "Server error. Please try again." }, { status: 500 });
  }
}
