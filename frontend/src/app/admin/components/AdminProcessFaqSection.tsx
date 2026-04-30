"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CircleHelp,
  HelpCircle,
  ListChecks,
  MessageSquareText,
  Plus,
  Trash2,
  Workflow,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { FaqItem, ProcessStep, SiteContent } from "@/lib/site-content.shared";
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

const STEP_MAX = 12;
const FAQ_MAX = 12;

function emptyProcessStep(): ProcessStep {
  return { text: "" };
}

function emptyFaqItem(): FaqItem {
  return { question: "", answer: "" };
}

export default function AdminProcessFaqSection({ draft, setDraft }: Props) {
  const [stepFilter, setStepFilter] = useState("");
  const [faqFilter, setFaqFilter] = useState("");
  const filteredProcessSteps = useMemo(() => {
    const indexed = draft.processSteps.map((step, index) => ({ step, index }));
    if (!stepFilter.trim()) return indexed;
    return indexed.filter(({ step }) => matchesAdminFilter(stepFilter, step.text));
  }, [draft.processSteps, stepFilter]);

  const filteredFaqs = useMemo(() => {
    const indexed = draft.faqItems.map((faq, index) => ({ faq, index }));
    if (!faqFilter.trim()) return indexed;
    return indexed.filter(({ faq }) => matchesAdminFilter(faqFilter, faq.question, faq.answer));
  }, [draft.faqItems, faqFilter]);

  const patchStep = (index: number, text: string) =>
    setDraft((prev) => ({
      ...prev,
      processSteps: prev.processSteps.map((item, i) => (i === index ? { text } : item)),
    }));

  const moveStep = (index: number, dir: -1 | 1) =>
    setDraft((prev) => {
      const next = [...prev.processSteps];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, processSteps: next };
    });

  const patchFaq = (index: number, patch: Partial<FaqItem>) =>
    setDraft((prev) => ({
      ...prev,
      faqItems: prev.faqItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));

  const moveFaq = (index: number, dir: -1 | 1) =>
    setDraft((prev) => {
      const next = [...prev.faqItems];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, faqItems: next };
    });

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-primary/[0.09] via-card/92 to-indigo-500/[0.08] p-6 shadow-[0_28px_80px_-44px_rgba(255,106,0,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-primary/[0.12] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-indigo-500/[0.1] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/28">
              <ListChecks className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/90">
                Homepage · Process &amp; FAQ
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Journey &amp; answers
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Section copy plus two columns on the site: ordered checklist steps and an accordion FAQ—each with its own
                small-cap label (max {STEP_MAX} steps, {FAQ_MAX} questions).
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 rounded-2xl border border-white/[0.08] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <Workflow className="size-3.5 text-primary/80" />
            {draft.processSteps.length} steps · {draft.faqItems.length} FAQs
          </div>
        </div>
      </div>

      {/* Section header */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <MessageSquareText className="size-4 text-primary/75" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Section header</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Eyebrow / tag</span>
            <input
              value={draft.processFaqSectionTag}
              onChange={(e) => setDraft((prev) => ({ ...prev, processFaqSectionTag: e.target.value }))}
              className={inputCls}
              placeholder="e.g. HOW WE WORK"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Main title</span>
            <input
              value={draft.processFaqSectionTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, processFaqSectionTitle: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>
        <label className="mt-6 block">
          <span className={labelCls}>Intro</span>
          <textarea
            rows={3}
            value={draft.processFaqSectionDescription}
            onChange={(e) => setDraft((prev) => ({ ...prev, processFaqSectionDescription: e.target.value }))}
            className={textareaCls}
            placeholder="Supporting paragraph above the two columns."
          />
        </label>

        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-border/45 pt-8 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Process column label</span>
            <input
              value={draft.processFaqProcessCardLabel}
              onChange={(e) => setDraft((prev) => ({ ...prev, processFaqProcessCardLabel: e.target.value }))}
              placeholder="Small caps above the checklist"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>FAQ column label</span>
            <input
              value={draft.processFaqFaqCardLabel}
              onChange={(e) => setDraft((prev) => ({ ...prev, processFaqFaqCardLabel: e.target.value }))}
              placeholder="Small caps above the accordion"
              className={inputCls}
            />
          </label>
        </div>
      </section>

      {/* Two columns */}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2 xl:gap-10">
        {/* Process */}
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
                Checklist
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Workflow className="size-5 text-primary/85" />
                <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Process steps</h4>
              </div>
              <p className="mt-1 text-sm text-foreground/52">Ordered bullets shown as numbered rows on the site.</p>
            </div>
            <button
              type="button"
              disabled={draft.processSteps.length >= STEP_MAX}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  processSteps: [...prev.processSteps, emptyProcessStep()],
                }))
              }
              className={cn(ghostBtn, "text-primary")}
            >
              <Plus className="size-3.5" />
              Add step
            </button>
          </div>

          <AdminListFilter
            id="admin-process-steps-filter"
            value={stepFilter}
            onChange={setStepFilter}
            placeholder="Filter steps…"
            resultHint={
              stepFilter.trim()
                ? `${filteredProcessSteps.length} of ${draft.processSteps.length} shown`
                : undefined
            }
          />

          <div className="space-y-4 rounded-3xl border border-white/[0.06] bg-card/45 p-5 backdrop-blur-sm dark:bg-card/30 sm:p-6">
            {filteredProcessSteps.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
                No steps match this filter.
              </p>
            ) : null}
            {filteredProcessSteps.map(({ step, index }) => (
              <div
                key={`process-${index}`}
                className="rounded-2xl border border-white/[0.06] bg-background/60 p-4 ring-1 ring-black/[0.03] dark:bg-white/[0.03]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex rounded-full bg-primary/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Step {index + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveStep(index, -1)}
                      className={reorderBtn}
                      aria-label="Move step up"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === draft.processSteps.length - 1}
                      onClick={() => moveStep(index, 1)}
                      className={reorderBtn}
                      aria-label="Move step down"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          processSteps: prev.processSteps.filter((_, i) => i !== index),
                        }))
                      }
                      className={cn(
                        ghostBtn,
                        "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                      )}
                      aria-label={`Remove step ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  value={step.text}
                  onChange={(e) => patchStep(index, e.target.value)}
                  placeholder={`Step ${index + 1} copy`}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
                Accordion
              </p>
              <div className="mt-1 flex items-center gap-2">
                <HelpCircle className="size-5 text-indigo-600/90 dark:text-indigo-400/90" />
                <h4 className="font-display text-lg font-bold tracking-tight text-foreground">FAQ items</h4>
              </div>
              <p className="mt-1 text-sm text-foreground/52">Question titles with expandable answers.</p>
            </div>
            <button
              type="button"
              disabled={draft.faqItems.length >= FAQ_MAX}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  faqItems: [...prev.faqItems, emptyFaqItem()],
                }))
              }
              className={cn(ghostBtn, "text-primary")}
            >
              <Plus className="size-3.5" />
              Add FAQ
            </button>
          </div>

          <AdminListFilter
            id="admin-faq-filter"
            value={faqFilter}
            onChange={setFaqFilter}
            placeholder="Filter FAQs by question or answer…"
            resultHint={
              faqFilter.trim()
                ? `${filteredFaqs.length} of ${draft.faqItems.length} shown`
                : undefined
            }
          />

          <div className="space-y-4 rounded-3xl border border-white/[0.06] bg-card/45 p-5 backdrop-blur-sm dark:bg-card/30 sm:p-6">
            {filteredFaqs.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
                No FAQs match this filter.
              </p>
            ) : null}
            {filteredFaqs.map(({ faq, index }) => (
              <div
                key={`faq-${index}`}
                className="rounded-2xl border border-indigo-500/12 bg-indigo-500/[0.03] p-4 ring-1 ring-indigo-500/10 dark:bg-indigo-500/[0.06]"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                    <CircleHelp className="size-3" />
                    FAQ {index + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveFaq(index, -1)}
                      className={reorderBtn}
                      aria-label="Move FAQ up"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === draft.faqItems.length - 1}
                      onClick={() => moveFaq(index, 1)}
                      className={reorderBtn}
                      aria-label="Move FAQ down"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          faqItems: prev.faqItems.filter((_, i) => i !== index),
                        }))
                      }
                      className={cn(
                        ghostBtn,
                        "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                      )}
                      aria-label={`Remove FAQ ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <label className="block">
                  <span className={labelCls}>Question</span>
                  <input
                    value={faq.question}
                    onChange={(e) => patchFaq(index, { question: e.target.value })}
                    placeholder={`Question ${index + 1}`}
                    className={inputCls}
                  />
                </label>
                <label className="mt-3 block">
                  <span className={labelCls}>Answer</span>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => patchFaq(index, { answer: e.target.value })}
                    placeholder="Answer shown when expanded"
                    className={textareaCls}
                  />
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="rounded-2xl border border-border/60 bg-muted/15 px-4 py-3 text-xs leading-relaxed text-foreground/55 dark:bg-white/[0.03]">
        On save, empty step lines and blank FAQ questions are dropped so the public site only shows real content.
      </p>
    </div>
  );
}
