import { randomUUID } from "node:crypto";
import { createLeadFromConsultation } from "@backend/consultation-leads";
import {
  completeConsultation,
  loadConsultationSession,
  markConsultationLeadLinked,
  upsertConsultationDraft,
} from "@backend/project-consultations";
import {
  advanceConsultation,
  createSession,
  type ConsultationSession,
} from "@/lib/project-consultant-engine";
import { briefMarkdownForTeam } from "@/lib/project-consultant.shared";
import {
  generateConsultantBrief,
  isConsultantLlmAvailable,
} from "@/lib/project-consultant-llm";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";

export const runtime = "nodejs";

type RequestBody = {
  sessionId?: string;
  message?: string;
  selections?: string[];
  action?: "start" | "message" | "select" | "skip_contact";
};

const MAX_MESSAGE_LEN = 2000;
const MAX_SELECTIONS = 12;

function appendHistory(
  session: ConsultationSession,
  role: "user" | "assistant",
  content: string
): ConsultationSession {
  const text = content.trim();
  if (!text) return session;

  const history = [...(session.requirements.conversationHistory ?? []), { role, content: text }];
  return {
    ...session,
    requirements: {
      ...session.requirements,
      conversationHistory: history.slice(-24),
    },
  };
}

function userTurnLabel(body: RequestBody): string {
  if (body.selections?.length) return body.selections.join(", ");
  if (body.action === "skip_contact") return "Skip contact";
  if (body.action === "start") return "";
  return (body.message ?? "").trim();
}

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const ip = clientIpFromRequest(request);
  const limiter = hitRateLimit(`consultant:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!limiter.ok) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limiter.retryAfterSec) } }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (message.length > MAX_MESSAGE_LEN) {
    return Response.json({ error: "Message is too long." }, { status: 400 });
  }
  if (body.selections && body.selections.length > MAX_SELECTIONS) {
    return Response.json({ error: "Too many selections." }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim() || randomUUID();
  let session =
    (await loadConsultationSession(sessionId).catch(() => null)) ?? createSession(sessionId);

  if (session.phase === "complete") {
    return Response.json({
      reply: "This consultation is already complete. Start a new session to plan another project.",
      phase: "complete",
      complete: true,
      sessionId,
      session,
    });
  }

  const userTurn = userTurnLabel(body);
  if (userTurn) {
    session = appendHistory(session, "user", userTurn);
  }

  const { session: nextSession, response: baseResponse } = advanceConsultation({
    session,
    message: body.message,
    selections: body.selections,
    action: body.action ?? (body.message ? "message" : "start"),
  });

  let response = { ...baseResponse };
  let workingSession = nextSession;

  const llmEnabled = isConsultantLlmAvailable();
  let briefLlmUsed = false;

  if (llmEnabled && response.complete && response.brief) {
    const enhanced = await generateConsultantBrief(workingSession, response.brief);
    response = { ...response, brief: enhanced };
    briefLlmUsed = true;
  }

  if (response.reply?.trim()) {
    workingSession = appendHistory(workingSession, "assistant", response.reply);
  }

  try {
    if (response.complete && response.brief) {
      const leadScore = response.leadScore ?? 0;
      const teamBriefMarkdown = briefMarkdownForTeam(response.brief);
      const consultationId = await completeConsultation(workingSession, teamBriefMarkdown, {
        leadScore,
        complexity: response.brief.complexity,
        estimatedCost: response.brief.estimatedCost,
        estimatedTimeline: response.brief.estimatedTimeline,
      });

      let leadId: number | null = null;
      if (workingSession.clientEmail.trim()) {
        leadId = await createLeadFromConsultation({
          session: workingSession,
          briefMarkdown: teamBriefMarkdown,
          leadScore,
          estimatedCost: response.brief.estimatedCost,
          estimatedTimeline: response.brief.estimatedTimeline,
        });
        if (leadId != null) {
          await markConsultationLeadLinked(workingSession.sessionId, leadId).catch(() => undefined);
          workingSession = {
            ...workingSession,
            requirements: {
              ...workingSession.requirements,
              leadCreated: true,
              leadId,
            },
          };
        }
      }

      return Response.json({
        ...response,
        sessionId,
        session: workingSession,
        consultationId,
        leadId,
        llmPowered: briefLlmUsed,
      });
    }

    await upsertConsultationDraft(workingSession);
    return Response.json({
      ...response,
      sessionId,
      session: workingSession,
      llmPowered: false,
    });
  } catch (err) {
    console.error("[project-consultant] persistence failed:", err);
    return Response.json({
      ...response,
      sessionId,
      session: workingSession,
      llmPowered: briefLlmUsed,
    });
  }
}
