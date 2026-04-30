"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BriefcaseBusiness,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { CaseStudyCard, SiteContent } from "@/lib/site-content.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48";

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-primary/55 focus:ring-2 focus:ring-primary/15",
  "dark:border-white/[0.09] dark:bg-white/[0.04]"
);

const textareaCls = cn(inputCls, "min-h-[88px] resize-y py-3 leading-relaxed");

const reorderBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-card/80 text-foreground/80 transition",
  "hover:border-primary/35 hover:bg-primary/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const ghostBtn =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/75 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:border-primary/35 hover:bg-primary/[0.07] disabled:pointer-events-none disabled:opacity-35";

const CASE_STUDY_MIN = 1;
const CASE_STUDY_MAX = 16;

function emptyCaseStudyCard(): CaseStudyCard {
  return {
    title: "New case study",
    category: "Category",
    problem: "",
    solution: "",
    result: "",
    stat: "",
    statLabel: "",
  };
}

export default function AdminCaseStudiesSection({ draft, setDraft }: Props) {
  const [cardFilter, setCardFilter] = useState("");
  const filteredCases = useMemo(() => {
    const indexed = draft.caseStudiesCards.map((card, index) => ({ card, index }));
    if (!cardFilter.trim()) return indexed;
    return indexed.filter(({ card }) =>
      matchesAdminFilter(
        cardFilter,
        card.title,
        card.category,
        card.problem,
        card.solution,
        card.result,
        card.stat,
        card.statLabel
      )
    );
  }, [draft.caseStudiesCards, cardFilter]);

  const moveCard = (index: number, dir: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.caseStudiesCards];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, caseStudiesCards: next };
    });
  };

  const patchCard = (index: number, patch: Partial<CaseStudyCard>) =>
    setDraft((prev) => ({
      ...prev,
      caseStudiesCards: prev.caseStudiesCards.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-sky-500/[0.08] via-card/92 to-primary/[0.06] p-6 shadow-[0_28px_80px_-44px_rgba(56,189,248,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-sky-400/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-primary/[0.1] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/28 dark:text-sky-400">
              <BriefcaseBusiness className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-700/95 dark:text-sky-400/95">
                Homepage · Case studies
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Proof & outcomes
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Section headline, intro, and the View-all catalog link—plus each tile&apos;s problem → solution → result
                story and headline metric (add/remove studies; max {CASE_STUDY_MAX}).
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <BarChart3 className="size-3.5 text-sky-600/85 dark:text-sky-400/90" />
            {draft.caseStudiesCards.length} studies
          </div>
        </div>
      </div>

      {/* Section header */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <TrendingUp className="size-4 text-sky-600/85 dark:text-sky-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Section header</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Eyebrow / tag</span>
            <input
              value={draft.caseStudiesSectionTag}
              onChange={(e) => setDraft((prev) => ({ ...prev, caseStudiesSectionTag: e.target.value }))}
              className={inputCls}
              placeholder="e.g. PROVEN ARCHITECTURE"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Main title</span>
            <input
              value={draft.caseStudiesSectionTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, caseStudiesSectionTitle: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>
        <label className="mt-6 block">
          <span className={labelCls}>Intro</span>
          <textarea
            rows={3}
            value={draft.caseStudiesSectionDescription}
            onChange={(e) => setDraft((prev) => ({ ...prev, caseStudiesSectionDescription: e.target.value }))}
            className={textareaCls}
            placeholder="Supporting copy under the title."
          />
        </label>
        <label className="mt-6 block max-w-xl">
          <span className={labelCls}>View all CTA</span>
          <p className="mb-2 text-xs text-foreground/48">
            When there are more than two tiles visible, this opens the full case catalog.
          </p>
          <input
            value={draft.caseStudiesSectionCtaLabel}
            onChange={(e) => setDraft((prev) => ({ ...prev, caseStudiesSectionCtaLabel: e.target.value }))}
            placeholder="View All Cases"
            className={inputCls}
          />
        </label>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Case tiles
            </p>
            <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Stories</h4>
            <p className="mt-1 max-w-lg text-sm text-foreground/52">
              Problem, solution, and result fuel the modal; stat pairs render as the KPI chip on each card.
            </p>
          </div>
          <button
            type="button"
            disabled={draft.caseStudiesCards.length >= CASE_STUDY_MAX}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                caseStudiesCards: [...prev.caseStudiesCards, emptyCaseStudyCard()],
              }))
            }
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add case study
          </button>
        </div>

        <AdminListFilter
          id="admin-case-studies-filter"
          value={cardFilter}
          onChange={setCardFilter}
          placeholder="Filter case studies…"
          resultHint={
            cardFilter.trim()
              ? `${filteredCases.length} of ${draft.caseStudiesCards.length} shown`
              : undefined
          }
          className="mb-2"
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredCases.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
              No case studies match this filter.
            </p>
          ) : null}
          {filteredCases.map(({ card, index }) => (
            <div
              key={`case-${index}`}
              className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-card/95 to-card/72 p-5 shadow-[0_22px_68px_-36px_rgba(0,0,0,0.62)] ring-1 ring-black/[0.04] transition hover:border-sky-500/18 dark:from-card/[0.93] dark:to-card/56 dark:shadow-[0_28px_80px_-40px_rgba(0,0,0,0.82)] sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/45 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 font-mono text-sm font-bold tabular-nums text-sky-800 ring-1 ring-sky-500/22 dark:text-sky-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {card.title.trim() || `Case ${index + 1}`}
                    </p>
                    <p className="truncate font-mono text-[11px] text-foreground/42">
                      {(card.category ?? "").trim() || "Category"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={draft.caseStudiesCards.length <= CASE_STUDY_MIN}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        caseStudiesCards: prev.caseStudiesCards.filter((_, i) => i !== index),
                      }))
                    }
                    className={cn(
                      ghostBtn,
                      "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    )}
                    aria-label={`Remove case study ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCard(index, -1)}
                    className={reorderBtn}
                    aria-label="Move case study up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.caseStudiesCards.length - 1}
                    onClick={() => moveCard(index, 1)}
                    className={reorderBtn}
                    aria-label="Move case study down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className={labelCls}>Title</span>
                  <input
                    value={card.title}
                    onChange={(e) => patchCard(index, { title: e.target.value })}
                    placeholder="Case title"
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Category</span>
                  <input
                    value={card.category}
                    onChange={(e) => patchCard(index, { category: e.target.value })}
                    placeholder="e.g. Infrastructure"
                    className={inputCls}
                  />
                </label>

                <div className="rounded-2xl border border-rose-500/18 bg-rose-500/[0.04] p-4 ring-1 ring-rose-500/10 dark:bg-rose-500/[0.06]">
                  <span className={cn(labelCls, "!mb-2 text-rose-800/90 dark:text-rose-300/95")}>Problem</span>
                  <textarea
                    rows={3}
                    value={card.problem}
                    onChange={(e) => patchCard(index, { problem: e.target.value })}
                    placeholder="What was broken or at risk?"
                    className={cn(
                      inputCls,
                      "border-rose-500/20 bg-background/90 dark:bg-background/40",
                      "min-h-[88px] resize-y py-3"
                    )}
                  />
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.05] p-4 ring-1 ring-sky-500/12 dark:bg-sky-500/[0.07]">
                  <span className={cn(labelCls, "!mb-2 text-sky-900/90 dark:text-sky-300/95")}>Solution</span>
                  <textarea
                    rows={3}
                    value={card.solution}
                    onChange={(e) => patchCard(index, { solution: e.target.value })}
                    placeholder="What we shipped or changed"
                    className={cn(
                      inputCls,
                      "border-sky-500/22 bg-background/90 dark:bg-background/40",
                      "min-h-[88px] resize-y py-3"
                    )}
                  />
                </div>

                <div className="rounded-2xl border border-amber-500/22 bg-amber-500/[0.05] p-4 ring-1 ring-amber-500/12 dark:bg-amber-500/[0.07]">
                  <span className={cn(labelCls, "!mb-2 text-amber-950/90 dark:text-amber-200/95")}>Result</span>
                  <textarea
                    rows={2}
                    value={card.result}
                    onChange={(e) => patchCard(index, { result: e.target.value })}
                    placeholder="Outcome narrative"
                    className={cn(
                      inputCls,
                      "border-amber-500/22 bg-background/90 dark:bg-background/40",
                      "min-h-[72px] resize-y py-3"
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className={labelCls}>Stat value</span>
                    <input
                      value={card.stat}
                      onChange={(e) => patchCard(index, { stat: e.target.value })}
                      placeholder="e.g. 40%"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Stat label</span>
                    <input
                      value={card.statLabel}
                      onChange={(e) => patchCard(index, { statLabel: e.target.value })}
                      placeholder="e.g. Admin overhead reduced"
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
