import {
  completenessScore,
  factValue,
  hasClientSubstance,
  type ProjectModel,
} from "@/lib/project-model";
import type { ProjectBrief } from "@/lib/project-consultant.shared";

function section(title: string, body: string | null | undefined): string {
  const text = (body ?? "").trim();
  if (!text) return "";
  return `## ${title}\n\n${text}\n`;
}

function bullet(label: string, value: string | undefined): string {
  if (!value?.trim()) return "";
  return `* **${label}:** ${value.trim()}`;
}

/** Build client + team briefs strictly from structured project data — no invented fields. */
export function buildBriefFromProjectModel(model: ProjectModel): ProjectBrief {
  const substance = hasClientSubstance(model);
  const { missing, percent } = completenessScore(model);
  const preliminary = !substance || percent < 100 || missing.length > 0;

  const projectType =
    factValue(model.identity.projectType) ||
    factValue(model.identity.name) ||
    (substance ? "Custom digital project" : "Project (details pending)");
  const industry = factValue(model.identity.industry) || "Not provided";
  const products =
    factValue(model.scope.products) ||
    factValue(model.identity.shortDescription) ||
    "Not provided";
  const payments = factValue(model.commercial.paymentMethods) ?? [];
  const timeline = factValue(model.timeline.clientTimeline) || "Not provided";
  const budget = factValue(model.commercial.clientBudget) || "Not provided";
  const need = factValue(model.identity.problem) || "Not provided";
  const expectations =
    factValue(model.scope.objectives) || factValue(model.identity.vision) || "Not provided";

  const confirmedFeatures = model.scope.features.filter(
    (f) => f.status === "client_provided" || f.status === "client_confirmed"
  );
  const suggestedFeatures = model.recommendations.filter(
    (r) => r.category === "feature" && r.status === "ai_suggested"
  );

  const recommendedFeatures = [
    ...confirmedFeatures.map((f) => f.name),
    ...suggestedFeatures.map((r) => `${r.title} (suggested)`),
  ].slice(0, 12);

  const estimatedTimeline =
    factValue(model.timeline.estimatedDuration) || "To be determined";
  const estimatedCost = factValue(model.commercial.estimatedCost) || "To be determined";

  const clientSummary = substance
    ? [
        factValue(model.identity.shortDescription) ||
          `A ${projectType.toLowerCase()} for ${industry === "Not provided" ? "your audience" : industry}.`,
        need !== "Not provided" ? `Core need: ${need}` : null,
        expectations !== "Not provided" ? `Success looks like: ${expectations}` : null,
      ]
        .filter(Boolean)
        .join(" ")
    : "We have started a conversation, but there is not enough confirmed project detail yet for a full proposal.";

  const banner = preliminary
    ? "> **PRELIMINARY — SUBJECT TO CLIENT CONFIRMATION**\n>\n> Unknown items are marked “Not provided” or “To be determined”. Nothing below was invented to fill gaps.\n"
    : "";

  const whatYouTold = [
    bullet("What you’re building", projectType !== "Project (details pending)" ? projectType : undefined),
    bullet("Who it’s for", industry !== "Not provided" ? industry : factValue(model.stakeholders.intendedUsers)),
    bullet("What it should do", products !== "Not provided" ? products : undefined),
    bullet("Payments", payments.length ? payments.join(", ") : undefined),
    bullet("Preferred timeline", timeline !== "Not provided" ? timeline : undefined),
    bullet("Stated budget", budget !== "Not provided" ? budget : undefined),
  ]
    .filter(Boolean)
    .join("\n");

  const featureBlock = recommendedFeatures.length
    ? recommendedFeatures.map((f) => `✅ ${f}`).join("\n")
    : "_No confirmed or approved features yet._";

  const openQs = model.openQuestions.length
    ? model.openQuestions.map((q) => `* ${q.question}`).join("\n")
    : "_None listed._";

  const markdown = [
    "# Your Project Brief",
    "",
    banner,
    section("In plain terms", clientSummary),
    section("What you need", need !== "Not provided" ? need : null),
    section("What success looks like", expectations !== "Not provided" ? expectations : null),
    whatYouTold ? `## What you told us\n\n${whatYouTold}\n` : "",
    `## Scope & features\n\n${featureBlock}\n`,
    section(
      "Timeline & investment",
      [
        `* **Client timeline preference:** ${timeline}`,
        `* **Estimated delivery (suggestion):** ${estimatedTimeline}`,
        `* **Client budget (if stated):** ${budget}`,
        `* **Estimated investment (suggestion):** ${estimatedCost}`,
        "",
        "Estimates are suggestions only until discovery confirms scope.",
      ].join("\n")
    ),
    missing.length
      ? `## Still needed\n\n${missing.map((m) => `* ${m}`).join("\n")}\n`
      : "",
    `## Outstanding questions\n\n${openQs}\n`,
    section(
      "Next steps",
      [
        "1. Review this brief and correct anything that doesn’t match your intent.",
        "2. Confirm or reject suggested features in Plan.",
        "3. Book a consultation to lock scope and commercial terms.",
      ].join("\n")
    ),
  ]
    .filter(Boolean)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const teamMarkdown = [
    "# Internal Consultation Brief",
    "",
    preliminary ? "## Status\n\nPRELIMINARY — awaiting client confirmation.\n" : "",
    "## Opportunity snapshot",
    "",
    `* **Planning stage:** ${model.planningStage}`,
    `* **Completeness:** ${percent}%`,
    `* **Project type:** ${projectType}`,
    `* **Industry:** ${industry}`,
    `* **Client budget:** ${budget}`,
    `* **Client timeline:** ${timeline}`,
    `* **Est. cost (AI):** ${estimatedCost}`,
    `* **Est. duration (AI):** ${estimatedTimeline}`,
    "",
    "## Core need",
    "",
    need,
    "",
    "## Final expectations",
    "",
    expectations,
    "",
    "## Structured requirements",
    "",
    `* **Products / scope:** ${products}`,
    `* **Users:** ${factValue(model.stakeholders.intendedUsers) || "—"}`,
    `* **Payments:** ${payments.length ? payments.join(", ") : "—"}`,
    `* **Contact:** ${factValue(model.stakeholders.clientName) || "—"} <${factValue(model.stakeholders.clientEmail) || "no email"}>`,
    "",
    "## Recommendations",
    "",
    model.recommendations.length
      ? model.recommendations.map((r) => `- [${r.status}] ${r.title}: ${r.detail}`).join("\n")
      : "- None yet",
    "",
    "## Open questions",
    "",
    openQs,
    "",
    "## Change log",
    "",
    model.changeLog.length
      ? model.changeLog
          .slice(-8)
          .map((c) => `- ${c.at}: ${c.summary}`)
          .join("\n")
      : "- —",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    projectType,
    industry,
    products,
    payments,
    timeline,
    budget,
    recommendedFeatures: recommendedFeatures.length
      ? recommendedFeatures
      : ["Discovery workshop (to confirm scope)"],
    estimatedTimeline,
    estimatedCost,
    complexity: percent >= 75 ? "Medium" : "Low",
    leadLabel: preliminary ? "Early Stage" : "Qualified Lead",
    clientSummary,
    markdown,
    teamMarkdown,
    preliminary,
    documentVersion: model.version,
    lastUpdated: model.lastUpdated,
  };
}
