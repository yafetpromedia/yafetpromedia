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
  if (lower.includes("saas") || lower.includes("software")) return "SaaS Platform";
  if (lower.includes("mobile") || lower.includes("app")) return "Mobile Application";
  if (lower.includes("brand") || lower.includes("website")) return "Business Website";
  return text.trim().slice(0, 120) || "Custom Digital Project";
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

export function buildProjectBrief(session: ConsultationSession): ProjectBrief {
  const payments = session.requirements.paymentMethods ?? [];
  const products = session.requirements.products?.trim() || "Not specified";
  const complexity = estimateComplexity(session.projectType, session.budget);
  const recommendedFeatures = recommendFeatures(session.projectType, session.industry);
  const estimatedTimeline = estimateDuration(session.timeline, complexity);
  const estimatedCost = estimateCost(session.budget, complexity);
  const leadLabel = leadScoreLabel(computeLeadScore(session));

  const markdown = [
    "# Project Brief",
    "",
    "### Client Requirements",
    "",
    `* Project Type: ${session.projectType || "TBD"}`,
    `* Industry: ${session.industry || "General"}`,
    `* Products: ${products}`,
    `* Payments: ${payments.length ? payments.join(", ") : "TBD"}`,
    `* Timeline: ${session.timeline || "TBD"}`,
    `* Budget: ${session.budget || "TBD"}`,
    "",
    "### Recommended Features",
    "",
    ...recommendedFeatures.map((f) => `✅ ${f}`),
    "",
    "### Estimated Timeline",
    "",
    estimatedTimeline,
    "",
    "### Estimated Cost",
    "",
    estimatedCost,
    "",
    "### Lead Score",
    "",
    leadLabel,
  ].join("\n");

  return {
    projectType: session.projectType,
    industry: session.industry || "General",
    products,
    payments,
    timeline: session.timeline,
    budget: session.budget,
    recommendedFeatures,
    estimatedTimeline,
    estimatedCost,
    complexity,
    leadLabel,
    markdown,
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
        reply: "Hello! I'm your AI Project Consultant. What would you like to build today?",
        phase: "intent",
      },
    };
  }

  if (session.phase === "intent") {
    session.projectType = inferProjectType(text);
    session.requirements.products = text;
    session.phase = "industry";
    return {
      session,
      response: {
        reply: `Great — a ${session.projectType.toLowerCase()} sounds like a strong fit. What industry or niche is this for, and what will you sell or offer?`,
        phase: "industry",
      },
    };
  }

  if (session.phase === "industry") {
    session.industry = text.slice(0, 120) || "General";
    if (!session.requirements.products || session.requirements.products === session.projectType) {
      session.requirements.products = text;
    }
    session.phase = "payments";
    return {
      session,
      response: {
        reply: "Which payment methods do you need?",
        phase: "payments",
        choices: choicesFrom(PAYMENT_OPTIONS),
        multiSelect: true,
      },
    };
  }

  if (session.phase === "payments") {
    session.requirements.paymentMethods = input.selections?.length
      ? input.selections
      : text
          .split(/[,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);
    session.phase = "budget";
    return {
      session,
      response: {
        reply: "What is your estimated budget?",
        phase: "budget",
        choices: choicesFrom(BUDGET_OPTIONS),
      },
    };
  }

  if (session.phase === "budget") {
    session.budget = input.selections?.[0] ?? text;
    session.phase = "timeline";
    return {
      session,
      response: {
        reply: "When do you need the project completed?",
        phase: "timeline",
        choices: choicesFrom(TIMELINE_OPTIONS),
      },
    };
  }

  if (session.phase === "timeline") {
    session.timeline = input.selections?.[0] ?? text;
    session.phase = "contact";
    return {
      session,
      response: {
        reply:
          "Almost done — share your name and email so our team can follow up (e.g. Yafet, hello@company.com). Or tap Skip to see your brief now.",
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
        reply: "Here's your personalized project brief. Our team can turn this into a formal proposal.",
        phase: "complete",
        complete: true,
        brief,
        leadScore,
      },
    };
  }

  const brief = buildProjectBrief(session);
  return {
    session,
    response: {
      reply: "Your project brief is ready below.",
      phase: "complete",
      complete: true,
      brief,
      leadScore: computeLeadScore(session),
    },
  };
}
