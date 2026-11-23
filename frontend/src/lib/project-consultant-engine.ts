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
    requirements: {},
    clientName: "",
    clientEmail: "",
  };
}

function choicesFrom(labels: readonly string[]): ConsultantUiChoice[] {
  return labels.map((label) => ({ id: label, label }));
}

function inferProjectType(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("ecommerce") || lower.includes("e-commerce") || lower.includes("online store"))
    return "Ecommerce Website";
  if (lower.includes("school") || lower.includes("campus") || lower.includes("education"))
    return "School / Education Platform";
  if (lower.includes("saas") || lower.includes("software") || lower.includes("platform"))
    return "SaaS Platform";
  if (lower.includes("mobile") || lower.includes("app")) return "Mobile Application";
  if (lower.includes("brand") || lower.includes("website") || lower.includes("landing"))
    return "Business Website";
  const clipped = text.trim().slice(0, 80);
  return clipped || "Custom Digital Project";
}

function mapPaymentMethods(text: string, selections?: string[]): string[] {
  if (selections?.length) return selections;
  const lower = text.toLowerCase();
  const found = PAYMENT_OPTIONS.filter((opt) => lower.includes(opt.toLowerCase()));
  if (found.length) return [...found];
  if (!text.trim()) return [];
  return text
    .split(/[,;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function mapBudget(text: string, selection?: string): string {
  if (selection && (BUDGET_OPTIONS as readonly string[]).includes(selection)) return selection;
  const lower = text.toLowerCase();
  if (lower.includes("enterprise") || lower.includes("15,000") || lower.includes("15000")) {
    return "Enterprise";
  }
  if (
    lower.includes("2,000") ||
    lower.includes("2000") ||
    lower.includes("10,000") ||
    lower.includes("10000") ||
    lower.includes("mid")
  ) {
    return "$2,000–$10,000";
  }
  if (lower.includes("500") || lower.includes("1,000") || lower.includes("1000") || lower.includes("small")) {
    return "$500–$2,000";
  }
  if (lower.includes("under") || lower.includes("cheap") || lower.includes("low")) {
    return "Under $500";
  }
  const exact = (BUDGET_OPTIONS as readonly string[]).find((o) => o.toLowerCase() === lower.trim());
  return exact || text.trim().slice(0, 80) || "Flexible";
}

function mapTimeline(text: string, selection?: string): string {
  if (selection && (TIMELINE_OPTIONS as readonly string[]).includes(selection)) return selection;
  const lower = text.toLowerCase();
  if (lower.includes("asap") || lower.includes("urgent") || lower.includes("immediately")) return "ASAP";
  if (lower.includes("1 month") || lower.includes("one month") || lower.includes("4 week")) return "1 Month";
  if (lower.includes("3 month") || lower.includes("three month") || lower.includes("quarter")) return "3 Months";
  if (lower.includes("flex") || lower.includes("no rush") || lower.includes("whenever")) return "Flexible";
  const exact = (TIMELINE_OPTIONS as readonly string[]).find((o) => o.toLowerCase() === lower.trim());
  return exact || text.trim().slice(0, 80) || "Flexible";
}

function recommendFeatures(projectType: string, industry: string): string[] {
  const lower = `${projectType} ${industry}`.toLowerCase();
  const base = ["Mobile Responsive Design", "Admin Dashboard", "SEO Foundation"];
  if (lower.includes("ecommerce") || lower.includes("store")) {
    return [
      "Product Management",
      "Shopping Cart",
      "Checkout System",
      "Inventory Management",
      "Admin Dashboard",
      "Mobile Responsive Design",
      "AI Product Assistant",
    ];
  }
  if (lower.includes("school") || lower.includes("education")) {
    return [
      "Student Portal",
      "Course Management",
      "Attendance Tracking",
      "Parent Communication",
      "Admin Dashboard",
      "Mobile Responsive Design",
    ];
  }
  if (lower.includes("saas")) {
    return [
      "User Authentication",
      "Subscription Billing",
      "Role-Based Access",
      "Analytics Dashboard",
      "API Integrations",
      "Mobile Responsive Design",
    ];
  }
  return [...base, "Contact Forms", "Content Management", "Performance Optimization"];
}

function estimateCost(budget: string, complexity: "Low" | "Medium" | "High"): string {
  if (budget === "Enterprise") return "$15,000+";
  if (budget === "$2,000–$10,000") {
    return complexity === "High" ? "$6,500–$9,500" : "$3,500–$5,000";
  }
  if (budget === "$500–$2,000") return "$1,200–$2,400";
  return "$400–$900";
}

function estimateDuration(timeline: string, complexity: "Low" | "Medium" | "High"): string {
  if (timeline === "ASAP") return complexity === "High" ? "6–8 Weeks" : "3–4 Weeks";
  if (timeline === "1 Month") return complexity === "High" ? "4–6 Weeks" : "3–5 Weeks";
  if (timeline === "3 Months") return "8–12 Weeks";
  return complexity === "High" ? "10–14 Weeks" : "6–8 Weeks";
}

function estimateComplexity(projectType: string, budget: string): "Low" | "Medium" | "High" {
  const lower = projectType.toLowerCase();
  if (lower.includes("saas") || lower.includes("enterprise") || budget === "Enterprise") return "High";
  if (lower.includes("ecommerce") || lower.includes("school") || budget === "$2,000–$10,000")
    return "Medium";
  return "Low";
}

export function computeLeadScore(session: ConsultationSession): number {
  let score = 40;
  if (session.budget === "Enterprise") score += 28;
  else if (session.budget === "$2,000–$10,000") score += 22;
  else if (session.budget === "$500–$2,000") score += 12;

  if (session.timeline === "ASAP") score += 18;
  else if (session.timeline === "1 Month") score += 14;
  else if (session.timeline === "3 Months") score += 8;

  const type = session.projectType.toLowerCase();
  if (type.includes("saas") || type.includes("ecommerce") || type.includes("platform")) score += 12;

  if (session.clientEmail.trim()) score += 10;
  if ((session.requirements.paymentMethods?.length ?? 0) >= 2) score += 6;

  return Math.min(100, score);
}

export function leadScoreLabel(score: number): string {
  if (score >= 85) return "High Potential Client";
  if (score >= 65) return "Qualified Lead";
  return "Early Stage";
}

function buildClientBriefMarkdown(input: {
  projectType: string;
  industry: string;
  products: string;
  need: string;
  expectations: string;
  payments: string[];
  timeline: string;
  budget: string;
  recommendedFeatures: string[];
  estimatedTimeline: string;
  estimatedCost: string;
  clientSummary: string;
}): string {
  const paymentLine = input.payments.length
    ? input.payments.join(", ")
    : "To be decided together";

  return [
    "# Your Project Brief",
    "",
    "## In plain terms",
    "",
    input.clientSummary,
    "",
    "## What you need",
    "",
    input.need,
    "",
    "## What success looks like",
    "",
    input.expectations,
    "",
    "## What you told us",
    "",
    `* **What you’re building:** ${input.projectType || "To be confirmed"}`,
    `* **Who it’s for:** ${input.industry || "General audience"}`,
    `* **What it should do:** ${input.products}`,
    `* **Payments:** ${paymentLine}`,
    `* **When you want it:** ${input.timeline || "Flexible"}`,
    `* **Budget range:** ${input.budget || "To be discussed"}`,
    "",
    "## What we’ll include",
    "",
    "These are the building blocks we recommend so the product is useful from day one:",
    "",
    ...input.recommendedFeatures.map((f) => `✅ ${f}`),
    "",
    "## Timeline & investment",
    "",
    `* **Suggested delivery window:** ${input.estimatedTimeline}`,
    `* **Estimated investment:** ${input.estimatedCost}`,
    "",
    "These are planning estimates based on what you shared. A short discovery call locks the final scope and quote.",
    "",
    "## Next steps",
    "",
    "1. Review this brief and note anything missing or unclear.",
    "2. Reply or book a consultation so we can refine priorities.",
    "3. We’ll turn this into a clear proposal and build plan.",
  ].join("\n");
}

function buildTeamBriefMarkdown(input: {
  session: ConsultationSession;
  products: string;
  payments: string[];
  complexity: "Low" | "Medium" | "High";
  recommendedFeatures: string[];
  estimatedTimeline: string;
  estimatedCost: string;
  leadScore: number;
  leadLabel: string;
}): string {
  const { session } = input;
  const history = session.requirements.conversationHistory ?? [];
  const highlights = history
    .filter((m) => m.role === "user")
    .slice(-6)
    .map((m) => `- ${m.content.slice(0, 220)}`)
    .join("\n");

  const need = session.requirements.need?.trim() || "Not captured";
  const expectations = session.requirements.expectations?.trim() || "Not captured";

  return [
    "# Internal Consultation Brief",
    "",
    "## Opportunity snapshot",
    "",
    `* **Lead label:** ${input.leadLabel} (score ${input.leadScore}/100)`,
    `* **Project type:** ${session.projectType || "TBD"}`,
    `* **Industry / audience:** ${session.industry || "General"}`,
    `* **Complexity:** ${input.complexity}`,
    `* **Est. delivery:** ${input.estimatedTimeline}`,
    `* **Est. cost band:** ${input.estimatedCost}`,
    `* **Stated budget:** ${session.budget || "Unknown"}`,
    `* **Desired timeline:** ${session.timeline || "Unknown"}`,
    "",
    "## Core need (why now)",
    "",
    need,
    "",
    "## Final expectations (definition of done)",
    "",
    expectations,
    "",
    "## Requirements (structured)",
    "",
    `* **Scope / products:** ${input.products}`,
    `* **Payments:** ${input.payments.length ? input.payments.join(", ") : "None specified"}`,
    `* **Contact:** ${session.clientName || "—"} <${session.clientEmail || "no email"}>`,
    "",
    "## Recommended feature set",
    "",
    ...input.recommendedFeatures.map((f) => `- ${f}`),
    "",
    "## Fit & delivery notes",
    "",
    `* Match to Awud capabilities for a ${input.complexity.toLowerCase()}-complexity ${session.projectType || "digital"} build.`,
    `* Align proposal phases to their ${session.timeline || "flexible"} timeline and ${session.budget || "open"} budget.`,
    "* Validate that recommended features map to the stated need and final expectations.",
    "* Confirm integrations, content ownership, and go-live owners on the discovery call.",
    "",
    "## Conversation signals",
    "",
    highlights || "- (No free-text history captured — selections only.)",
    "",
    "## Open questions / risks",
    "",
    "- Confirm must-have vs nice-to-have features before quoting.",
    "- Re-state success criteria on the call and get explicit sign-off.",
    "- Validate payment providers and compliance needs for their market.",
    "- Check content readiness (copy, brand assets, product data).",
    "",
    "## Recommended next actions",
    "",
    "1. Send / confirm they received the client brief.",
    "2. Book a discovery call; walk need → expectations → scope against this brief.",
    "3. Prepare a phased proposal with clear milestones and payment schedule.",
  ].join("\n");
}

export function buildProjectBrief(session: ConsultationSession): ProjectBrief {
  const payments = session.requirements.paymentMethods ?? [];
  const products = session.requirements.products?.trim() || "Not specified";
  const need =
    session.requirements.need?.trim() ||
    session.requirements.notes?.trim() ||
    "We’ll clarify the core problem on the discovery call.";
  const expectations =
    session.requirements.expectations?.trim() ||
    "A working product that matches the scope above and is ready for real users.";
  const complexity = estimateComplexity(session.projectType, session.budget);
  const recommendedFeatures = recommendFeatures(session.projectType, session.industry);
  const estimatedTimeline = estimateDuration(session.timeline, complexity);
  const estimatedCost = estimateCost(session.budget, complexity);
  const leadScore = computeLeadScore(session);
  const leadLabel = leadScoreLabel(leadScore);
  const industry = session.industry || "General";
  const projectType = session.projectType || "Digital project";

  const clientSummary = [
    `You’re looking at a ${projectType.toLowerCase()} for ${industry}.`,
    `Core need: ${need.length > 120 ? `${need.slice(0, 117)}…` : need}`,
    `Success looks like: ${expectations.length > 120 ? `${expectations.slice(0, 117)}…` : expectations}`,
    `Planning estimate: ${estimatedTimeline} for about ${estimatedCost}.`,
  ].join(" ");

  const markdown = buildClientBriefMarkdown({
    projectType: session.projectType,
    industry,
    products,
    need,
    expectations,
    payments,
    timeline: session.timeline,
    budget: session.budget,
    recommendedFeatures,
    estimatedTimeline,
    estimatedCost,
    clientSummary,
  });

  const teamMarkdown = buildTeamBriefMarkdown({
    session,
    products,
    payments,
    complexity,
    recommendedFeatures,
    estimatedTimeline,
    estimatedCost,
    leadScore,
    leadLabel,
  });

  return {
    projectType: session.projectType,
    industry,
    products,
    payments,
    timeline: session.timeline,
    budget: session.budget,
    recommendedFeatures,
    estimatedTimeline,
    estimatedCost,
    complexity,
    leadLabel,
    clientSummary,
    markdown,
    teamMarkdown,
  };
}

type StepInput = {
  session: ConsultationSession;
  message?: string;
  selections?: string[];
  action?: "start" | "message" | "select" | "skip_contact";
};

export function advanceConsultation(input: StepInput): {
  session: ConsultationSession;
  response: Omit<ConsultantApiResponse, "sessionId" | "consultationId">;
} {
  const session = { ...input.session, requirements: { ...input.session.requirements } };
  const text = (input.message ?? "").trim();

  if (input.action === "start" || session.phase === "welcome") {
    session.phase = "intent";
    return {
      session,
      response: {
        reply:
          "Hi — I'm your Awud project consultant. Tell me in your own words what you want to build, and I'll shape a clear brief with you.",
        phase: "intent",
      },
    };
  }

  if (session.phase === "intent") {
    session.projectType = inferProjectType(text);
    session.requirements.notes = text.slice(0, 500);
    session.requirements.products = text.slice(0, 220);
    session.phase = "need";
    return {
      session,
      response: {
        reply: `Got it — sounds like a ${session.projectType.toLowerCase()}. What’s the real need behind this — what problem or opportunity are you trying to fix, and why now?`,
        phase: "need",
      },
    };
  }

  if (session.phase === "need") {
    session.requirements.need = text.slice(0, 500) || session.requirements.notes || "";
    if (text.length > 12) {
      session.requirements.notes = [session.requirements.notes, text].filter(Boolean).join(" | ").slice(0, 800);
    }
    session.phase = "industry";
    return {
      session,
      response: {
        reply:
          "That context helps. Who is this for (industry or audience), and what should those people be able to do once it’s live?",
        phase: "industry",
      },
    };
  }

  if (session.phase === "industry") {
    session.industry = text.slice(0, 160) || "General";
    if (text.length > 12) {
      session.requirements.products = text.slice(0, 280);
    }
    session.phase = "expectations";
    return {
      session,
      response: {
        reply:
          "Clear. When this project is finished, what does success look like for you — the final result you’d expect to see?",
        phase: "expectations",
      },
    };
  }

  if (session.phase === "expectations") {
    session.requirements.expectations = text.slice(0, 500) || "Working product ready for real users";
    session.phase = "payments";
    return {
      session,
      response: {
        reply:
          "Understood — that’s our definition of done. How should people pay (if at all)? You can type something like “Chapa and Telebirr”, or tap a few options below.",
        phase: "payments",
        choices: choicesFrom(PAYMENT_OPTIONS),
        multiSelect: true,
      },
    };
  }

  if (session.phase === "payments") {
    session.requirements.paymentMethods = mapPaymentMethods(text, input.selections);
    session.phase = "budget";
    return {
      session,
      response: {
        reply:
          "Noted. Roughly what budget range feels realistic for this build? Type a number/range, or pick a tier below.",
        phase: "budget",
        choices: choicesFrom(BUDGET_OPTIONS),
      },
    };
  }

  if (session.phase === "budget") {
    session.budget = mapBudget(text, input.selections?.[0]);
    session.phase = "timeline";
    return {
      session,
      response: {
        reply:
          "When do you want this live? You can say “ASAP”, “about 3 months”, or tap a timeline below.",
        phase: "timeline",
        choices: choicesFrom(TIMELINE_OPTIONS),
      },
    };
  }

  if (session.phase === "timeline") {
    session.timeline = mapTimeline(text, input.selections?.[0]);
    session.phase = "contact";
    return {
      session,
      response: {
        reply:
          "Perfect — I have enough to draft your brief. Share your name and email so we can send it and follow up (e.g. Yafet, hello@company.com). Or skip to preview the brief now.",
        phase: "contact",
      },
    };
  }

  if (session.phase === "contact") {
    if (input.action !== "skip_contact" && text) {
      const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
      if (emailMatch) session.clientEmail = emailMatch[0];
      const namePart = text.replace(emailMatch?.[0] ?? "", "").replace(/[,;]/g, " ").trim();
      if (namePart) session.clientName = namePart.slice(0, 120);
    }
    session.phase = "complete";
    const brief = buildProjectBrief(session);
    const leadScore = computeLeadScore(session);
    return {
      session,
      response: {
        reply:
          "Here’s your project brief — written in plain language for you, with the detail our team needs to prepare a formal proposal.",
        phase: "complete",
        complete: true,
        brief,
        leadScore,
      },
    };
  }

  if (session.phase === "complete") {
    return {
      session,
      response: {
        reply: "Your project brief is ready below.",
        phase: "complete",
        complete: true,
        brief: buildProjectBrief(session),
        leadScore: computeLeadScore(session),
      },
    };
  }

  return {
    session,
    response: {
      reply: "Let's continue — tell me more about what you're building.",
      phase: session.phase,
    },
  };
}
