import { randomUUID } from "node:crypto";
import { createLeadFromConsultation } from "@backend/consultation-leads";
import {
  completeConsultation,
  loadConsultationSession,
  markConsultationLeadLinked,
  upsertConsultationDraft,
} from "@backend/project-consultations";
import { sendClientProjectBriefEmail } from "@/lib/consultation-brief-mail";
import { sendLeadNotificationEmail } from "@/lib/lead-notify-mail";
import {
  advanceConsultation,
  createSession,
  getProjectModel,
  type ConsultationSession,
} from "@/lib/project-consultant-engine";
import { briefMarkdownForTeam } from "@/lib/project-consultant.shared";
import { orchestrateConsultantTurn } from "@/lib/project-consultant-llm";
import { clientIpFromRequest, hitRateLimit } from "@/lib/rate-limit";
import { csrfGuard } from "@/lib/request-security";

export const runtime = "nodejs";

type RequestBody = {
  sessionId?: string;
  message?: string;
  selections?: string[];
  recommendationId?: string;
  action?:
    | "start"
    | "message"
    | "select"
    | "skip_contact"
    | "request_brief"
    | "approve_recommendation"
    | "reject_recommendation"
    | "resume";
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
      conversationHistory: history.slice(-40),
    },
  };
}

function userTurnLabel(body: RequestBody): string {
  if (body.selections?.length) return body.selections.join(", ");
  if (body.action === "skip_contact") return "Skip contact";
  if (body.action === "request_brief") return "Generate brief";
  if (body.action === "approve_recommendation") return `Approve: ${body.recommendationId ?? ""}`;
  if (body.action === "reject_recommendation") return `Reject: ${body.recommendationId ?? ""}`;
  if (body.action === "start" || body.action === "resume") return "";
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

  if (body.action === "resume") {
    const history = session.requirements.conversationHistory ?? [];
    const lastAssistant = [...history].reverse().find((m) => m.role === "assistant");
    return Response.json({
      reply: lastAssistant?.content || "Welcome back — we can continue where you left off.",
      phase: session.phase,
      sessionId,
      session,
      project: getProjectModel(session),
      complete: session.phase === "complete",
    });
  }

  if (session.phase === "complete" && body.action !== "request_brief") {
    return Response.json({
      reply: "This consultation already has a brief. Reset the session to start a new project plan.",
      phase: "complete",
      complete: true,
      sessionId,
      session,
      project: getProjectModel(session),
    });
  }

  const action =
    body.action ??
    (body.message ? "message" : body.selections?.length ? "select" : "start");

  const userTurn = userTurnLabel(body);
  if (userTurn) {
    session = appendHistory(session, "user", userTurn);
  }

  let orchestrator = null;
  if (action === "message" && message) {
    orchestrator = await orchestrateConsultantTurn(session, message);
  }

  const { session: nextSession, response: baseResponse } = advanceConsultation({
    session,
    message: body.message,
    selections: body.selections,
    action,
    recommendationId: body.recommendationId,
    orchestrator,
  });

  let response = { ...baseResponse };
  let workingSession = nextSession;

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
      let clientBriefEmailed = false;
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

        void sendLeadNotificationEmail({
          name: workingSession.clientName.trim() || "Consultation lead",
          email: workingSession.clientEmail.trim(),
          company:
            [workingSession.projectType, workingSession.industry].filter(Boolean).join(" — ") ||
            "AI Consultation",
          phone: "",
          message: teamBriefMarkdown.slice(0, 4000),
          inquiryType: "sales",
        }).catch(() => undefined);

        const mailResult = await sendClientProjectBriefEmail({
          clientName: workingSession.clientName,
          clientEmail: workingSession.clientEmail,
          brief: response.brief,
        });
        clientBriefEmailed = mailResult.delivered;
      }

      return Response.json({
        ...response,
        sessionId,
        session: workingSession,
        consultationId,
        leadId,
        clientBriefEmailed,
        project: getProjectModel(workingSession),
      });
    }

    await upsertConsultationDraft(workingSession);
    return Response.json({
      ...response,
      sessionId,
      session: workingSession,
      project: getProjectModel(workingSession),
    });
  } catch (err) {
    console.error("[project-consultant] persistence failed:", err);
    return Response.json(
      {
        ...response,
        sessionId,
        session: workingSession,
        project: getProjectModel(workingSession),
        error: "Saved locally for this request, but persistence failed. Please retry shortly.",
      },
      { status: 500 }
    );
  }
}
