"use client";

/* eslint-disable @next/next/no-img-element -- admin previews: arbitrary upload URLs */

import Link from "next/link";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  Handshake,
  ImageIcon,
  ImageOff,
  LayoutGrid,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { SiteContent, TrustLogoItem } from "@/lib/site-content.shared";
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

const ghostBtn =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/75 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:border-accent/35 hover:bg-accent/[0.07] disabled:pointer-events-none disabled:opacity-35";

const compactLabel =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/45";

const compactInput = cn(
  "w-full rounded-xl border border-border/85 bg-background/85 px-2.5 py-1.5 text-[13px] leading-snug text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-primary/55 focus:ring-1 focus:ring-primary/15",
  ""
);

const tileReorderBtn = cn(
  "inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/75 bg-card text-foreground/80 transition",
  "hover:border-accent/35 hover:bg-accent/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const LOGO_MAX = 12;

function emptyTrustLogoItem(): TrustLogoItem {
  return { name: "", imageSrc: "" };
}

export default function AdminTrustSection({ draft, setDraft }: Props) {
  const [logoFilter, setLogoFilter] = useState("");
  const filteredLogos = useMemo(() => {
    const indexed = draft.trustLogoItems.map((logo, index) => ({ logo, index }));
    if (!logoFilter.trim()) return indexed;
    return indexed.filter(({ logo }) =>
      matchesAdminFilter(logoFilter, logo.name, logo.imageSrc)
    );
  }, [draft.trustLogoItems, logoFilter]);

  const patchLogo = (index: number, patch: Partial<TrustLogoItem>) =>
    setDraft((prev) => ({
      ...prev,
      trustLogoItems: prev.trustLogoItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));

  const moveLogo = (index: number, dir: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.trustLogoItems];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, trustLogoItems: next };
    });
  };

  return (
    <div className="max-w-6xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-muted/35 to-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-slate-400/[0.1] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-cyan-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-800 ring-1 ring-cyan-500/28 dark:text-cyan-400">
              <Handshake className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-800/95 dark:text-cyan-400/95">
                Homepage · Trust
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Credibility strip
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Section headline and partner logo marquee. Visitor-submitted quotes are approved under Testimonials—this
                screen is logos and copy only.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 bg-background">
            <Building2 className="size-3.5 text-cyan-600/85 dark:text-cyan-400/90" />
            {draft.trustLogoItems.length} logos
          </div>
        </div>
      </div>

      {/* Testimonials pointer */}
      <div className="rounded-2xl border border-cyan-500/18 bg-cyan-500/[0.05] px-4 py-3.5 text-sm leading-relaxed text-foreground/72 ring-1 ring-cyan-500/12 ">
        <span className="mr-1 inline-flex items-center gap-1.5 align-middle">
          <Sparkles className="size-3.5 text-cyan-600 dark:text-cyan-400" />
        </span>
        Quotes from visitors are reviewed under{" "}
        <Link href="/admin/testimonials" className="font-semibold text-primary underline-offset-4 hover:underline">
          Testimonials
        </Link>
        . Use this page for the Trust section title and the scrolling logo strip.
      </div>

      {/* Section header */}
      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm backdrop-blur-sm sm:p-8 ">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <LayoutGrid className="size-4 text-cyan-600/85 dark:text-cyan-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Section header</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Eyebrow / tag</span>
            <input
              value={draft.trustSectionTag}
              onChange={(e) => setDraft((prev) => ({ ...prev, trustSectionTag: e.target.value }))}
              className={inputCls}
              placeholder="e.g. TRUSTED BY"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Main title</span>
            <input
              value={draft.trustSectionTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, trustSectionTitle: e.target.value }))}
              className={inputCls}
              placeholder="Headline above the marquee"
            />
          </label>
        </div>
      </section>

      {/* Logos — compact grid */}
      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Partner logos
            </p>
            <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Marquee strip</h4>
            <p className="mt-1 max-w-lg text-sm text-foreground/52">
              PNG, SVG, or WebP uploads—or paste a URL. Names power alt text. Tiles are shown in a grid for quicker edits.
            </p>
          </div>
          <button
            type="button"
            disabled={draft.trustLogoItems.length >= LOGO_MAX}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                trustLogoItems: [...prev.trustLogoItems, emptyTrustLogoItem()],
              }))
            }
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add logo
          </button>
        </div>

        <AdminListFilter
          id="admin-trust-logo-filter"
          value={logoFilter}
          onChange={setLogoFilter}
          placeholder="Filter logos by name or image URL…"
          resultHint={
            logoFilter.trim()
              ? `${filteredLogos.length} of ${draft.trustLogoItems.length} shown`
              : undefined
          }
          className="mb-3"
        />

        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            draft.trustLogoItems.length === 0 && "hidden"
          )}
        >
          {filteredLogos.length === 0 && draft.trustLogoItems.length > 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-muted/20">
              No logos match this filter.
            </p>
          ) : null}
          {filteredLogos.map(({ logo, index }) => (
            <div
              key={`trust-logo-${index}`}
              className="flex flex-col rounded-2xl border border-border/70 bg-card p-3 shadow-sm ring-1 ring-black/[0.03] "
            >
              <div className="mb-2 flex items-center justify-between gap-2 border-b border-border/40 pb-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/12 font-mono text-[11px] font-bold tabular-nums text-cyan-900 ring-1 ring-cyan-500/20 dark:text-cyan-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="truncate text-[11px] font-semibold text-foreground/80">
                    {logo.name.trim() || `Partner ${index + 1}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        trustLogoItems: prev.trustLogoItems.filter((_, i) => i !== index),
                      }))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-red-500/25 text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                    aria-label={`Remove logo ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveLogo(index, -1)}
                    className={tileReorderBtn}
                    aria-label="Move logo up"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.trustLogoItems.length - 1}
                    onClick={() => moveLogo(index, 1)}
                    className={tileReorderBtn}
                    aria-label="Move logo down"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="mb-3 flex h-16 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/70 px-2 py-1.5 ">
                {logo.imageSrc.trim() ? (
                  <img src={logo.imageSrc} alt="" className="max-h-12 w-auto max-w-full object-contain" />
                ) : (
                  <ImageIcon className="size-7 text-foreground/20" />
                )}
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-2">
                <label className="block">
                  <span className={compactLabel}>Name</span>
                  <input
                    value={logo.name}
                    onChange={(e) => patchLogo(index, { name: e.target.value })}
                    placeholder="Partner"
                    className={compactInput}
                  />
                </label>
                <label className="block">
                  <span className={compactLabel}>Logo URL</span>
                  <input
                    value={logo.imageSrc}
                    onChange={(e) => patchLogo(index, { imageSrc: e.target.value })}
                    placeholder="/uploads/…"
                    className={compactInput}
                  />
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                  className="text-[10px] text-foreground/65 file:mr-1.5 file:rounded-md file:border file:border-border file:bg-background file:px-1.5 file:py-1 file:text-[10px]"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const form = new FormData();
                    form.append("file", file);
                    form.append("folder", "trust");
                    const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                    if (!res.ok) return;
                    const data = (await res.json()) as { url?: string };
                    if (data.url) patchLogo(index, { imageSrc: data.url });
                    event.target.value = "";
                  }}
                />
                {logo.imageSrc.trim() !== "" && (
                  <button
                    type="button"
                    onClick={() => patchLogo(index, { imageSrc: "" })}
                    className="inline-flex h-7 w-full items-center justify-center gap-1 rounded-lg border border-border/70 text-[10px] font-semibold text-foreground/75 transition hover:border-red-500/35 hover:bg-red-500/[0.06] hover:text-red-600 dark:hover:text-red-400"
                  >
                    <ImageOff className="size-3" />
                    Clear image
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {draft.trustLogoItems.length === 0 && (
          <p className="rounded-xl border border-dashed border-border/80 bg-muted/15 px-4 py-3 text-sm text-foreground/55">
            No logos yet—add one to populate the marquee, or save defaults from your site content seed.
          </p>
        )}
      </section>
    </div>
  );
}
