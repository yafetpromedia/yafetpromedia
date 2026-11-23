"use client";

import { jsPDF } from "jspdf";
import {
  clientBriefMarkdown,
} from "@/lib/project-brief-document";
import type { ProjectBrief } from "@/lib/project-consultant.shared";

function safeFileSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "project"
  );
}

export function downloadBriefMarkdown(brief: ProjectBrief) {
  const markdown = clientBriefMarkdown(brief);
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `awuddigitals-${safeFileSlug(brief.projectType)}-brief.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Branded, print-clean PDF proposal for the visitor. */
export function downloadBriefPdf(brief: ProjectBrief) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = 56;

  const ensureSpace = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 48) {
      doc.addPage();
      y = 56;
    }
  };

  // Brand bar
  doc.setFillColor(12, 12, 12);
  doc.rect(0, 0, pageW, 72, "F");
  doc.setTextColor(255, 106, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("AWUD DIGITALS", margin, 32);
  doc.setTextColor(250, 250, 250);
  doc.setFontSize(18);
  doc.text("Project Brief", margin, 54);
  y = 100;

  doc.setTextColor(26, 26, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const titleLines = doc.splitTextToSize(brief.projectType || "Project", maxW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24 + 10;

  if (brief.clientSummary?.trim()) {
    ensureSpace(40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    const summaryLines = doc.splitTextToSize(brief.clientSummary.trim(), maxW);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 14 + 18;
  }

  const rows: [string, string][] = [
    ["Industry", brief.industry],
    ["Scope", brief.products],
    ["Payments", brief.payments.join(", ") || "—"],
    ["Preferred timeline", brief.timeline],
    ["Budget", brief.budget],
  ];

  doc.setFontSize(11);
  for (const [label, value] of rows) {
    ensureSpace(36);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text(label.toUpperCase(), margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(26, 26, 26);
    const lines = doc.splitTextToSize(value || "—", maxW);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 12;
  }

  ensureSpace(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 106, 0);
  doc.setFontSize(12);
  doc.text("RECOMMENDED FEATURES", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  for (const feature of brief.recommendedFeatures) {
    ensureSpace(18);
    const lines = doc.splitTextToSize(`•  ${feature}`, maxW);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 4;
  }

  y += 16;
  ensureSpace(70);
  const boxW = (maxW - 12) / 2;
  doc.setFillColor(247, 245, 241);
  doc.roundedRect(margin, y, boxW, 56, 8, 8, "F");
  doc.roundedRect(margin + boxW + 12, y, boxW, 56, 8, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("TIMELINE", margin + 14, y + 18);
  doc.text("EST. COST", margin + boxW + 26, y + 18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(12);
  doc.text(brief.estimatedTimeline, margin + 14, y + 38);
  doc.text(brief.estimatedCost, margin + boxW + 26, y + 38);

  y += 80;
  ensureSpace(40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Prepared by Awud Digitals · awuddigitals.com", margin, y);

  doc.save(`awuddigitals-${safeFileSlug(brief.projectType)}-brief.pdf`);
}
