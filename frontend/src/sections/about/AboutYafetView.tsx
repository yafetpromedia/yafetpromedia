"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  GraduationCap,
  Layers,
  Rocket,
  Sparkles,
  Target,
  Telescope,
} from "lucide-react";
import type { AboutYafetContent, EcosystemProductCard } from "@/lib/site-content.shared";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { cn } from "@/lib/utils";

type Props = {
  about: AboutYafetContent;
  siteLogoSrc: string;
  ecosystemCards: EcosystemProductCard[];
};

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function splitParagraphs(text: string): string[] {
  return text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}

export default function AboutYafetView({ about, siteLogoSrc, ecosystemCards }: Props) {
  const reduceMotion = useReducedMotion();
  const introParagraphs = splitParagraphs(about.introBody);
  const journeyParagraphs = splitParagraphs(about.journey);
  const ecosystemIntro = splitParagraphs(about.projectsHighlight);
  const closingParagraphs = splitParagraphs(about.closingBody);
  const portraitSrc = about.heroImageSrc.trim() || siteLogoSrc;
  const hasCustomPortrait = Boolean(about.heroImageSrc.trim());
  const ecosystemProducts =
    about.ecosystemProducts.length > 0
      ? about.ecosystemProducts
      : ecosystemCards.map((card) => ({
          title: card.title,
          tagline: card.tagline,
          description: card.description,
        }));

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-8%,rgba(255,106,0,0.12),transparent_55%),radial-gradient(ellipse_60%_45%_at_90%_60%,rgba(147,197,253,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-8%,rgba(255,106,0,0.18),transparent_55%),radial-gradient(ellipse_60%_45%_at_90%_60%,rgba(56,189,248,0.08),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(255,106,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,106,0,0.05)_1px,transparent_1px)] [background-size:48px_48px] dark:opacity-[0.2]"
      />

      <section className="relative border-b border-border/60 pt-28 pb-16 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-7">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm text-foreground/60 backdrop-blur-md transition hover:border-primary/40 hover:text-primary"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>

          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
            <motion.div {...(reduceMotion ? {} : fade(0))}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Founder story
                </span>
              </div>
              <h1 className="font-display text-[2.35rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                {about.pageTitle}
              </h1>
              <p className="mt-4 text-lg font-semibold text-foreground/88 md:text-xl">{about.pageSubtitle}</p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/62 md:text-lg">
                {about.heroTagline}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  { icon: GraduationCap, label: "Student" },
                  { icon: Rocket, label: "Founder" },
                  { icon: Building2, label: "Builder" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-2xl border border-border/80 bg-card/60 px-4 py-2.5 text-sm font-medium text-foreground/75 backdrop-blur-sm"
                  >
                    <Icon className="size-4 text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...(reduceMotion ? {} : fade(0.08))}
              className="relative mx-auto flex w-full max-w-[300px] flex-col items-center lg:max-w-[340px]"
            >
              <div className="relative w-full">
                <div
                  aria-hidden
                  className={cn(
                    "absolute -inset-6 rounded-[2.5rem] bg-primary/20 blur-3xl",
                    !reduceMotion && "animate-pulse"
                  )}
                />
                <div className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/[0.12] via-card to-card p-8 shadow-[0_32px_80px_-32px_rgba(255,106,0,0.45)] ring-1 ring-primary/15">
                  <div
                    className={cn(
                      "relative mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl bg-muted/20",
                      hasCustomPortrait ? "aspect-[4/5]" : "aspect-square max-w-[200px]"
                    )}
                  >
                    <Image
                      src={portraitSrc}
                      alt={about.pageTitle}
                      fill
                      className={cn(
                        hasCustomPortrait
                          ? "object-cover"
                          : "object-contain p-3 drop-shadow-[0_12px_40px_rgba(255,106,0,0.25)]"
                      )}
                      unoptimized={shouldUseUnoptimizedImage(portraitSrc)}
                      sizes="220px"
                      priority
                    />
                  </div>
                  <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-primary/90">
                    {about.pageTitle}
                  </p>
                  <p className="mt-1 text-center text-sm text-foreground/55">Founder & Owner · Awud Digitals</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-7">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{about.introTitle}</h2>
          </motion.div>
          <div className="mt-8 space-y-6">
            {introParagraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                {...(reduceMotion ? {} : fade(0.04 + i * 0.04))}
                className="text-base leading-relaxed text-foreground/72 md:text-lg"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20 py-16 md:py-20 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-3xl px-5 sm:px-7">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Journey</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">{about.journeyTitle}</h2>
          </motion.div>

          {about.journeyQuote.trim() ? (
            <motion.blockquote
              {...(reduceMotion ? {} : fade(0.06))}
              className="mt-8 rounded-2xl border border-primary/20 bg-primary/[0.06] px-6 py-5 text-lg font-medium leading-relaxed text-foreground/88 md:text-xl"
            >
              &ldquo;{about.journeyQuote}&rdquo;
            </motion.blockquote>
          ) : null}

          <ol className="relative mt-10 space-y-0">
            <div aria-hidden className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/60 via-border to-transparent md:left-[15px]" />
            {journeyParagraphs.map((paragraph, i) => (
              <motion.li
                key={i}
                {...(reduceMotion ? {} : fade(0.08 + i * 0.05))}
                className="relative flex gap-6 pb-10 last:pb-0"
              >
                <span className="relative z-10 mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 bg-background shadow-[0_0_0_4px_rgba(255,106,0,0.12)] md:size-8">
                  <span className="size-2 rounded-full bg-primary md:size-2.5" />
                </span>
                <p className="pt-0.5 text-base leading-relaxed text-foreground/72 md:text-lg">{paragraph}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-7 md:grid-cols-2">
          {[
            { icon: Target, title: "Mission", body: about.mission, accent: "from-primary/15" },
            { icon: Telescope, title: "Vision", body: about.vision, accent: "from-sky-500/12" },
          ].map(({ icon: Icon, title, body, accent }, i) => (
            <motion.article
              key={title}
              {...(reduceMotion ? {} : fade(0.08 + i * 0.06))}
              className={cn(
                "group relative overflow-hidden rounded-[1.75rem] border border-border/80 bg-card/70 p-8 backdrop-blur-sm",
                "transition duration-500 hover:border-primary/30 hover:shadow-[0_24px_60px_-28px_rgba(255,106,0,0.35)]"
              )}
            >
              <div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-gradient-to-br to-transparent opacity-80",
                  accent
                )}
              />
              <div className="relative flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary ring-1 ring-primary/20">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-display text-2xl font-bold">{title}</h2>
              </div>
              <p className="relative mt-5 leading-relaxed text-foreground/68">{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/15 py-16 md:py-20 dark:bg-white/[0.02]">
        <div className="mx-auto max-w-6xl px-5 sm:px-7">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">Milestones</p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">Achievements</h2>
          </motion.div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {about.achievements.map((item, i) => (
              <motion.div
                key={i}
                {...(reduceMotion ? {} : fade(0.05 + i * 0.04))}
                className="flex gap-4 rounded-2xl border border-border/75 bg-card/50 p-5 backdrop-blur-sm transition hover:border-primary/25"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 font-mono text-sm font-bold text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-[15px] leading-relaxed text-foreground/75">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-7">
          <motion.div
            {...(reduceMotion ? {} : fade(0))}
            className="overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-to-br from-primary/[0.1] via-card/90 to-card p-8 md:p-12"
          >
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">The ecosystem</p>
              <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Everything begins with Awud Digitals</h2>
              <div className="mt-4 space-y-4">
                {ecosystemIntro.map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-foreground/68">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {ecosystemProducts.map((product, i) => (
                <motion.article
                  key={product.title}
                  {...(reduceMotion ? {} : fade(0.06 + i * 0.05))}
                  className="rounded-2xl border border-border/75 bg-background/70 p-6 backdrop-blur-sm"
                >
                  <div className="mb-3 flex items-center gap-2 text-primary">
                    <Layers className="size-4" />
                    <h3 className="font-display text-xl font-bold text-foreground">{product.title}</h3>
                  </div>
                  <p className="text-sm font-medium text-primary/90">{product.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/65">{product.description}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/#ecosystem"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_12px_32px_-8px_rgba(255,106,0,0.55)] transition hover:bg-primary/92"
              >
                View our products
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition hover:border-primary/40"
              >
                Work with us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/60 pb-24 pt-16 md:pb-28">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-7">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{about.closingTitle}</h2>
            <div className="mt-6 space-y-5 text-left md:text-center">
              {closingParagraphs.map((paragraph, i) => (
                <p key={i} className="text-base leading-relaxed text-foreground/68 md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            {about.closingTagline.trim() ? (
              <p className="mt-8 font-display text-lg font-semibold text-primary md:text-xl">{about.closingTagline}</p>
            ) : null}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
