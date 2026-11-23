import { describe, expect, it } from "vitest";
import { buildClientBriefEmailContent } from "./project-brief-document";
import {
  briefMarkdownForTeam,
  clientFacingBriefMarkdown,
  type ProjectBrief,
} from "./project-consultant.shared";

const brief: ProjectBrief = {
  projectType: "Adera",
  industry: "Emergency systems",
  products: "Citizen + responder platform",
  payments: ["Chapa", "Telebirr"],
  timeline: "3 Months",
  budget: "$2,000–$10,000",
  recommendedFeatures: ["Admin Dashboard", "Contact Forms"],
  estimatedTimeline: "8–12 Weeks",
  estimatedCost: "$3,500–$5,000",
  complexity: "Medium",
  leadLabel: "Qualified Lead",
  clientSummary: "A clear platform for citizens and responders to coordinate emergencies faster.",
  markdown:
    "# Your Project Brief\n\n## In plain terms\n\nEasy for stakeholders.\n\n## Notes for Sales Team\n\nShould never leak.\n",
  teamMarkdown:
    "# Internal Consultation Brief\n\n## Opportunity snapshot\n\n* Lead label: Qualified Lead\n",
  salesNotes: "Upsell hosted monitoring.",
};

describe("buildClientBriefEmailContent", () => {
  it("builds branded HTML/text with escaped visitor values", () => {
    const content = buildClientBriefEmailContent({
      clientName: 'Ada <script>x</script>',
      brief,
      env: { NEXT_PUBLIC_SITE_URL: "https://awuddigitals.com" },
    });
    expect(content.subject).toContain("Adera");
    expect(content.text).toContain("Citizen + responder platform");
    expect(content.text).toContain("coordinate emergencies faster");
    expect(content.html).toContain("Awud Digitals");
    expect(content.html).toContain("/brand/awud-mark.png");
    expect(content.html).toContain("Admin Dashboard");
    expect(content.html).toContain("coordinate emergencies faster");
    expect(content.html).not.toContain("<script>");
    expect(content.html).toContain("&lt;script&gt;");
  });
});

describe("dual brief helpers", () => {
  it("keeps internal notes out of the client-facing markdown", () => {
    const client = clientFacingBriefMarkdown(brief);
    expect(client).toContain("In plain terms");
    expect(client).not.toContain("Should never leak");
  });

  it("stores a structured team brief plus client reference", () => {
    const team = briefMarkdownForTeam(brief);
    expect(team).toContain("Internal Consultation Brief");
    expect(team).toContain("Opportunity snapshot");
    expect(team).toContain("Upsell hosted monitoring");
    expect(team).toContain("Client-facing brief (reference)");
    expect(team).toContain("In plain terms");
  });
});
