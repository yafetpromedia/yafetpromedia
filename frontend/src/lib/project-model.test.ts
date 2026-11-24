import { describe, expect, it } from "vitest";
import { buildBriefFromProjectModel } from "./project-brief-from-model";
import { advanceConsultation, createSession } from "./project-consultant-engine";
import {
  applyExtractedUpdates,
  completenessScore,
  emptyProjectModel,
  hasClientSubstance,
  isGreetingOnly,
  setRecommendationStatus,
  upsertRecommendations,
} from "./project-model";

describe("isGreetingOnly", () => {
  it("treats simple greetings as non-projects", () => {
    expect(isGreetingOnly("Hey")).toBe(true);
    expect(isGreetingOnly("hello!")).toBe(true);
    expect(isGreetingOnly("I want a school platform")).toBe(false);
  });
});

describe("project model provenance", () => {
  it("does not invent budget from empty model", () => {
    const model = emptyProjectModel();
    expect(hasClientSubstance(model)).toBe(false);
    expect(completenessScore(model).percent).toBe(0);
    const brief = buildBriefFromProjectModel(model);
    expect(brief.budget).toBe("Not provided");
    expect(brief.preliminary).toBe(true);
    expect(brief.markdown).toContain("PRELIMINARY");
    expect(brief.markdown).not.toMatch(/\$2,000–\$10,000/);
  });

  it("applies client facts and blocks AI overwrite of client budget", () => {
    let model = emptyProjectModel();
    model = applyExtractedUpdates(model, [
      { path: "identity.projectType", value: "School platform", status: "client_provided" },
      { path: "identity.problem", value: "Schools manage attendance on paper", status: "client_provided" },
      { path: "commercial.clientBudget", value: "$2,000–$10,000", status: "client_provided" },
    ]);
    model = applyExtractedUpdates(model, [
      { path: "commercial.clientBudget", value: "Enterprise", status: "ai_suggested" },
    ]);
    expect(model.commercial.clientBudget?.value).toBe("$2,000–$10,000");
  });

  it("supersedes corrected platforms", () => {
    let model = emptyProjectModel();
    model = applyExtractedUpdates(model, [
      { path: "scope.platforms", value: "Mobile app", status: "client_provided" },
    ]);
    model = applyExtractedUpdates(model, [
      { path: "scope.platforms", value: "Web platform only", status: "client_provided" },
    ]);
    expect(model.scope.platforms?.value).toBe("Web platform only");
    expect(model.changeLog.some((c) => c.summary.includes("scope.platforms"))).toBe(true);
  });

  it("keeps rejected recommendations rejected", () => {
    let model = emptyProjectModel();
    model = upsertRecommendations(model, [
      {
        id: "r1",
        category: "feature",
        title: "Native iOS app",
        detail: "Build native apps",
        status: "ai_suggested",
      },
    ]);
    model = setRecommendationStatus(model, "r1", "rejected");
    model = upsertRecommendations(model, [
      {
        id: "r1",
        category: "feature",
        title: "Native iOS app",
        detail: "Build native apps again",
        status: "ai_suggested",
      },
    ]);
    expect(model.recommendations.find((r) => r.id === "r1")?.status).toBe("rejected");
  });
});

describe("advanceConsultation greeting", () => {
  it("does not fabricate a project from Hey", () => {
    const started = advanceConsultation({
      session: createSession("test-1"),
      action: "start",
    });
    const after = advanceConsultation({
      session: started.session,
      action: "message",
      message: "Hey",
    });
    expect(after.response.reply.toLowerCase()).toContain("building");
    expect(after.response.brief).toBeUndefined();
    expect(after.response.complete).toBeFalsy();
    const model = after.session.requirements.projectModel;
    expect(model?.commercial.clientBudget).toBeNull();
    expect(hasClientSubstance(model!)).toBe(false);
  });

  it("refuses brief without substance", () => {
    const started = advanceConsultation({
      session: createSession("test-2"),
      action: "start",
    });
    const after = advanceConsultation({
      session: started.session,
      action: "request_brief",
    });
    expect(after.response.complete).toBeFalsy();
    expect(after.response.reply.toLowerCase()).toMatch(/enough|detail|build/);
  });
});
