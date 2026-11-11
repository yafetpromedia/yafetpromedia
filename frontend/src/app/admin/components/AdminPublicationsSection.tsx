"use client";

/* eslint-disable @next/next/no-img-element -- admin previews: arbitrary upload URLs */

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  ImageIcon,
  ImageOff,
  LayoutGrid,
  Library,
  Newspaper,
  Plus,
  Trash2,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { PublicationCard, SiteContent } from "@/lib/site-content.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48";

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-accent/45 focus:ring-2 focus:ring-accent/15",
  ""
);

const textareaCls = cn(inputCls, "min-h-[96px] resize-y py-3 leading-relaxed");

const reorderBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-card text-foreground/80 transition",
  "hover:border-accent/35 hover:bg-accent/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const ghostBtn =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/75 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:border-accent/35 hover:bg-accent/[0.07] disabled:pointer-events-none disabled:opacity-35";

const PUBLICATION_MIN = 1;
const PUBLICATION_MAX = 16;

function emptyPublicationCard(): PublicationCard {
  return {
    title: "",
    category: "",
    slug: "",
    dateLabel: "",
    readTime: "",
    imageSrc: "",
    articleBody: "",
    href: "",
  };
}

export default function AdminPublicationsSection({ draft, setDraft }: Props) {
  const [cardFilter, setCardFilter] = useState("");
  const filteredPubs = useMemo(() => {
    const indexed = draft.publicationsCards.map((card, index) => ({ card, index }));
    if (!cardFilter.trim()) return indexed;
    return indexed.filter(({ card }) =>
      matchesAdminFilter(
        cardFilter,
        card.title,
        card.category,
        card.dateLabel,
        card.readTime,
        card.imageSrc,
        card.articleBody,
        card.href
      )
    );
  }, [draft.publicationsCards, cardFilter]);

  const moveCard = (index: number, dir: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.publicationsCards];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, publicationsCards: next };
    });
  };

  const patchCard = (index: number, patch: Partial<PublicationCard>) =>
    setDraft((prev) => ({
      ...prev,
      publicationsCards: prev.publicationsCards.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-muted/35 to-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-violet-500/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-amber-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/28 dark:text-violet-400">
              <Library className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-700/95 dark:text-violet-400/95">
                Homepage · Publications
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Authority & insights
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Thought-leadership tiles with optional covers, read modal body, and optional source link. Order matters:
                the site shows the first three; add a fourth to unlock the catalog CTA (max {PUBLICATION_MAX} items).
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 bg-background">
            <Newspaper className="size-3.5 text-violet-600/85 dark:text-violet-400/90" />
            {draft.publicationsCards.length} pieces
          </div>
        </div>
      </div>

      {/* Section header */}
      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm backdrop-blur-sm sm:p-8 ">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <BookOpen className="size-4 text-violet-600/85 dark:text-violet-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Section header</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Eyebrow / tag</span>
            <input
              value={draft.publicationsSectionTag}
              onChange={(e) => setDraft((prev) => ({ ...prev, publicationsSectionTag: e.target.value }))}
              className={inputCls}
              placeholder="e.g. AUTHORITY & INSIGHTS"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Main title</span>
            <input
              value={draft.publicationsSectionTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, publicationsSectionTitle: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>
        <label className="mt-6 block">
          <span className={labelCls}>Intro</span>
          <textarea
            rows={3}
            value={draft.publicationsSectionDescription}
            onChange={(e) => setDraft((prev) => ({ ...prev, publicationsSectionDescription: e.target.value }))}
            className={textareaCls}
            placeholder="Supporting copy under the headline."
          />
        </label>
        <label className="mt-6 block max-w-xl">
          <span className={labelCls}>View all CTA</span>
          <p className="mb-2 text-xs text-foreground/48">
            Uppercase label shown only when there are more than three publications (opens full list modal).
          </p>
          <input
            value={draft.publicationsCatalogCtaLabel}
            onChange={(e) => setDraft((prev) => ({ ...prev, publicationsCatalogCtaLabel: e.target.value }))}
            placeholder="VIEW ALL PUBLICATIONS"
            className={inputCls}
          />
        </label>
        <p className="mt-4 rounded-xl border border-violet-500/15 bg-violet-500/[0.04] px-4 py-3 text-xs leading-relaxed text-foreground/62 ">
          The homepage lists the first three entries in this order. Adding a fourth reveals the catalog button using the
          label above.
        </p>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Publication tiles
            </p>
            <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Pieces</h4>
            <p className="mt-1 max-w-lg text-sm text-foreground/52">
              Cover, meta lines, long-form reader body, and optional external URL in the popup footer.
            </p>
          </div>
          <button
            type="button"
            disabled={draft.publicationsCards.length >= PUBLICATION_MAX}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                publicationsCards: [...prev.publicationsCards, emptyPublicationCard()],
              }))
            }
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add publication
          </button>
        </div>

        <AdminListFilter
          id="admin-publications-filter"
          value={cardFilter}
          onChange={setCardFilter}
          placeholder="Filter publications…"
          resultHint={
            cardFilter.trim()
              ? `${filteredPubs.length} of ${draft.publicationsCards.length} shown`
              : undefined
          }
          className="mb-2"
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredPubs.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-muted/20">
              No publications match this filter.
            </p>
          ) : null}
          {filteredPubs.map(({ card, index }) => (
            <div
              key={`pub-${index}`}
              className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card to-muted/30 p-5 shadow-sm ring-1 ring-black/[0.04] transition hover:border-violet-500/18   sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/45 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/12 font-mono text-sm font-bold tabular-nums text-violet-800 ring-1 ring-violet-500/22 dark:text-violet-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {card.title.trim() || `Publication ${index + 1}`}
                    </p>
                    <p className="truncate font-mono text-[11px] text-foreground/42">
                      {(card.category ?? "").trim() || "Category"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={draft.publicationsCards.length <= PUBLICATION_MIN}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        publicationsCards: prev.publicationsCards.filter((_, i) => i !== index),
                      }))
                    }
                    className={cn(
                      ghostBtn,
                      "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    )}
                    aria-label={`Remove publication ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCard(index, -1)}
                    className={reorderBtn}
                    aria-label="Move publication up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.publicationsCards.length - 1}
                    onClick={() => moveCard(index, 1)}
                    className={reorderBtn}
                    aria-label="Move publication down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
                <div className="shrink-0 lg:w-[148px]">
                  <span className={labelCls}>Cover</span>
                  <div className="relative mt-1 aspect-[4/3] w-full max-w-[148px] overflow-hidden rounded-2xl border border-border/70 bg-background/80 ring-1 ring-black/[0.05] ">
                    {card.imageSrc ? (
                      <img src={card.imageSrc} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center">
                        <ImageIcon className="size-8 text-foreground/22" />
                        <span className="text-[11px] font-medium text-foreground/38">Optional</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="mt-3 w-full min-w-0 text-[11px] text-foreground/65 file:mr-2 file:rounded-lg file:border file:border-border file:bg-background file:px-2 file:py-1.5 file:text-xs file:font-medium"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append("file", file);
                      form.append("folder", "publications");
                      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                      if (!res.ok) return;
                      const data = (await res.json()) as { url?: string };
                      if (data.url) {
                        patchCard(index, { imageSrc: data.url });
                      }
                      event.target.value = "";
                    }}
                  />
                  <input
                    value={card.imageSrc ?? ""}
                    onChange={(e) => patchCard(index, { imageSrc: e.target.value })}
                    placeholder="/uploads/publications/… or URL"
                    className={cn(inputCls, "mt-2 text-sm")}
                  />
                  {(card.imageSrc ?? "").trim() !== "" && (
                    <button
                      type="button"
                      onClick={() => patchCard(index, { imageSrc: "" })}
                      className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border/80 text-xs font-semibold text-foreground/75 transition hover:border-red-500/45 hover:bg-red-500/[0.08] hover:text-red-600 dark:hover:text-red-400"
                    >
                      <ImageOff className="size-3.5" />
                      Clear cover
                    </button>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <label className="block">
                    <span className={labelCls}>Title</span>
                    <input
                      value={card.title}
                      onChange={(e) => patchCard(index, { title: e.target.value })}
                      placeholder="Headline"
                      className={inputCls}
                    />
                  </label>

                  <label className="block">
                    <span className={labelCls}>Shareable URL slug (optional)</span>
                    <input
                      value={card.slug ?? ""}
                      onChange={(e) => patchCard(index, { slug: e.target.value })}
                      placeholder="auto-from-title"
                      className={inputCls}
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelCls}>Category badge</span>
                      <input
                        value={card.category}
                        onChange={(e) => patchCard(index, { category: e.target.value })}
                        placeholder="e.g. STRATEGY"
                        className={inputCls}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Read time</span>
                      <input
                        value={card.readTime ?? ""}
                        onChange={(e) => patchCard(index, { readTime: e.target.value })}
                        placeholder="e.g. 5 min read"
                        className={inputCls}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className={labelCls}>Date line</span>
                    <input
                      value={card.dateLabel ?? ""}
                      onChange={(e) => patchCard(index, { dateLabel: e.target.value })}
                      placeholder="e.g. April 15, 2026"
                      className={inputCls}
                    />
                  </label>

                  <div>
                    <span className={labelCls}>Full article (reader modal)</span>
                    <p className="mb-2 text-xs leading-relaxed text-foreground/48">
                      Blank line between paragraphs.
                    </p>
                    <textarea
                      rows={10}
                      value={card.articleBody ?? ""}
                      onChange={(e) => patchCard(index, { articleBody: e.target.value })}
                      placeholder="What readers see when they open this piece…"
                      spellCheck={false}
                      className={cn(
                        "w-full min-h-[11rem] resize-y rounded-2xl border border-violet-500/15 bg-muted/50 px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground/90 outline-none ring-1 ring-border/50",
                        "placeholder:text-violet-950/45 focus:border-violet-500/35 focus:ring-2 focus:ring-violet-500/12",
                        ""
                      )}
                    />
                  </div>

                  <label className="block">
                    <span className={labelCls}>Original URL (optional)</span>
                    <p className="mb-2 text-xs text-foreground/48">Shown as a button in the popup footer when set.</p>
                    <input
                      value={card.href ?? ""}
                      onChange={(e) => patchCard(index, { href: e.target.value })}
                      placeholder="https://…"
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-xs text-foreground/58 ">
          <LayoutGrid className="mt-0.5 size-4 shrink-0 text-violet-600/80 dark:text-violet-400/85" />
          <p>
            Tip: Put your strongest stories in slots{" "}
            <span className="font-semibold text-foreground/75">01–03</span> — they appear on the homepage grid without
            opening the catalog.
          </p>
        </div>
      </section>
    </div>
  );
}
