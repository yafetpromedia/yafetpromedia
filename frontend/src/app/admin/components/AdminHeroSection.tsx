"use client";

/* eslint-disable @next/next/no-img-element -- admin previews: arbitrary image URLs from content */

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Home, Images, Plus, Sparkles, Trash2 } from "lucide-react";
import {
  defaultSiteContent,
  HeroCarouselSlide,
  SiteContent,
} from "@/lib/site-content.shared";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
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

const compactInputCls = cn(
  "mt-1.5 w-full rounded-xl border border-border/85 bg-background/85 px-3 py-2 text-sm outline-none transition",
  "focus:border-accent/45 focus:ring-2 focus:ring-accent/15 "
);

const reorderBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-card text-foreground/80 transition",
  "hover:border-accent/35 hover:bg-accent/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const ghostBtn = cn(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/75 px-4 py-2.5 text-sm font-semibold text-foreground/85 transition",
  "hover:border-accent/35 hover:bg-accent/[0.07] disabled:pointer-events-none disabled:opacity-35"
);

const sectionShell =
  "rounded-3xl border border-border/60 bg-card p-6 shadow-sm backdrop-blur-sm  sm:p-8";

function defaultSlideSrc(slides: HeroCarouselSlide[]): string {
  return (
    slides[0]?.src ??
    defaultSiteContent.heroCarouselSlides[0]?.src ??
    "/uploads/hero/hero3-1782318880327-jx6ebq.png"
  );
}

function patchHeroSlide(
  setDraft: Dispatch<SetStateAction<SiteContent>>,
  index: number,
  patch: Partial<HeroCarouselSlide>
) {
  setDraft((prev) => ({
    ...prev,
    heroCarouselSlides: prev.heroCarouselSlides.map((s, i) =>
      i === index ? { ...s, ...patch } : s
    ),
  }));
}

function moveHeroSlide(
  setDraft: Dispatch<SetStateAction<SiteContent>>,
  index: number,
  dir: "up" | "down"
) {
  setDraft((prev) => {
    const next = dir === "up" ? index - 1 : index + 1;
    if (next < 0 || next >= prev.heroCarouselSlides.length) return prev;
    const slides = [...prev.heroCarouselSlides];
    [slides[index], slides[next]] = [slides[next], slides[index]];
    return { ...prev, heroCarouselSlides: slides };
  });
}

export default function AdminHeroSection({ draft, setDraft }: Props) {
  const slideCount = draft.heroCarouselSlides.length;
  const [slideFilter, setSlideFilter] = useState("");
  const filteredSlides = useMemo(() => {
    const indexed = draft.heroCarouselSlides.map((slide, index) => ({ slide, index }));
    if (!slideFilter.trim()) return indexed;
    return indexed.filter(({ slide }) =>
      matchesAdminFilter(slideFilter, slide.id, slide.src, slide.alt)
    );
  }, [draft.heroCarouselSlides, slideFilter]);

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-muted/35 to-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-orange-400/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-amber-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <Home className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-accent">
                Homepage · Above the fold
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">Hero</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Headline assembly, badge, and rotating carousel images visitors see first when they land on your site.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 bg-background">
            <Images className="size-3.5 text-primary/90" />
            {slideCount} / 8 slides
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-500/18 bg-orange-500/[0.05] px-4 py-3.5 text-sm leading-relaxed text-foreground/72 ring-1 ring-orange-500/12 ">
        <span className="mr-1 inline-flex items-center gap-1.5 align-middle">
          <Sparkles className="size-3.5 text-orange-600 " />
        </span>
        Copy saves with <strong className="font-medium text-foreground/85">Save changes</strong>. Carousel images accept paths,
        uploads, or HTTPS URLs—optimize assets for fast first paint.
      </div>

      {/* Site logo */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <Images className="size-4 text-primary/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">
            Site logo (navbar, footer, login & favicon)
          </h4>
        </div>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-foreground/55">
          Main mark next to the brand name. This same image also powers the browser tab favicon
          after save. Use a path like{" "}
          <code className="rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-[12px] text-foreground/80">
            /uploads/hero/your-logo.jpg
          </code>
          , an uploaded URL under{" "}
          <code className="rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-[12px] text-foreground/80">
            /uploads/...
          </code>
          , or an HTTPS image URL.
        </p>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex aspect-square w-full max-w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/20 lg:w-40">
            <img src={draft.siteLogoSrc} alt="" className="max-h-full max-w-full object-contain p-3" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <label className="block">
              <span className={labelCls}>Logo URL or path</span>
              <input
                value={draft.siteLogoSrc}
                onChange={(e) => setDraft((prev) => ({ ...prev, siteLogoSrc: e.target.value }))}
                className={compactInputCls}
                placeholder={defaultSiteContent.siteLogoSrc}
              />
            </label>
            <div>
              <span className={labelCls}>Upload file</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                className={cn(
                  "mt-1.5 text-xs text-foreground/70 file:mr-3 file:rounded-xl file:border file:border-border/80 file:bg-background file:px-3 file:py-1.5 file:text-xs file:font-medium"
                )}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const form = new FormData();
                  form.append("file", file);
                  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                  if (!res.ok) return;
                  const data = (await res.json()) as { url?: string };
                  const url = typeof data.url === "string" ? data.url.trim() : "";
                  if (url) {
                    setDraft((prev) => ({ ...prev, siteLogoSrc: url }));
                  }
                  event.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Copy */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <Sparkles className="size-4 text-primary/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Headline & badge</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {(
            [
              ["heroHeadline", "Hero headline"],
              ["heroHighlight", "Hero highlight"],
              ["heroTail", "Hero tail"],
              ["heroBadge", "Hero badge"],
            ] as const
          ).map(([key, lbl]) => (
            <label key={key} className="block">
              <span className={labelCls}>{lbl}</span>
              <input
                value={draft[key]}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </label>
          ))}
        </div>
      </section>

      {/* Carousel */}
      <section className={sectionShell}>
        <div className="mb-6 flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Images className="size-4 text-primary/90" />
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Image carousel</h4>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/55">
              Up to 8 slides. Use paths like{" "}
              <code className="rounded-md bg-muted/50 px-1.5 py-0.5 font-mono text-[12px] text-foreground/80">
                /uploads/hero/hero3-….png
              </code>
              , upload a file, or paste an HTTPS image URL.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setDraft((prev) => {
                const next: HeroCarouselSlide = {
                  id: `slide-${Date.now()}`,
                  src: defaultSlideSrc(prev.heroCarouselSlides),
                  alt: "Carousel slide",
                };
                if (prev.heroCarouselSlides.length >= 8) return prev;
                return { ...prev, heroCarouselSlides: [...prev.heroCarouselSlides, next] };
              })
            }
            disabled={slideCount >= 8}
            className={cn(ghostBtn, "whitespace-nowrap")}
          >
            <Plus className="size-4" />
            Add slide
          </button>
        </div>

        <AdminListFilter
          id="admin-hero-slide-filter"
          value={slideFilter}
          onChange={setSlideFilter}
          placeholder="Filter slides by URL, alt, or id…"
          resultHint={
            slideFilter.trim()
              ? `${filteredSlides.length} of ${draft.heroCarouselSlides.length} shown`
              : undefined
          }
          className="mb-4"
        />

        <div className="space-y-4">
          {filteredSlides.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center text-sm text-foreground/55 dark:bg-muted/20">
              No slides match this filter.
            </p>
          ) : null}
          {filteredSlides.map(({ slide, index }) => (
            <div
              key={slide.id}
              className="rounded-2xl border border-border/65 bg-background/65 p-5 shadow-sm transition hover:border-primary/20  sm:p-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
                  Slide {index + 1}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => moveHeroSlide(setDraft, index, "up")}
                    disabled={index === 0}
                    className={reorderBtn}
                    aria-label="Move slide up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveHeroSlide(setDraft, index, "down")}
                    disabled={index === draft.heroCarouselSlides.length - 1}
                    className={reorderBtn}
                    aria-label="Move slide down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((prev) => {
                        if (prev.heroCarouselSlides.length <= 1) return prev;
                        return {
                          ...prev,
                          heroCarouselSlides: prev.heroCarouselSlides.filter((_, i) => i !== index),
                        };
                      })
                    }
                    disabled={draft.heroCarouselSlides.length <= 1}
                    className={cn(
                      "inline-flex size-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-500/[0.06] text-red-600 transition",
                      "hover:bg-red-500/12 disabled:pointer-events-none disabled:opacity-35 dark:text-red-400"
                    )}
                    aria-label="Remove slide"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="flex aspect-square w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-muted/20 sm:w-40">
                  <img src={slide.src} alt="" className="max-h-full max-w-full object-contain p-2" />
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <label className="block">
                    <span className={labelCls}>Image URL or path</span>
                    <input
                      value={slide.src}
                      onChange={(e) => patchHeroSlide(setDraft, index, { src: e.target.value })}
                      className={compactInputCls}
                      placeholder="/uploads/hero/hero3-….png"
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Alt text (accessibility)</span>
                    <input
                      value={slide.alt}
                      onChange={(e) => patchHeroSlide(setDraft, index, { alt: e.target.value })}
                      className={compactInputCls}
                    />
                  </label>
                  <div>
                    <span className={labelCls}>Upload file</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className={cn(
                        "mt-1.5 text-xs text-foreground/70 file:mr-3 file:rounded-xl file:border file:border-border/80 file:bg-background file:px-3 file:py-1.5 file:text-xs file:font-medium"
                      )}
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append("file", file);
                        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                        if (!res.ok) return;
                        const data = (await res.json()) as { url?: string };
                        if (data.url) {
                          patchHeroSlide(setDraft, index, { src: data.url });
                        }
                        event.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
