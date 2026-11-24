import { buildBriefFromProjectModel } from "@/lib/project-brief-from-model";
import {
  applyExtractedUpdates,
  completenessScore,
  emptyProjectModel,
  factValue,
  hasClientSubstance,
  isGreetingOnly,
  mirrorSessionFields,
  setRecommendationStatus,
  upsertOpenQuestions,
  upsertRecommendations,
  type ExtractedUpdate,
  type OpenQuestion,
  type ProjectModel,
  type RecommendationItem,
} from "@/lib/project-model";
import {
  BUDGET_OPTIONS,
  PAYMENT_OPTIONS,
  TIMELINE_OPTIONS,
  type ConsultationPhase,
  type ConsultationRequirements,
  type ConsultantApiResponse,
  type ConsultantUiChoice,
  type ProjectBrief,
} from "@/lib/project-consultant.shared";

export type ConsultationSession = {
  sessionId: string;
  phase: ConsultationPhase;
  projectType: string;
  industry: string;
  budget: string;
  timeline: string;
  requirements: ConsultationRequirements;
  clientName: string;
  clientEmail: string;
};

export function createSession(sessionId: string): ConsultationSession {
  return {
    sessionId,
    phase: "welcome",
    projectType: "",
    industry: "",
    budget: "",
    timeline: "",
    requirements: {
      conversationHistory: [],
      projectModel: emptyProjectModel(),
    },
    clientName: "",
    clientEmail: "",
  };
}

export function getProjectModel(session: ConsultationSession): ProjectModel {
  const existing = session.requirements.projectModel;
  if (existing && typeof existing === "object") return existing;
  // Hydrate a sparse model from legacy mirrored columns so old drafts still work.
  const model = emptyProjectModel();
  const updates = [];
  if (session.projectType.trim()) {
    updates.push({
      path: "identity.projectType",
      value: session.projectType,
      status: "client_provided" as const,
    });
  }
  if (session.industry.trim()) {
    updates.push({
      path: "identity.industry",
      value: session.industry,
      status: "client_provided" as const,
    });
  }
  if (session.budget.trim()) {
    updates.push({
      path: "commercial.clientBudget",
      value: session.budget,
      status: "client_provided" as const,
    });
  }
  if (session.timeline.trim()) {
    updates.push({
      path: "timeline.clientTimeline",
      value: session.timeline,
      status: "client_provided" as const,
    });
  }
  if (session.requirements.need?.trim()) {
    updates.push({
      path: "identity.problem",
      value: session.requirements.need,
      status: "client_provided" as const,
    });
  }
  if (session.requirements.products?.trim()) {
    updates.push({
      path: "scope.products",
      value: session.requirements.products,
      status: "client_provided" as const,
    });
  }
  if (session.requirements.expectations?.trim()) {
    updates.push({
      path: "scope.objectives",
      value: session.requirements.expectations,
      status: "client_provided" as const,
    });
  }
  if (session.clientName.trim()) {
    updates.push({
      path: "stakeholders.clientName",
      value: session.clientName,
      status: "client_provided" as const,
    });
  }
  if (session.clientEmail.trim()) {
    updates.push({
      path: "stakeholders.clientEmail",
      value: session.clientEmail,
      status: "client_provided" as const,
    });
  }
  return updates.length ? applyExtractedUpdates(model, updates) : model;
}

function syncSessionFromModel(session: ConsultationSession, model: ProjectModel): ConsultationSession {
  const mirrored = mirrorSessionFields(model);
  const stage = model.planningStage;
  const phase: ConsultationPhase =
    stage === "exploring"
      ? "exploring"
      : stage === "ready_for_brief"
        ? "refining"
        : stage === "preliminary"
          ? "refining"
          : stage === "refining"
            ? "refining"
            : "scoping";

  return {
    ...session,
    phase,
    projectType: mirrored.projectType,
    industry: mirrored.industry,
    budget: mirrored.budget,
    timeline: mirrored.timeline,
    clientName: mirrored.clientName || session.clientName,
    clientEmail: mirrored.clientEmail || session.clientEmail,
    requirements: {
      ...session.requirements,
      projectModel: model,
      products: factValue(model.scope.products) || session.requirements.products,
      need: factValue(model.identity.problem) || session.requirements.need,
      expectations:
        factValue(model.scope.objectives) ||
        factValue(model.identity.vision) ||
        session.requirements.expectations,
      paymentMethods: factValue(model.commercial.paymentMethods) ?? session.requirements.paymentMethods,
    },
  };
}

export function computeLeadScore(session: ConsultationSession): number {
  const model = getProjectModel(session);
  const { percent } = completenessScore(model);
  let score = 30 + Math.round(percent * 0.4);
  if (factValue(model.commercial.clientBudget)) score += 10;
  if (factValue(model.timeline.clientTimeline)) score += 8;
  if (session.clientEmail.trim()) score += 12;
  if (model.scope.features.some((f) => f.status.startsWith("client"))) score += 8;
  return Math.min(100, score);
}

export function leadScoreLabel(score: number): string {
  if (score >= 85) return "High Potential Client";
  if (score >= 65) return "Qualified Lead";
  return "Early Stage";
}

export function buildProjectBrief(session: ConsultationSession): ProjectBrief {
  const brief = buildBriefFromProjectModel(getProjectModel(session));
  return {
    ...brief,
    leadLabel: leadScoreLabel(computeLeadScore(session)),
  };
}

function choicesFrom(labels: readonly string[]): ConsultantUiChoice[] {
  return labels.map((label) => ({ id: label, label }));
}

function softSuggestionChoices(model: ProjectModel): {
  choices?: ConsultantUiChoice[];
  multiSelect?: boolean;
} {
  const open = model.openQuestions[0];
  if (!open) return {};
  const area = open.area.toLowerCase();
  if (area.includes("payment")) {
    return { choices: choicesFrom(PAYMENT_OPTIONS), multiSelect: true };
  }
  if (area.includes("budget")) {
    return { choices: choicesFrom(BUDGET_OPTIONS) };
  }
  if (area.includes("timeline") || area.includes("schedule")) {
    return { choices: choicesFrom(TIMELINE_OPTIONS) };
  }
  return {};
}

export type OrchestratorTurnResult = {
  reply: string;
  extractedUpdates?: ExtractedUpdate[];
  openQuestions?: OpenQuestion[];
  recommendations?: RecommendationItem[];
  offerBrief?: boolean;
  providerFailed?: boolean;
};

type StepInput = {
  session: ConsultationSession;
  message?: string;
  selections?: string[];
  action?:
    | "start"
    | "message"
    | "select"
    | "skip_contact"
    | "request_brief"
    | "approve_recommendation"
    | "reject_recommendation"
    | "patch_fact";
  recommendationId?: string;
  /** Pre-computed orchestrator result for message turns. */
  orchestrator?: OrchestratorTurnResult | null;
};

export function advanceConsultation(input: StepInput): {
  session: ConsultationSession;
  response: Omit<ConsultantApiResponse, "sessionId" | "consultationId">;
} {
  let session = {
    ...input.session,
    requirements: { ...input.session.requirements },
  };
  let model = getProjectModel(session);
  const text = (input.message ?? "").trim();

  if (input.action === "start" || session.phase === "welcome") {
    session = syncSessionFromModel(
      { ...session, phase: "exploring" },
      model.planningStage === "exploring" ? model : model
    );
    return {
      session,
      response: {
        reply:
          "Hey — welcome to Awud. What are you thinking about building? Share it in your own words and we’ll shape a clear plan together.",
        phase: "exploring",
        project: getProjectModel(session),
      },
    };
  }

  if (input.action === "approve_recommendation" && input.recommendationId) {
    model = setRecommendationStatus(model, input.recommendationId, "client_confirmed");
    session = syncSessionFromModel(session, model);
    return {
      session,
      response: {
        reply: "Locked that in as confirmed. Anything else you want to adjust?",
        phase: session.phase,
        project: model,
        brief: hasClientSubstance(model) ? buildProjectBrief(session) : undefined,
      },
    };
  }

  if (input.action === "reject_recommendation" && input.recommendationId) {
    model = setRecommendationStatus(model, input.recommendationId, "rejected");
    session = syncSessionFromModel(session, model);
    return {
      session,
      response: {
        reply: "Got it — I’ve marked that suggestion as rejected so it won’t show as approved in the brief.",
        phase: session.phase,
        project: model,
        brief: hasClientSubstance(model) ? buildProjectBrief(session) : undefined,
      },
    };
  }

  if (input.action === "request_brief" || input.action === "skip_contact") {
    if (input.action === "skip_contact" || text) {
      // parse contact if present
      if (text && input.action !== "request_brief") {
        const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
        if (emailMatch) {
          model = applyExtractedUpdates(model, [
            { path: "stakeholders.clientEmail", value: emailMatch[0], status: "client_provided" },
          ]);
          const namePart = text.replace(emailMatch[0], "").replace(/[,;]/g, " ").trim();
          if (namePart) {
            model = applyExtractedUpdates(model, [
              { path: "stakeholders.clientName", value: namePart.slice(0, 120), status: "client_provided" },
            ]);
          }
        }
      }
    }

    if (!hasClientSubstance(model)) {
      session = syncSessionFromModel(session, model);
      return {
        session,
        response: {
          reply:
            "We don’t have enough confirmed project detail yet for a brief. Tell me what you want to build first — even a rough idea is fine.",
          phase: "exploring",
          project: model,
          preliminary: true,
        },
      };
    }

    session = syncSessionFromModel(session, model);
    session.phase = "complete";
    const brief = buildProjectBrief(session);
    return {
      session,
      response: {
        reply: brief.preliminary
          ? "Here’s a preliminary brief from what you’ve confirmed so far. Gaps stay marked as not provided — nothing was invented."
          : "Here’s your project brief from everything we’ve confirmed together.",
        phase: "complete",
        complete: true,
        brief,
        leadScore: computeLeadScore(session),
        project: model,
        preliminary: Boolean(brief.preliminary),
      },
    };
  }

  // Soft chip selections → treat as client-provided updates
  if (input.action === "select" && input.selections?.length) {
    const sels = input.selections;
    const updates: ExtractedUpdate[] = [];
    if (sels.every((s) => (PAYMENT_OPTIONS as readonly string[]).includes(s))) {
      updates.push({ path: "commercial.paymentMethods", value: sels, status: "client_provided" });
    } else if (sels.length === 1 && (BUDGET_OPTIONS as readonly string[]).includes(sels[0])) {
      updates.push({ path: "commercial.clientBudget", value: sels[0], status: "client_provided" });
    } else if (sels.length === 1 && (TIMELINE_OPTIONS as readonly string[]).includes(sels[0])) {
      updates.push({ path: "timeline.clientTimeline", value: sels[0], status: "client_provided" });
    } else {
      updates.push({
        path: "scope.products",
        value: sels.join(", "),
        status: "client_provided",
      });
    }
    model = applyExtractedUpdates(model, updates, "select");
    session = syncSessionFromModel(session, model);
    const chips = softSuggestionChoices(model);
    return {
      session,
      response: {
        reply: "Noted — I’ve updated the plan with that. What else matters most for this build?",
        phase: session.phase,
        project: model,
        ...chips,
      },
    };
  }

  // Greeting-only: no extractions, no brief
  if (text && isGreetingOnly(text)) {
    session = syncSessionFromModel(session, model);
    return {
      session,
      response: {
        reply: "Hey! What are you thinking about building?",
        phase: "exploring",
        project: model,
      },
    };
  }

  // Orchestrated LLM turn (or honest fallback)
  const orch = input.orchestrator;
  if (orch?.providerFailed) {
    session = syncSessionFromModel(session, model);
    return {
      session,
      response: {
        reply:
          orch.reply ||
          "I couldn’t reach the AI service just now. Please try again in a moment — I won’t invent project details while offline.",
        phase: session.phase,
        project: model,
        providerError: true,
      },
    };
  }

  if (orch) {
    if (orch.extractedUpdates?.length) {
      model = applyExtractedUpdates(model, orch.extractedUpdates, "llm");
    }
    if (orch.openQuestions?.length) {
      model = upsertOpenQuestions(model, orch.openQuestions);
    }
    if (orch.recommendations?.length) {
      model = upsertRecommendations(model, orch.recommendations);
    }
  } else if (text) {
    // Deterministic light capture when LLM unavailable: store as notes/description only — never invent budget.
    model = applyExtractedUpdates(model, [
      {
        path: model.identity.shortDescription ? "identity.problem" : "identity.shortDescription",
        value: text.slice(0, 400),
        status: "client_provided",
      },
    ]);
  }

  session = syncSessionFromModel(session, model);
  const chips = softSuggestionChoices(model);

  if (orch?.offerBrief && hasClientSubstance(model)) {
    const brief = buildProjectBrief(session);
    return {
      session,
      response: {
        reply:
          orch.reply ||
          "I have enough to draft a preliminary brief from what you’ve shared. Want me to generate it now?",
        phase: session.phase,
        project: model,
        brief,
        preliminary: true,
        ...chips,
      },
    };
  }

  const fallbackReply = text
    ? "Thanks — I’m tracking that in your plan. What’s the main outcome you want when this is live?"
    : "Tell me a bit more about the project whenever you’re ready.";

  return {
    session,
    response: {
      reply: orch?.reply?.trim() || fallbackReply,
      phase: session.phase,
      project: model,
      ...chips,
    },
  };
}
