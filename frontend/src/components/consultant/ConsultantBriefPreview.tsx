"use client";

import { Download, FileText, X } from "lucide-react";
import { useState } from "react";
import type { ProjectBrief } from "@/lib/project-consultant.shared";
import { downloadBriefMarkdown, downloadBriefPdf } from "@/lib/download-project-brief";

type Props = {
  brief: ProjectBrief;
  emailed?: boolean;
  onClose: () => void;
};

function SimpleMarkdown({ markdown }: { markdown: string }) {
  const blocks = markdown.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-[13px] leading-relaxed text-[#1a1a1a]">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const first = lines[0] ?? "";
        if (first.startsWith("# ")) {
          return (
            <h2 key={i} className="font-display text-xl font-semibold tracking-tight">
              {first.replace(/^#\s+/, "")}
            </h2>
          );
        }
        if (first.startsWith("## ")) {
          return (
            <h3
              key={i}
              className="border-b border-[#ebe6df] pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ff6a00]"
            >
              {first.replace(/^##\s+/, "")}
            </h3>
          );
        }
        if (first.startsWith(">")) {
          return (
            <aside
              key={i}
              className="rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-950"
            >
              {lines.map((l) => l.replace(/^>\s?/, "")).join(" ")}
            </aside>
          );
        }
        if (lines.every((l) => l.trim().startsWith("*") || l.trim().startsWith("✅") || !l.trim())) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines
                .filter((l) => l.trim())
                .map((l, j) => (
                  <li key={j} className="pl-1">
                    {l.replace(/^\*\s*/, "").replace(/^✅\s*/, "✓ ")}
                  </li>
                ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap text-[#333]">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export default function ConsultantBriefPreview({ brief, emailed, onClose }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[#ebe6df] bg-white/95 px-4 py-2.5 backdrop-blur">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ff6a00]">
            Awud Digitals · Project brief
            {brief.preliminary ? " · Preliminary" : ""}
          </p>
          <p className="text-[12px] text-foreground/50">
            v{brief.documentVersion ?? 1}
            {brief.lastUpdated
              ? ` · Updated ${new Date(brief.lastUpdated).toLocaleString()}`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label="Close brief"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <article className="mx-auto max-w-lg rounded-2xl border border-[#ebe6df] bg-white p-5 shadow-[0_12px_40px_-28px_rgba(12,12,12,0.35)]">
          <header className="mb-5 border-b border-[#0c0c0c] pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#ff6a00]">
              Awud Digitals
            </p>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#0c0c0c]">
              {brief.projectType}
            </h1>
            {brief.clientSummary ? (
              <p className="mt-2 text-[13px] leading-relaxed text-[#555]">{brief.clientSummary}</p>
            ) : null}
          </header>
          <SimpleMarkdown markdown={brief.markdown} />
        </article>
        {emailed ? (
          <p className="mx-auto mt-3 max-w-lg text-center text-[11px] text-foreground/50">
            A copy was also emailed to you.
          </p>
        ) : null}
      </div>

      <div className="relative shrink-0 border-t border-[#ebe6df] bg-white p-3">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0c0c0c] py-2.5 text-sm font-semibold text-white"
        >
          <Download className="size-4" /> Download proposal
        </button>
        {menuOpen ? (
          <div className="absolute inset-x-3 bottom-[calc(100%+0.4rem)] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm hover:bg-muted/60"
              onClick={() => {
                downloadBriefPdf(brief);
                setMenuOpen(false);
              }}
            >
              <FileText className="size-4 text-[#ff6a00]" />
              PDF — professional proposal
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 border-t border-border/60 px-3.5 py-2.5 text-left text-sm hover:bg-muted/60"
              onClick={() => {
                downloadBriefMarkdown(brief);
                setMenuOpen(false);
              }}
            >
              <FileText className="size-4 text-foreground/50" />
              Markdown (.md)
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
