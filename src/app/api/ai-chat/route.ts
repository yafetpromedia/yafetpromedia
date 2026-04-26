import { readSiteContent } from "@/lib/site-content";
import { getDb } from "@/lib/db";

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
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply =
        data.choices?.[0]?.message?.content?.trim() ??
        `Thanks for reaching ${businessName}. You can contact us at ${siteContent.contactEmail}.`;
      getDb()
        .prepare("INSERT INTO chat_logs (user_message, ai_reply) VALUES (?, ?)")
        .run(userMessage, reply);
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
    getDb()
      .prepare("INSERT INTO chat_logs (user_message, ai_reply) VALUES (?, ?)")
      .run(userMessage, reply);
    return Response.json({ reply });
  } catch {
    return Response.json({ reply: "Server error. Please try again." }, { status: 500 });
  }
}
