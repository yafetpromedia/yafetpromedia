/**
 * Provenance-aware project model shared by Talk, Plan, and Project Brief.
 * Client-confirmed facts must never be invented by the AI layer.
 */

export type FactStatus =
  | "client_provided"
  | "client_confirmed"
  | "ai_suggested"
  | "pending"
  | "tbd"
  | "rejected"
  | "superseded";

export type ProjectFact<T = string> = {
  value: T;
  status: FactStatus;
  updatedAt: string;
  sourceTurnId?: string;
};

export type FeatureItem = {
  id: string;
  name: string;
  description: string;
  purpose?: string;
  priority?: "must" | "should" | "could";
  role?: string;
  status: FactStatus;
};

export type RecommendationItem = {
  id: string;
  category: "feature" | "tech" | "timeline" | "budget" | "process" | "other";
  title: string;
  detail: string;
  status: "ai_suggested" | "client_confirmed" | "rejected" | "pending";
};

export type OpenQuestion = {
  id: string;
  question: string;
  area: string;
  priority: "high" | "medium" | "low";
};

export type RiskItem = {
  id: string;
  label: string;
  mitigation?: string;
  status: FactStatus;
};

export type ProjectModel = {
  version: number;
  lastUpdated: string;
  planningStage: "exploring" | "scoping" | "refining" | "ready_for_brief" | "preliminary";
  identity: {
    name: ProjectFact | null;
    projectType: ProjectFact | null;
    industry: ProjectFact | null;
    shortDescription: ProjectFact | null;
    vision: ProjectFact | null;
    problem: ProjectFact | null;
    opportunity: ProjectFact | null;
  };
  stakeholders: {
    clientName: ProjectFact | null;
    organization: ProjectFact | null;
    clientEmail: ProjectFact | null;
    intendedUsers: ProjectFact | null;
  };
  scope: {
    objectives: ProjectFact | null;
    products: ProjectFact | null;
    features: FeatureItem[];
    deliverables: ProjectFact | null;
    exclusions: ProjectFact | null;
    platforms: ProjectFact | null;
    integrations: ProjectFact | null;
  };
  technical: {
    architecture: ProjectFact | null;
    stack: ProjectFact | null;
    hosting: ProjectFact | null;
    security: ProjectFact | null;
  };
  commercial: {
    /** Client-stated budget only — never invent. */
    clientBudget: ProjectFact | null;
    /** AI estimate — always labeled as estimate. */
    estimatedCost: ProjectFact | null;
    currency: ProjectFact | null;
    paymentMethods: ProjectFact<string[]> | null;
  };
  timeline: {
    /** Client-stated preference. */
    clientTimeline: ProjectFact | null;
    /** AI estimate — labeled. */
    estimatedDuration: ProjectFact | null;
    phases: ProjectFact | null;
  };
  risks: RiskItem[];
  assumptions: ProjectFact[];
  openQuestions: OpenQuestion[];
  recommendations: RecommendationItem[];
  changeLog: { at: string; summary: string }[];
};

export type ExtractedUpdate = {
  path: string;
  value: unknown;
  status?: FactStatus;
  confidence?: number;
};

const ALLOWED_PATHS = new Set([
  "identity.name",
  "identity.projectType",
  "identity.industry",
  "identity.shortDescription",
  "identity.vision",
  "identity.problem",
  "identity.opportunity",
  "stakeholders.clientName",
  "stakeholders.organization",
  "stakeholders.clientEmail",
  "stakeholders.intendedUsers",
  "scope.objectives",
  "scope.products",
  "scope.deliverables",
  "scope.exclusions",
  "scope.platforms",
  "scope.integrations",
  "technical.architecture",
  "technical.stack",
  "technical.hosting",
  "technical.security",
  "commercial.clientBudget",
  "commercial.estimatedCost",
  "commercial.currency",
  "commercial.paymentMethods",
  "timeline.clientTimeline",
  "timeline.estimatedDuration",
  "timeline.phases",
]);

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeFact<T>(
  value: T,
  status: FactStatus,
  sourceTurnId?: string
): ProjectFact<T> {
  return { value, status, updatedAt: nowIso(), sourceTurnId };
}

export function emptyProjectModel(): ProjectModel {
  return {
    version: 1,
    lastUpdated: nowIso(),
    planningStage: "exploring",
    identity: {
      name: null,
      projectType: null,
      industry: null,
      shortDescription: null,
      vision: null,
      problem: null,
      opportunity: null,
    },
    stakeholders: {
      clientName: null,
      organization: null,
      clientEmail: null,
      intendedUsers: null,
    },
    scope: {
      objectives: null,
      products: null,
      features: [],
      deliverables: null,
      exclusions: null,
      platforms: null,
      integrations: null,
    },
    technical: {
      architecture: null,
      stack: null,
      hosting: null,
      security: null,
    },
    commercial: {
      clientBudget: null,
      estimatedCost: null,
      currency: null,
      paymentMethods: null,
    },
    timeline: {
      clientTimeline: null,
      estimatedDuration: null,
      phases: null,
    },
    risks: [],
    assumptions: [],
    openQuestions: [],
    recommendations: [],
    changeLog: [],
  };
}

function isActiveStatus(status: FactStatus): boolean {
  return status !== "rejected" && status !== "superseded" && status !== "tbd";
}

export function factValue<T>(fact: ProjectFact<T> | null | undefined): T | undefined {
  if (!fact || !isActiveStatus(fact.status)) return undefined;
  return fact.value;
}

export function hasClientSubstance(model: ProjectModel): boolean {
  const checks = [
    factValue(model.identity.projectType),
    factValue(model.identity.shortDescription),
    factValue(model.identity.problem),
    factValue(model.scope.products),
    factValue(model.identity.industry),
  ];
  return checks.some((v) => typeof v === "string" && v.trim().length > 8);
}

/** Required fields for a non-preliminary brief. */
const REQUIRED_FOR_BRIEF: { label: string; get: (m: ProjectModel) => unknown }[] = [
  { label: "What you’re building", get: (m) => factValue(m.identity.projectType) || factValue(m.identity.shortDescription) },
  { label: "Core need / problem", get: (m) => factValue(m.identity.problem) },
  { label: "Who it’s for", get: (m) => factValue(m.stakeholders.intendedUsers) || factValue(m.identity.industry) },
  { label: "Success / outcome", get: (m) => factValue(m.scope.objectives) || factValue(m.identity.vision) },
];

export function missingRequiredLabels(model: ProjectModel): string[] {
  return REQUIRED_FOR_BRIEF.filter((r) => {
    const v = r.get(model);
    if (Array.isArray(v)) return v.length === 0;
    return !v || (typeof v === "string" && v.trim().length < 4);
  }).map((r) => r.label);
}

export function completenessScore(model: ProjectModel): {
  percent: number;
  missing: string[];
  filled: number;
  total: number;
} {
  const missing = missingRequiredLabels(model);
  const total = REQUIRED_FOR_BRIEF.length;
  const filled = total - missing.length;
  return { percent: Math.round((filled / total) * 100), missing, filled, total };
}

export function derivePlanningStage(model: ProjectModel): ProjectModel["planningStage"] {
  const { percent } = completenessScore(model);
  if (!hasClientSubstance(model)) return "exploring";
  if (percent >= 100 && model.openQuestions.filter((q) => q.priority === "high").length === 0) {
    return "ready_for_brief";
  }
  if (percent >= 75) return "preliminary";
  if (percent >= 50) return "refining";
  return "scoping";
}

function setByPath(model: ProjectModel, path: string, fact: ProjectFact<unknown>): void {
  const parts = path.split(".");
  if (parts.length !== 2) return;
  const [group, key] = parts;
  const groupObj = (model as unknown as Record<string, Record<string, unknown>>)[group];
  if (!groupObj || !(key in groupObj)) return;
  const prev = groupObj[key] as ProjectFact<unknown> | null;
  if (prev && isActiveStatus(prev.status) && prev.status.startsWith("client") && fact.status === "ai_suggested") {
    // Never overwrite client facts with AI suggestions.
    return;
  }
  if (prev && isActiveStatus(prev.status) && JSON.stringify(prev.value) !== JSON.stringify(fact.value)) {
    groupObj[key] = { ...prev, status: "superseded" };
    model.changeLog.push({
      at: nowIso(),
      summary: `Updated ${path}`,
    });
  }
  groupObj[key] = fact;
}

export function applyExtractedUpdates(
  model: ProjectModel,
  updates: ExtractedUpdate[],
  sourceTurnId?: string
): ProjectModel {
  const next: ProjectModel = structuredClone(model);
  for (const update of updates) {
    if (!ALLOWED_PATHS.has(update.path)) continue;
    if (update.value == null) continue;
    if (typeof update.value === "string" && !update.value.trim()) continue;

    const status: FactStatus =
      update.status === "ai_suggested" ||
      update.status === "client_provided" ||
      update.status === "client_confirmed" ||
      update.status === "pending" ||
      update.status === "tbd"
        ? update.status
        : "client_provided";

    // AI must not invent commercial estimates as client budget.
    if (update.path === "commercial.clientBudget" && status === "ai_suggested") continue;
    if (update.path === "timeline.clientTimeline" && status === "ai_suggested") continue;

    if (update.path === "commercial.paymentMethods") {
      const methods = Array.isArray(update.value)
        ? update.value.map(String).filter(Boolean).slice(0, 8)
        : String(update.value)
            .split(/[,;/|]+/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 8);
      setByPath(next, update.path, makeFact(methods, status, sourceTurnId));
      continue;
    }

    setByPath(next, update.path, makeFact(update.value, status, sourceTurnId));
  }
  next.lastUpdated = nowIso();
  next.version = (next.version || 1) + 1;
  next.planningStage = derivePlanningStage(next);
  next.changeLog = next.changeLog.slice(-40);
  return next;
}

export function upsertOpenQuestions(model: ProjectModel, questions: OpenQuestion[]): ProjectModel {
  const next = structuredClone(model);
  const byId = new Map(next.openQuestions.map((q) => [q.id, q]));
  for (const q of questions) {
    if (!q.id || !q.question?.trim()) continue;
    byId.set(q.id, {
      id: q.id,
      question: q.question.trim().slice(0, 280),
      area: q.area || "general",
      priority: q.priority || "medium",
    });
  }
  next.openQuestions = [...byId.values()].slice(0, 12);
  next.lastUpdated = nowIso();
  return next;
}

export function upsertRecommendations(
  model: ProjectModel,
  items: RecommendationItem[]
): ProjectModel {
  const next = structuredClone(model);
  const byId = new Map(next.recommendations.map((r) => [r.id, r]));
  for (const item of items) {
    if (!item.id || !item.title?.trim()) continue;
    const existing = byId.get(item.id);
    if (existing?.status === "rejected" || existing?.status === "client_confirmed") continue;
    byId.set(item.id, {
      ...item,
      title: item.title.trim().slice(0, 120),
      detail: (item.detail || "").trim().slice(0, 500),
      status: item.status || "ai_suggested",
    });
  }
  next.recommendations = [...byId.values()].slice(0, 20);
  next.lastUpdated = nowIso();
  return next;
}

export function setRecommendationStatus(
  model: ProjectModel,
  id: string,
  status: RecommendationItem["status"]
): ProjectModel {
  const next = structuredClone(model);
  next.recommendations = next.recommendations.map((r) =>
    r.id === id ? { ...r, status } : r
  );
  next.lastUpdated = nowIso();
  next.changeLog.push({ at: nowIso(), summary: `Recommendation ${id} → ${status}` });
  return next;
}

export function addFeature(model: ProjectModel, feature: FeatureItem): ProjectModel {
  const next = structuredClone(model);
  const idx = next.scope.features.findIndex((f) => f.id === feature.id);
  if (idx >= 0) {
    const prev = next.scope.features[idx];
    if (prev.status === "rejected") return next;
    next.scope.features[idx] = { ...prev, ...feature };
  } else {
    next.scope.features.push(feature);
  }
  next.scope.features = next.scope.features.slice(0, 24);
  next.lastUpdated = nowIso();
  return next;
}

export function isGreetingOnly(message: string): boolean {
  const t = message.trim().toLowerCase();
  if (!t) return true;
  return /^(hi|hello|hey|yo|selam|good\s+(morning|afternoon|evening)|howdy)[!.,\s]*$/i.test(t);
}

/** Mirror classic session columns from the rich model for admin/list compatibility. */
export function mirrorSessionFields(model: ProjectModel): {
  projectType: string;
  industry: string;
  budget: string;
  timeline: string;
  clientName: string;
  clientEmail: string;
} {
  return {
    projectType: factValue(model.identity.projectType) || factValue(model.identity.name) || "",
    industry: factValue(model.identity.industry) || "",
    budget: factValue(model.commercial.clientBudget) || "",
    timeline: factValue(model.timeline.clientTimeline) || "",
    clientName: factValue(model.stakeholders.clientName) || "",
    clientEmail: factValue(model.stakeholders.clientEmail) || "",
  };
}
