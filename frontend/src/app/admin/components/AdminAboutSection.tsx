"use client";

import { Dispatch, SetStateAction, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload, User } from "lucide-react";
import Image from "next/image";
import type { AboutYafetContent, SiteContent } from "@/lib/site-content.shared";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
);

const sectionShell =
  "rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm dark:bg-card/35 sm:p-8";

export default function AdminAboutSection({ draft, setDraft }: Props) {
  const about = draft.aboutYafet;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const patch = (patch: Partial<typeof about>) =>
    setDraft((p) => ({ ...p, aboutYafet: { ...p.aboutYafet, ...patch } }));

  const previewSrc = about.heroImageSrc.trim() || draft.siteLogoSrc;
  const usingLogoFallback = !about.heroImageSrc.trim();

  const uploadHero = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "about");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) return;
      const data = (await res.json()) as { url?: string };
      if (data.url) patch({ heroImageSrc: data.url });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onFilePick = (file?: File) => {
    if (file) void uploadHero(file);
  };

  return (
    <div className="max-w-5xl space-y-8 pb-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-orange-500/[0.1] via-card/92 to-violet-500/[0.06] p-6 shadow-[0_28px_80px_-44px_rgba(255,106,0,0.22)] sm:p-8">
        <div className="pointer-events-none absolute -left-24 top-0 size-[220px] rounded-full bg-orange-400/10 blur-[90px]" />
        <div className="relative flex gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <User className="size-6" />
          </span>
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/95">
              Public page · /about/yafet
            </p>
            <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">About Yafet</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
              Edit the founder story visitors see on your About page. Upload a portrait photo below — it appears in the
              hero card on the right.
            </p>
          </div>
        </div>
      </div>

      {/* Hero image — primary upload */}
      <section className={sectionShell}>
        <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/50">Founder portrait</p>
            <p className="mt-1 text-sm text-foreground/55">
              Square or portrait photo works best (min. 600×600px). JPG, PNG, or WebP.
            </p>
          </div>
          {about.heroImageSrc ? (
            <button
              type="button"
              onClick={() => patch({ heroImageSrc: "" })}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/25 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-500/[0.08] dark:text-red-400"
            >
              <Trash2 className="size-3.5" />
              Remove photo
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <label
            className={cn(
              "group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed transition",
              uploading
                ? "border-primary/40 bg-primary/[0.04]"
                : "border-border/80 bg-muted/20 hover:border-primary/45 hover:bg-primary/[0.04]"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFilePick(e.dataTransfer.files?.[0]);
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => onFilePick(e.target.files?.[0])}
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3 text-foreground/55">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Uploading…</p>
              </div>
            ) : (
              <>
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20 transition group-hover:scale-105">
                  <Upload className="size-6" />
                </span>
                <p className="mt-4 text-sm font-semibold text-foreground/80">Drop your photo here</p>
                <p className="mt-1 text-xs text-foreground/45">or click to browse</p>
              </>
            )}
          </label>

          <div className="flex flex-col items-center">
            <p className="mb-3 self-start text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
              Live preview
            </p>
            <div className="relative w-full max-w-[280px]">
              <div aria-hidden className="absolute -inset-4 rounded-[2rem] bg-primary/15 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/[0.1] via-card to-card p-6 shadow-[0_24px_60px_-28px_rgba(255,106,0,0.4)] ring-1 ring-primary/15">
                <div className="relative mx-auto aspect-[4/5] w-full max-w-[180px] overflow-hidden rounded-2xl bg-muted/30">
                  <Image
                    src={previewSrc}
                    alt="Founder preview"
                    fill
                    className={cn(
                      usingLogoFallback ? "object-contain p-4" : "object-cover"
                    )}
                    unoptimized={shouldUseUnoptimizedImage(previewSrc)}
                    sizes="180px"
                  />
                </div>
                <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-primary/90">
                  YafetPromedia
                </p>
                <p className="mt-1 text-center text-xs text-foreground/50">Parent company · Founder-led</p>
              </div>
            </div>
            {usingLogoFallback ? (
              <p className="mt-3 max-w-[260px] text-center text-[11px] leading-relaxed text-foreground/45">
                No portrait yet — showing your site logo. Upload a photo to replace it.
              </p>
            ) : (
              <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <ImagePlus className="size-3.5" />
                Custom portrait active
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Copy fields */}
      <section className={sectionShell}>
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/50">Page copy</p>
        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
              Page title
            </span>
            <input
              className={inputCls}
              placeholder="Yafet — Founder & Builder"
              value={about.pageTitle}
              onChange={(e) => patch({ pageTitle: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
              Role / subtitle
            </span>
            <input
              className={inputCls}
              placeholder="Founder, Builder & Product Designer"
              value={about.pageSubtitle}
              onChange={(e) => patch({ pageSubtitle: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
              Hero tagline
            </span>
            <input
              className={inputCls}
              placeholder="Building digital products…"
              value={about.heroTagline}
              onChange={(e) => patch({ heroTagline: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
              Intro section title
            </span>
            <input
              className={inputCls}
              placeholder="Student. Founder. Builder."
              value={about.introTitle}
              onChange={(e) => patch({ introTitle: e.target.value })}
            />
          </label>

          {(
            [
              ["introBody", "Intro body (blank lines = paragraphs)"],
              ["journeyTitle", "Journey section title"],
              ["journeyQuote", "Journey quote"],
              ["journey", "Building in public (blank lines = timeline items)"],
              ["mission", "Mission"],
              ["vision", "Vision"],
              ["projectsHighlight", "Ecosystem intro (blank lines = paragraphs)"],
              ["closingTitle", "Closing section title"],
              ["closingBody", "Closing body"],
              ["closingTagline", "Closing tagline"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
                {label}
              </span>
              <textarea
                className={cn(inputCls, "min-h-[120px] resize-y")}
                value={about[key]}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            </label>
          ))}

          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
              Ecosystem products (About page)
            </span>
            <div className="space-y-3">
              {about.ecosystemProducts.map((product, i) => (
                <div key={i} className="rounded-2xl border border-border/75 bg-background/40 p-4 space-y-2">
                  <input
                    className={inputCls}
                    placeholder="Product name"
                    value={product.title}
                    onChange={(e) => {
                      const next = [...about.ecosystemProducts];
                      next[i] = { ...next[i]!, title: e.target.value };
                      patch({ ecosystemProducts: next });
                    }}
                  />
                  <input
                    className={inputCls}
                    placeholder="Tagline"
                    value={product.tagline}
                    onChange={(e) => {
                      const next = [...about.ecosystemProducts];
                      next[i] = { ...next[i]!, tagline: e.target.value };
                      patch({ ecosystemProducts: next });
                    }}
                  />
                  <textarea
                    className={cn(inputCls, "min-h-[80px] resize-y")}
                    placeholder="Description"
                    value={product.description}
                    onChange={(e) => {
                      const next = [...about.ecosystemProducts];
                      next[i] = { ...next[i]!, description: e.target.value };
                      patch({ ecosystemProducts: next });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
              Achievements
            </span>
            <div className="space-y-2">
              {about.achievements.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={inputCls}
                    value={item}
                    onChange={(e) => {
                      const next = [...about.achievements];
                      next[i] = e.target.value;
                      patch({ achievements: next });
                    }}
                  />
                  <button
                    type="button"
                    className="shrink-0 rounded-xl border border-red-500/30 px-3 text-red-600 dark:text-red-400"
                    onClick={() => patch({ achievements: about.achievements.filter((_, j) => j !== i) })}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/[0.06]"
                onClick={() => patch({ achievements: [...about.achievements, "New achievement"] })}
              >
                Add achievement
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
