import { randomUUID } from "node:crypto";
import { createLeadFromConsultation } from "@backend/consultation-leads";
import {
  completeConsultation,
  markConsultationLeadLinked,
  upsertConsultationDraft,
} from "@backend/project-consultations";
import {
  advanceConsultation,
  createSession,
  type ConsultationSession,
} from "@/lib/project-consultant-engine";
import {
  generateConsultantBrief,
  generateConsultantStepReply,
  isConsultantLlmAvailable,
} from "@/lib/project-consultant-llm";

export const runtime = "nodejs";

type RequestBody = {
  sessionId?: string;
  message?: string;
  selections?: string[];
  action?: "start" | "message" | "select" | "skip_contact";
  session?: ConsultationSession;
};

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
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = body.sessionId?.trim() || randomUUID();
  let session: ConsultationSession = body.session
    ? { ...body.session, sessionId, requirements: { ...body.session.requirements } }
    : createSession(sessionId);

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

  if (llmEnabled) {
    if (!response.complete) {
      const llmReply = await generateConsultantStepReply(
        workingSession,
        userTurn,
        response.phase,
        response.reply
      );
      response = { ...response, reply: llmReply };
    } else if (response.brief) {
      const enhanced = await generateConsultantBrief(workingSession, response.brief);
      response = {
        ...response,
        brief: enhanced,
        leadScore: response.leadScore,
      };
    }
  }

  if (response.reply?.trim()) {
    workingSession = appendHistory(workingSession, "assistant", response.reply);
  }

  try {
    if (response.complete && response.brief) {
      const leadScore = response.leadScore ?? 0;
      const consultationId = await completeConsultation(workingSession, response.brief.markdown, {
        leadScore,
        complexity: response.brief.complexity,
        estimatedCost: response.brief.estimatedCost,
        estimatedTimeline: response.brief.estimatedTimeline,
      });

      let leadId: number | null = null;
      if (workingSession.clientEmail.trim()) {
        leadId = await createLeadFromConsultation({
          session: workingSession,
          briefMarkdown: response.brief.markdown,
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
        llmPowered: llmEnabled,
      });
    }

    await upsertConsultationDraft(workingSession);
    return Response.json({
      ...response,
      sessionId,
      session: workingSession,
      llmPowered: llmEnabled,
    });
  } catch (err) {
    console.error("[project-consultant] persistence failed:", err);
    return Response.json({
      ...response,
      sessionId,
      session: workingSession,
      llmPowered: llmEnabled,
    });
  }
}
