"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { SiteContent } from "@/lib/site-content.shared";
import {
  type ExploreArchitectureTrack,
  type ExploreFlowStep,
  type ExploreStackCard,
  exploreLucideIconOptions,
} from "@/lib/explore-architecture.shared";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

function iconSelect(
  value: string,
  onChange: (v: string) => void,
  id: string
) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-border bg-card px-2 text-xs outline-none focus:border-primary"
    >
      {exploreLucideIconOptions.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

export default function AdminExploreArchitectureEditor({ draft, setDraft }: Props) {
  const ex = draft.exploreArchitecture;
  const [tIdx, setTIdx] = useState(0);
  const track = ex.tracks[tIdx]!;

  const patch = (p: Partial<typeof ex>) =>
    setDraft((prev) => ({ ...prev, exploreArchitecture: { ...prev.exploreArchitecture, ...p } }));

  const setTrack = (index: number, p: Partial<ExploreArchitectureTrack>) => {
    setDraft((prev) => {
      const tr = [...prev.exploreArchitecture.tracks];
      tr[index] = { ...tr[index]!, ...p };
      return { ...prev, exploreArchitecture: { ...prev.exploreArchitecture, tracks: tr } };
    });
  };

  const mapFlow = (
    row: ExploreFlowStep[],
    rowKey: "flowRow1" | "flowRow2",
    defLen: 2 | 3
  ) => {
    const padded: ExploreFlowStep[] = [...row];
    const empty = { label: "", detail: "", icon: "LayoutGrid" };
    while (padded.length < defLen) padded.push({ ...empty });
    return (
      <div className="space-y-3">
        {Array.from({ length: defLen }, (_, i) => {
          const step = padded[i]!;
          return (
            <div
              key={`${rowKey}-${i}`}
              className="grid grid-cols-1 gap-2 rounded-lg border border-border/60 p-3 sm:grid-cols-12"
            >
              <label className="sm:col-span-4 block text-xs text-foreground/60">
                Label
                <input
                  value={step.label}
                  onChange={(e) => {
                    const next = padded.map((s, j) => (j === i ? { ...s, label: e.target.value } : s));
                    setTrack(tIdx, { [rowKey]: next } as never);
                  }}
                  className="mt-1 w-full h-9 rounded-md border border-border bg-background px-2 text-sm"
                />
              </label>
              <label className="sm:col-span-5 block text-xs text-foreground/60">
                Detail
                <input
                  value={step.detail}
                  onChange={(e) => {
                    const next = padded.map((s, j) => (j === i ? { ...s, detail: e.target.value } : s));
                    setTrack(tIdx, { [rowKey]: next } as never);
                  }}
                  className="mt-1 w-full h-9 rounded-md border border-border bg-background px-2 text-sm"
                />
              </label>
              <div className="sm:col-span-3 block text-xs text-foreground/60">
                <span className="block">Icon</span>
                <div className="mt-1">
                  {iconSelect(step.icon, (v) => {
                    const next = padded.map((s, j) => (j === i ? { ...s, icon: v } : s));
                    setTrack(tIdx, { [rowKey]: next } as never);
                  }, `flow-${tIdx}-${rowKey}-${i}`)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const mapStack = (cards: ExploreStackCard[]) => (
    <div className="space-y-3">
      {cards.map((c, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground/70">Stack item {i + 1}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              value={c.name}
              onChange={(e) => {
                const n = cards.map((x, j) => (j === i ? { ...x, name: e.target.value } : x));
                setTrack(tIdx, { stackCards: n });
              }}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              placeholder="Name"
            />
            <input
              value={c.value}
              onChange={(e) => {
                const n = cards.map((x, j) => (j === i ? { ...x, value: e.target.value } : x));
                setTrack(tIdx, { stackCards: n });
              }}
              className="h-9 rounded-md border border-border bg-background px-2 text-sm"
              placeholder="Value"
            />
          </div>
          <input
            value={c.note}
            onChange={(e) => {
              const n = cards.map((x, j) => (j === i ? { ...x, note: e.target.value } : x));
              setTrack(tIdx, { stackCards: n });
            }}
            className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm"
            placeholder="Note"
          />
          <div>
            {iconSelect(c.icon, (v) => {
              const n = cards.map((x, j) => (j === i ? { ...x, icon: v } : x));
              setTrack(tIdx, { stackCards: n });
            }, `stack-${tIdx}-${i}`)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl space-y-10">
      <p className="text-sm text-foreground/60">
        Content for the <strong>Explore Architecture</strong> modal (systems section CTA). Each tab matches one
        &quot;stack&quot; (web, video, brand) on the public site.
      </p>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Header & badges</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(
            [
              ["eyebrow", "Eyebrow"],
              ["title", "Title"],
            ] as const
          ).map(([k, lab]) => (
            <label key={k} className="block text-sm text-foreground/70">
              {lab}
              <input
                value={ex[k]}
                onChange={(e) => patch({ [k]: e.target.value } as never)}
                className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>
        <label className="block text-sm text-foreground/70">
          Description
          <textarea
            rows={3}
            value={ex.description}
            onChange={(e) => patch({ description: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-primary resize-y min-h-[5rem]"
          />
        </label>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {(
            [
              ["dataFlowSectionTitle", "Data flow section title"],
              ["stackSectionTitle", "Stack section title"],
              ["beforeAfterSectionTitle", "Before/after section title"],
              ["beforeLabel", "Before column label"],
              ["afterLabel", "After column label"],
            ] as const
          ).map(([k, lab]) => (
            <label key={k} className="block text-sm text-foreground/70">
              {lab}
              <input
                value={ex[k] as string}
                onChange={(e) => patch({ [k]: e.target.value } as never)}
                className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label className="block text-sm text-foreground/70">
            Footer line
            <input
              value={ex.closingLine}
              onChange={(e) => patch({ closingLine: e.target.value })}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
            />
          </label>
          <label className="block text-sm text-foreground/70">
            CTA label
            <input
              value={ex.ctaLabel}
              onChange={(e) => patch({ ctaLabel: e.target.value })}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Service strip (4 pills)</h2>
        {ex.serviceStrip.map((s, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="min-w-0 flex-1 text-sm text-foreground/70">
              Label {i + 1}
              <input
                value={s.label}
                onChange={(e) => {
                  const n = ex.serviceStrip.map((x, j) => (j === i ? { ...x, label: e.target.value } : x));
                  patch({ serviceStrip: n });
                }}
                className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3 outline-none focus:border-primary"
              />
            </label>
            <div className="w-full sm:w-48">
              <span className="text-xs text-foreground/60">Icon</span>
              {iconSelect(s.icon, (v) => {
                const n = ex.serviceStrip.map((x, j) => (j === i ? { ...x, icon: v } : x));
                patch({ serviceStrip: n });
              }, `strip-${i}`)}
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Before vs after (3 lines each)</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-red-500/80">Before</p>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                value={ex.beforeAfter.before[i] ?? ""}
                onChange={(e) => {
                  const b = [...ex.beforeAfter.before];
                  b[i] = e.target.value;
                  patch({ beforeAfter: { ...ex.beforeAfter, before: b } });
                }}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm"
              />
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-emerald-600/90">After</p>
            {[0, 1, 2].map((i) => (
              <input
                key={i}
                value={ex.beforeAfter.after[i] ?? ""}
                onChange={(e) => {
                  const a = [...ex.beforeAfter.after];
                  a[i] = e.target.value;
                  patch({ beforeAfter: { ...ex.beforeAfter, after: a } });
                }}
                className="w-full h-9 rounded-md border border-border bg-background px-2 text-sm"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-border/60 pt-8">
        <h2 className="text-lg font-bold">Per stack (data flow, terminal, tools)</h2>
        <div className="flex flex-wrap gap-1 rounded-2xl border border-border/50 bg-foreground/[0.02] p-1">
          {ex.tracks.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTIdx(i)}
              className={
                tIdx === i
                  ? "flex-1 min-h-[2.5rem] rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
                  : "flex-1 min-h-[2.5rem] rounded-xl px-3 py-2 text-sm text-foreground/70 hover:bg-foreground/5"
              }
            >
              {t.tabLabel} ({t.id})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="block text-sm text-foreground/70">
            Tab label
            <input
              value={track.tabLabel}
              onChange={(e) => setTrack(tIdx, { tabLabel: e.target.value })}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3"
            />
          </label>
          <label className="block text-sm text-foreground/70">
            Stack summary (next to &quot;Stack we ship on&quot;)
            <input
              value={track.stackTitle}
              onChange={(e) => setTrack(tIdx, { stackTitle: e.target.value })}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-background px-3"
            />
          </label>
        </div>

        <h3 className="text-sm font-semibold">Data flow — row 1 (3 steps)</h3>
        {mapFlow(track.flowRow1, "flowRow1", 3)}
        <h3 className="text-sm font-semibold">Data flow — row 2 (2 steps)</h3>
        {mapFlow(track.flowRow2, "flowRow2", 2)}
        <label className="block text-sm text-foreground/70">
          Data flow footer
          <textarea
            rows={2}
            value={track.flowFooter}
            onChange={(e) => setTrack(tIdx, { flowFooter: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
          />
        </label>

        <label className="block text-sm text-foreground/70">
          TypeScript terminal (one line per row)
          <textarea
            rows={12}
            value={track.terminalLines.join("\n")}
            onChange={(e) =>
              setTrack(tIdx, {
                terminalLines: e.target.value.split("\n").map((l) => l.slice(0, 200)),
              })
            }
            className="mt-1 w-full max-h-80 font-mono text-xs rounded-xl border border-border bg-background px-3 py-2"
            spellCheck={false}
          />
        </label>

        <h3 className="text-sm font-semibold">Stack cards (4)</h3>
        {mapStack(track.stackCards)}
      </section>
    </div>
  );
}
