"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ChevronDown,
  GitCompare,
  Layers,
  LayoutTemplate,
  ListOrdered,
  Plus,
  Sparkles,
  Terminal,
  Trash2,
  Workflow,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { SiteContent } from "@/lib/site-content.shared";
import {
  type ExploreArchitectureTrack,
  type ExploreFlowStep,
  type ExploreStackCard,
  exploreLucideIconOptions,
} from "@/lib/explore-architecture.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const FLOW_ROW_MAX = 6;
const SERVICE_STRIP_MAX = 8;
const STACK_CARD_MAX = 8;
const BEFORE_AFTER_MAX = 6;

const emptyFlowStep = (): ExploreFlowStep => ({ label: "", detail: "", icon: "LayoutGrid" });
const emptyStackCard = (): ExploreStackCard => ({ name: "", value: "", note: "", icon: "LayoutGrid" });

const ghostBtn =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/75 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:border-primary/35 hover:bg-primary/[0.07] disabled:pointer-events-none disabled:opacity-35";

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48";

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-primary/55 focus:ring-2 focus:ring-primary/15",
  "dark:border-white/[0.09] dark:bg-white/[0.04]"
);

const textareaCls = cn(inputCls, "min-h-[88px] resize-y py-3 font-normal leading-relaxed");

const selectCls = cn(
  inputCls,
  "cursor-pointer appearance-none py-2.5 pr-10 text-[13px] font-medium text-foreground/90"
);

function IconSelect(value: string, onChange: (v: string) => void, id: string) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectCls}
      >
        {exploreLucideIconOptions.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground/40"
        aria-hidden
      />
    </div>
  );
}

export default function AdminExploreArchitectureEditor({ draft, setDraft }: Props) {
  const ex = draft.exploreArchitecture;
  const [tIdx, setTIdx] = useState(0);
  const track = ex.tracks[tIdx]!;
  const [serviceStripFilter, setServiceStripFilter] = useState("");
  const [trackDetailFilter, setTrackDetailFilter] = useState("");

  const selectTrack = (index: number) => {
    setTIdx(index);
    setTrackDetailFilter("");
  };

  const serviceStripPairs = useMemo(() => {
    const indexed = ex.serviceStrip.map((s, i) => ({ s, i }));
    if (!serviceStripFilter.trim()) return indexed;
    return indexed.filter(({ s }) => matchesAdminFilter(serviceStripFilter, s.label, s.icon));
  }, [ex.serviceStrip, serviceStripFilter]);

  const patch = (p: Partial<typeof ex>) =>
    setDraft((prev) => ({ ...prev, exploreArchitecture: { ...prev.exploreArchitecture, ...p } }));

  const setTrack = (index: number, p: Partial<ExploreArchitectureTrack>) => {
    setDraft((prev) => {
      const tr = [...prev.exploreArchitecture.tracks];
      tr[index] = { ...tr[index]!, ...p };
      return { ...prev, exploreArchitecture: { ...prev.exploreArchitecture, tracks: tr } };
    });
  };

  const mapFlow = (row: ExploreFlowStep[], rowKey: "flowRow1" | "flowRow2", title: string) => {
    const empty = emptyFlowStep();
    const steps = row.length > 0 ? row.slice(0, FLOW_ROW_MAX) : [empty];
    const flowPairs = steps
      .map((step, i) => ({ step, i }))
      .filter(({ step }) =>
        trackDetailFilter.trim()
          ? matchesAdminFilter(trackDetailFilter, step.label, step.detail, step.icon)
          : true
      );

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Workflow className="size-4 text-primary/85" />
            <h4 className="text-sm font-bold uppercase tracking-[0.12em] text-foreground/72">{title}</h4>
          </div>
          <button
            type="button"
            disabled={steps.length >= FLOW_ROW_MAX}
            onClick={() =>
              setTrack(tIdx, {
                [rowKey]: [...steps, { ...empty }],
              } as never)
            }
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add step
          </button>
        </div>
        {flowPairs.length === 0 && trackDetailFilter.trim() ? (
          <p className="text-sm text-foreground/50">No steps match this filter.</p>
        ) : null}
        {flowPairs.map(({ step, i }) => (
          <div
            key={`${rowKey}-${i}-${step.label}`}
            className="rounded-2xl border border-white/[0.06] bg-background/40 p-4 shadow-sm ring-1 ring-black/[0.03] dark:bg-white/[0.03]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex rounded-full bg-primary/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">
                Step {i + 1}
              </span>
              <button
                type="button"
                disabled={steps.length <= 1}
                onClick={() =>
                  setTrack(tIdx, {
                    [rowKey]: steps.filter((_, j) => j !== i),
                  } as never)
                }
                className={cn(ghostBtn, "border-red-500/25 text-red-600 hover:bg-red-500/10 dark:text-red-400")}
                aria-label={`Remove step ${i + 1}`}
              >
                <Trash2 className="size-3.5" />
                Remove
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-4">
              <label className="lg:col-span-5">
                <span className={labelCls}>Label</span>
                <input
                  value={step.label}
                  onChange={(e) => {
                    const next = steps.map((s, j) => (j === i ? { ...s, label: e.target.value } : s));
                    setTrack(tIdx, { [rowKey]: next } as never);
                  }}
                  className={inputCls}
                />
              </label>
              <label className="lg:col-span-4">
                <span className={labelCls}>Detail</span>
                <input
                  value={step.detail}
                  onChange={(e) => {
                    const next = steps.map((s, j) => (j === i ? { ...s, detail: e.target.value } : s));
                    setTrack(tIdx, { [rowKey]: next } as never);
                  }}
                  className={inputCls}
                />
              </label>
              <div className="lg:col-span-3">
                <span className={labelCls}>Icon</span>
                {IconSelect(
                  step.icon,
                  (v) => {
                    const next = steps.map((s, j) => (j === i ? { ...s, icon: v } : s));
                    setTrack(tIdx, { [rowKey]: next } as never);
                  },
                  `flow-${tIdx}-${rowKey}-${i}`
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const mapStack = (cards: ExploreStackCard[]) => {
    const empty = emptyStackCard();
    const list = cards.length > 0 ? cards.slice(0, STACK_CARD_MAX) : [empty];
    const stackPairs = list
      .map((c, i) => ({ c, i }))
      .filter(({ c }) =>
        trackDetailFilter.trim()
          ? matchesAdminFilter(trackDetailFilter, c.name, c.value, c.note, c.icon)
          : true
      );

    return (
      <div className="space-y-5">
        <div className="flex justify-end">
          <button
            type="button"
            disabled={list.length >= STACK_CARD_MAX}
            onClick={() => setTrack(tIdx, { stackCards: [...list, { ...empty }] })}
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add card
          </button>
        </div>
        {stackPairs.length === 0 && trackDetailFilter.trim() ? (
          <p className="text-sm text-foreground/50">No stack cards match this filter.</p>
        ) : null}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {stackPairs.map(({ c, i }) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-card/90 to-card/65 p-5 shadow-[0_16px_50px_-32px_rgba(0,0,0,0.55)] ring-1 ring-black/[0.04] transition hover:border-primary/18 dark:shadow-[0_20px_60px_-36px_rgba(0,0,0,0.75)]"
            >
              <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/45 pb-3">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/45">
                  Tool {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-2">
                  <Layers className="size-4 text-primary/55" />
                  <button
                    type="button"
                    disabled={list.length <= 1}
                    onClick={() => setTrack(tIdx, { stackCards: list.filter((_, j) => j !== i) })}
                    className={cn(
                      ghostBtn,
                      "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    )}
                    aria-label={`Remove stack card ${i + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className={labelCls}>Name</span>
                  <input
                    value={c.name}
                    onChange={(e) => {
                      const n = list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x));
                      setTrack(tIdx, { stackCards: n });
                    }}
                    className={inputCls}
                    placeholder="Service name"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Value</span>
                  <input
                    value={c.value}
                    onChange={(e) => {
                      const n = list.map((x, j) => (j === i ? { ...x, value: e.target.value } : x));
                      setTrack(tIdx, { stackCards: n });
                    }}
                    className={inputCls}
                    placeholder="Stack entry"
                  />
                </label>
                <label className="block">
                  <span className={labelCls}>Note</span>
                  <input
                    value={c.note}
                    onChange={(e) => {
                      const n = list.map((x, j) => (j === i ? { ...x, note: e.target.value } : x));
                      setTrack(tIdx, { stackCards: n });
                    }}
                    className={inputCls}
                    placeholder="Optional note"
                  />
                </label>
              </div>
              <div className="mt-4">
                <span className={labelCls}>Icon</span>
                {IconSelect(
                  c.icon,
                  (v) => {
                    const n = list.map((x, j) => (j === i ? { ...x, icon: v } : x));
                    setTrack(tIdx, { stackCards: n });
                  },
                  `stack-${tIdx}-${i}`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-sky-500/[0.07] via-card/90 to-primary/[0.06] p-6 shadow-[0_24px_70px_-42px_rgba(56,189,248,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -left-32 top-0 size-[280px] rounded-full bg-sky-400/[0.09] blur-[100px]" />
        <div className="pointer-events-none absolute -right-24 bottom-0 size-[240px] rounded-full bg-primary/[0.1] blur-[90px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 ring-1 ring-sky-500/25 dark:text-sky-400">
              <LayoutTemplate className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-600/90 dark:text-sky-400/95">
                Explore architecture
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">Modal content</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Edit the Explore dialog opened from the Systems section CTA. Three stacks align with public tabs — web,
                video, and brand workflows.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.07] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <Sparkles className="size-3.5 text-primary/75" />
            {ex.tracks.length} stacks · {ex.serviceStrip.length} pills
          </div>
        </div>
      </div>

      {/* Header & global labels */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <ListOrdered className="size-4 text-primary/75" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Header & sections</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {(
            [
              ["eyebrow", "Eyebrow"],
              ["title", "Title"],
            ] as const
          ).map(([k, lab]) => (
            <label key={k} className="block">
              <span className={labelCls}>{lab}</span>
              <input
                value={ex[k]}
                onChange={(e) => patch({ [k]: e.target.value } as never)}
                className={inputCls}
              />
            </label>
          ))}
        </div>
        <label className="mt-6 block">
          <span className={labelCls}>Description</span>
          <textarea
            rows={4}
            value={ex.description}
            onChange={(e) => patch({ description: e.target.value })}
            className={textareaCls}
          />
        </label>

        <div className="mt-8 border-t border-border/45 pt-8">
          <p className={cn(labelCls, "mb-4 normal-case tracking-normal text-foreground/55")}>
            Section headings inside the modal
          </p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {(
              [
                ["dataFlowSectionTitle", "Data flow"],
                ["stackSectionTitle", "Stack"],
                ["beforeAfterSectionTitle", "Before / after"],
                ["beforeLabel", "Before column"],
                ["afterLabel", "After column"],
              ] as const
            ).map(([k, lab]) => (
              <label key={k} className={k === "beforeAfterSectionTitle" ? "block md:col-span-2" : "block"}>
                <span className={labelCls}>{lab}</span>
                <input
                  value={ex[k] as string}
                  onChange={(e) => patch({ [k]: e.target.value } as never)}
                  className={inputCls}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 border-t border-border/45 pt-8 md:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Footer line</span>
            <input
              value={ex.closingLine}
              onChange={(e) => patch({ closingLine: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Primary CTA label</span>
            <input value={ex.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} className={inputCls} />
          </label>
        </div>
      </section>

      {/* Service strip */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-5">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-primary/75" />
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">
              Service strip ({ex.serviceStrip.length} pills)
            </h4>
          </div>
          <button
            type="button"
            disabled={ex.serviceStrip.length >= SERVICE_STRIP_MAX}
            onClick={() =>
              patch({
                serviceStrip: [...ex.serviceStrip, { label: "", icon: "LayoutGrid" }],
              })
            }
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add pill
          </button>
        </div>
        <AdminListFilter
          id="admin-explore-service-strip-filter"
          value={serviceStripFilter}
          onChange={setServiceStripFilter}
          placeholder="Filter service strip pills…"
          resultHint={
            serviceStripFilter.trim()
              ? `${serviceStripPairs.length} of ${ex.serviceStrip.length} shown`
              : undefined
          }
          className="mb-4"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {serviceStripPairs.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
              No pills match this filter.
            </p>
          ) : null}
          {serviceStripPairs.map(({ s, i }) => (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-background/50 p-4 ring-1 ring-black/[0.03] dark:bg-white/[0.03]"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex rounded-full bg-foreground/[0.06] px-2 py-0.5 font-mono text-[10px] font-semibold text-foreground/55">
                  Pill {i + 1}
                </span>
                <button
                  type="button"
                  disabled={ex.serviceStrip.length <= 1}
                  onClick={() =>
                    patch({
                      serviceStrip: ex.serviceStrip.filter((_, j) => j !== i),
                    })
                  }
                  className={cn(
                    ghostBtn,
                    "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  )}
                  aria-label={`Remove pill ${i + 1}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <label className="block">
                <span className={labelCls}>Label</span>
                <input
                  value={s.label}
                  onChange={(e) => {
                    const n = ex.serviceStrip.map((x, j) => (j === i ? { ...x, label: e.target.value } : x));
                    patch({ serviceStrip: n });
                  }}
                  className={inputCls}
                />
              </label>
              <div className="mt-4">
                <span className={labelCls}>Icon</span>
                {IconSelect(
                  s.icon,
                  (v) => {
                    const n = ex.serviceStrip.map((x, j) => (j === i ? { ...x, icon: v } : x));
                    patch({ serviceStrip: n });
                  },
                  `strip-${i}`
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Before / after */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-5">
          <div className="flex items-center gap-2">
            <GitCompare className="size-4 text-primary/75" />
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">
              Before vs after ({ex.beforeAfter.before.length} · {ex.beforeAfter.after.length} lines, max {BEFORE_AFTER_MAX}{" "}
              each)
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={
                ex.beforeAfter.before.length >= BEFORE_AFTER_MAX || ex.beforeAfter.after.length >= BEFORE_AFTER_MAX
              }
              onClick={() =>
                patch({
                  beforeAfter: {
                    ...ex.beforeAfter,
                    before: [...ex.beforeAfter.before, ""],
                    after: [...ex.beforeAfter.after, ""],
                  },
                })
              }
              className={cn(ghostBtn, "text-primary")}
            >
              <Plus className="size-3.5" />
              Add line pair
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5 ring-1 ring-red-500/10 dark:bg-red-500/[0.06]">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-red-600/95 dark:text-red-400/90">
              <span className="size-1.5 rounded-full bg-red-500/90" />
              {ex.beforeLabel || "Before"}
            </p>
            <div className="space-y-3">
              {ex.beforeAfter.before.map((line, i) => (
                <div key={`before-${i}`} className="flex gap-2">
                  <input
                    value={line}
                    onChange={(e) => {
                      const b = [...ex.beforeAfter.before];
                      b[i] = e.target.value;
                      patch({ beforeAfter: { ...ex.beforeAfter, before: b } });
                    }}
                    className={cn(inputCls, "min-w-0 flex-1 text-[14px]")}
                    placeholder={`Line ${i + 1}`}
                  />
                  <button
                    type="button"
                    disabled={ex.beforeAfter.before.length <= 1}
                    onClick={() =>
                      patch({
                        beforeAfter: {
                          ...ex.beforeAfter,
                          before: ex.beforeAfter.before.filter((_, j) => j !== i),
                          after:
                            ex.beforeAfter.after.length > i
                              ? ex.beforeAfter.after.filter((_, j) => j !== i)
                              : ex.beforeAfter.after,
                        },
                      })
                    }
                    className={cn(
                      ghostBtn,
                      "shrink-0 border-red-500/25 px-2.5 py-2 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    )}
                    aria-label={`Remove before line ${i + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-500/18 bg-emerald-500/[0.05] p-5 ring-1 ring-emerald-500/12 dark:bg-emerald-500/[0.07]">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700/95 dark:text-emerald-400/95">
              <span className="size-1.5 rounded-full bg-emerald-500/90" />
              {ex.afterLabel || "After"}
            </p>
            <div className="space-y-3">
              {ex.beforeAfter.after.map((line, i) => (
                <div key={`after-${i}`} className="flex gap-2">
                  <input
                    value={line}
                    onChange={(e) => {
                      const a = [...ex.beforeAfter.after];
                      a[i] = e.target.value;
                      patch({ beforeAfter: { ...ex.beforeAfter, after: a } });
                    }}
                    className={cn(inputCls, "min-w-0 flex-1 text-[14px]")}
                    placeholder={`Line ${i + 1}`}
                  />
                  <button
                    type="button"
                    disabled={ex.beforeAfter.after.length <= 1}
                    onClick={() =>
                      patch({
                        beforeAfter: {
                          ...ex.beforeAfter,
                          after: ex.beforeAfter.after.filter((_, j) => j !== i),
                          before:
                            ex.beforeAfter.before.length > i
                              ? ex.beforeAfter.before.filter((_, j) => j !== i)
                              : ex.beforeAfter.before,
                        },
                      })
                    }
                    className={cn(
                      ghostBtn,
                      "shrink-0 border-emerald-600/30 px-2.5 py-2 text-emerald-800 hover:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-300"
                    )}
                    aria-label={`Remove after line ${i + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Per-track */}
      <section className="space-y-8 rounded-3xl border border-white/[0.07] bg-gradient-to-b from-card/80 to-card/50 p-6 shadow-[0_28px_80px_-44px_rgba(0,0,0,0.65)] sm:p-8 dark:from-card/55 dark:to-card/35 dark:shadow-[0_32px_90px_-48px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="size-5 text-primary/85" />
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/48">
                Per stack
              </p>
              <h4 className="font-display text-lg font-bold tracking-tight text-foreground">
                Data flow · terminal · tools
              </h4>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 rounded-2xl border border-white/[0.06] bg-background/60 p-1.5 dark:bg-white/[0.03]">
          {ex.tracks.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => selectTrack(i)}
              className={cn(
                "min-h-[2.75rem] flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition sm:min-w-[140px]",
                tIdx === i
                  ? "bg-gradient-to-br from-primary to-[#ff8533] text-primary-foreground shadow-[0_10px_36px_-12px_rgba(255,106,0,0.65)]"
                  : "text-foreground/65 hover:bg-foreground/[0.06] hover:text-foreground"
              )}
            >
              <span className="block truncate">{t.tabLabel}</span>
              <span className="block truncate font-mono text-[10px] font-normal uppercase tracking-wider opacity-80">
                {t.id}
              </span>
            </button>
          ))}
        </div>

        <AdminListFilter
          id="admin-explore-track-detail-filter"
          value={trackDetailFilter}
          onChange={setTrackDetailFilter}
          placeholder="Filter data-flow steps & stack cards on this tab…"
          className="rounded-2xl border border-white/[0.06] bg-background/40 px-4 py-3"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Tab label</span>
            <input
              value={track.tabLabel}
              onChange={(e) => setTrack(tIdx, { tabLabel: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Stack summary</span>
            <input
              value={track.stackTitle}
              onChange={(e) => setTrack(tIdx, { stackTitle: e.target.value })}
              className={inputCls}
              placeholder='Shown next to "Stack we ship on"'
            />
          </label>
        </div>

        <div className="space-y-8 pt-2">
          {mapFlow(track.flowRow1, "flowRow1", "Data flow — row 1")}
          {mapFlow(track.flowRow2, "flowRow2", "Data flow — row 2")}
        </div>

        <label className="mt-4 block">
          <span className={labelCls}>Data flow footer</span>
          <textarea
            rows={3}
            value={track.flowFooter}
            onChange={(e) => setTrack(tIdx, { flowFooter: e.target.value })}
            className={textareaCls}
          />
        </label>

        <div className="mt-8 border-t border-border/45 pt-8">
          <div className="mb-4 flex items-center gap-2">
            <Terminal className="size-4 text-emerald-500/85 dark:text-emerald-400/90" />
            <span className={cn(labelCls, "!mb-0")}>TypeScript terminal</span>
          </div>
          <p className="mb-3 text-xs text-foreground/48">One line per row (max ~200 chars each).</p>
          <textarea
            rows={14}
            value={track.terminalLines.join("\n")}
            onChange={(e) =>
              setTrack(tIdx, {
                terminalLines: e.target.value.split("\n").map((l) => l.slice(0, 200)),
              })
            }
            className={cn(
              "w-full max-h-[28rem] min-h-[220px] rounded-2xl border border-emerald-500/15 bg-[#0b1220] px-4 py-4 font-mono text-[12px] leading-relaxed text-emerald-100/95 outline-none ring-1 ring-white/[0.06]",
              "placeholder:text-emerald-900/40 focus:border-emerald-500/35 focus:ring-2 focus:ring-emerald-500/15",
              "dark:bg-[#070d18]"
            )}
            spellCheck={false}
          />
        </div>

        <div className="mt-10 border-t border-border/45 pt-10">
          <div className="mb-6 flex items-center gap-2">
            <Layers className="size-4 text-primary/80" />
            <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">
              Stack cards ({track.stackCards.length})
            </h4>
          </div>
          {mapStack(track.stackCards)}
        </div>
      </section>
    </div>
  );
}
