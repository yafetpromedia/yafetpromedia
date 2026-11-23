import { describe, expect, it } from "vitest";
import { buildClientBriefEmailContent } from "./project-brief-document";
import type { ProjectBrief } from "./project-consultant.shared";

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
  markdown: "# Project Brief\n\n### Client Requirements\n* Project Type: Adera\n",
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
    expect(content.html).toContain("Awud Digitals");
    expect(content.html).toContain("/brand/awud-mark.png");
    expect(content.html).toContain("Admin Dashboard");
    expect(content.html).not.toContain("<script>");
    expect(content.html).toContain("&lt;script&gt;");
  });
});
