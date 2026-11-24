"use client";

import { jsPDF } from "jspdf";
import { clientBriefMarkdown } from "@/lib/project-brief-document";
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

/** Multi-page branded PDF from grounded brief fields — no invented content. */
export function downloadBriefPdf(brief: ProjectBrief) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = 56;
  let page = 1;

  const footer = () => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.text("Awud Digitals · Confidential", margin, pageH - 28);
    doc.text(`Page ${page}`, pageW - margin, pageH - 28, { align: "right" });
  };

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - 56) {
      footer();
      doc.addPage();
      page += 1;
      y = 56;
    }
  };

  // Cover bar
  doc.setFillColor(12, 12, 12);
  doc.rect(0, 0, pageW, 88, "F");
  doc.setTextColor(255, 106, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("AWUD DIGITALS", margin, 36);
  doc.setTextColor(250, 250, 250);
  doc.setFontSize(20);
  doc.text("Project Brief", margin, 62);
  if (brief.preliminary) {
    doc.setFontSize(9);
    doc.setTextColor(255, 180, 120);
    doc.text("PRELIMINARY — SUBJECT TO CLIENT CONFIRMATION", margin, 78);
  }
  y = 112;

  doc.setTextColor(26, 26, 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(brief.projectType || "Project", maxW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 26 + 8;

  if (brief.clientSummary?.trim()) {
    ensureSpace(48);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 70);
    const summaryLines = doc.splitTextToSize(brief.clientSummary.trim(), maxW);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 14 + 18;
  }

  const addHeading = (label: string) => {
    ensureSpace(36);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 106, 0);
    doc.text(label.toUpperCase(), margin, y);
    y += 16;
    doc.setDrawColor(235, 230, 223);
    doc.line(margin, y - 10, pageW - margin, y - 10);
  };

  const addBody = (text: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      ensureSpace(16);
      doc.text(line, margin, y);
      y += 14;
    }
    y += 8;
  };

  const rows: [string, string][] = [
    ["Industry", brief.industry],
    ["Scope", brief.products],
    ["Payments", brief.payments.join(", ") || "Not provided"],
    ["Preferred timeline", brief.timeline],
    ["Stated budget", brief.budget],
  ];

  addHeading("What you told us");
  for (const [label, value] of rows) {
    ensureSpace(32);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(label.toUpperCase(), margin, y);
    y += 12;
    addBody(value || "Not provided");
  }

  addHeading("Recommended features");
  for (const feature of brief.recommendedFeatures) {
    ensureSpace(18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 26);
    const lines = doc.splitTextToSize(`•  ${feature}`, maxW);
    doc.text(lines, margin, y);
    y += lines.length * 14 + 4;
  }
  y += 10;

  addHeading("Timeline & investment");
  ensureSpace(70);
  const boxW = (maxW - 12) / 2;
  doc.setFillColor(247, 245, 241);
  doc.roundedRect(margin, y, boxW, 56, 8, 8, "F");
  doc.roundedRect(margin + boxW + 12, y, boxW, 56, 8, 8, "F");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text("EST. TIMELINE", margin + 14, y + 18);
  doc.text("EST. COST", margin + boxW + 26, y + 18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  doc.setFontSize(11);
  doc.text(brief.estimatedTimeline, margin + 14, y + 38);
  doc.text(brief.estimatedCost, margin + boxW + 26, y + 38);
  y += 72;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  addBody(
    "Estimates are suggestions only. Confirmed commercial terms require discovery. Unknown items remain “Not provided”."
  );

  footer();
  doc.save(`awuddigitals-${safeFileSlug(brief.projectType)}-brief.pdf`);
}
