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

const cardShadow =
  "shadow-[0_10px_40px_-18px_rgba(12,12,12,0.18)] dark:shadow-[0_10px_40px_-18px_rgba(0,0,0,0.55)]";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
});

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_80%_8%,rgba(232,93,4,0.06),transparent_55%),linear-gradient(180deg,transparent,transparent)]"
      />

      <section className="relative border-b border-border/60 pt-24 pb-14 sm:pt-28 md:pt-32 md:pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 text-sm text-foreground/60 transition hover:border-accent/30 hover:text-foreground sm:mb-10"
          >
            <ArrowLeft className="size-4" /> Back to home
          </Link>

          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
            <motion.div {...(reduceMotion ? {} : fade(0))}>
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
                Founder story
              </p>
              <h1 className="font-display text-[2.1rem] font-semibold leading-[1.06] tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-[3.15rem]">
                {about.pageTitle}
              </h1>
              <p className="mt-3 text-base font-medium text-foreground/75 sm:text-lg md:text-xl">
                {about.pageSubtitle}
              </p>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/60 md:text-lg">
                {about.heroTagline}
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                {[
                  { icon: GraduationCap, label: "Student" },
                  { icon: Rocket, label: "Founder" },
                  { icon: Building2, label: "Builder" },
                ].map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 text-sm font-medium text-foreground/70",
                      cardShadow
                    )}
                  >
                    <Icon className="size-4 text-accent" />
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...(reduceMotion ? {} : fade(0.06))}
              className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] lg:ml-auto lg:mr-0"
            >
              <div
                className={cn(
                  "overflow-hidden rounded-[1.5rem] border border-border/70 bg-card p-3 sm:p-4",
                  cardShadow
                )}
              >
                <div
                  className={cn(
                    "relative mx-auto w-full overflow-hidden rounded-[1.15rem] bg-muted/40",
                    hasCustomPortrait ? "aspect-[4/5]" : "aspect-square max-w-[200px]"
                  )}
                >
                  <Image
                    src={portraitSrc}
                    alt={about.pageTitle}
                    fill
                    className={hasCustomPortrait ? "object-cover" : "object-contain p-4"}
                    unoptimized={shouldUseUnoptimizedImage(portraitSrc)}
                    sizes="(max-width: 640px) 280px, 320px"
                    priority
                  />
                </div>
                <p className="mt-4 text-center text-sm font-semibold text-foreground">{about.pageTitle}</p>
                <p className="mt-1 text-center text-xs text-foreground/50">Founder & Owner · Awud Digitals</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {about.introTitle}
            </h2>
          </motion.div>
          <div className="mt-6 space-y-5 md:mt-8 md:space-y-6">
            {introParagraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                {...(reduceMotion ? {} : fade(0.03 + i * 0.03))}
                className="text-base leading-relaxed text-foreground/65 md:text-lg"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/25 py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">Journey</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {about.journeyTitle}
            </h2>
          </motion.div>

          {about.journeyQuote.trim() ? (
            <motion.blockquote
              {...(reduceMotion ? {} : fade(0.05))}
              className={cn(
                "mt-7 rounded-2xl border border-border/70 bg-card px-5 py-4 text-base font-medium leading-relaxed text-foreground/80 sm:px-6 sm:py-5 md:text-lg",
                cardShadow
              )}
            >
              &ldquo;{about.journeyQuote}&rdquo;
            </motion.blockquote>
          ) : null}

          <ol className="relative mt-9 space-y-0">
            <div
              aria-hidden
              className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-foreground/25 via-border to-transparent md:left-[15px]"
            />
            {journeyParagraphs.map((paragraph, i) => (
              <motion.li
                key={i}
                {...(reduceMotion ? {} : fade(0.05 + i * 0.04))}
                className="relative flex gap-5 pb-8 last:pb-0 sm:gap-6 sm:pb-10"
              >
                <span className="relative z-10 mt-1.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border bg-card md:size-8">
                  <span className="size-1.5 rounded-full bg-accent md:size-2" />
                </span>
                <p className="pt-0.5 text-base leading-relaxed text-foreground/65 md:text-lg">{paragraph}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:gap-5 sm:px-6 md:grid-cols-2 lg:px-8">
          {[
            { icon: Target, title: "Mission", body: about.mission },
            { icon: Telescope, title: "Vision", body: about.vision },
          ].map(({ icon: Icon, title, body }, i) => (
            <motion.article
              key={title}
              {...(reduceMotion ? {} : fade(0.05 + i * 0.05))}
              className={cn(
                "rounded-[1.35rem] border border-border/70 bg-card p-6 sm:p-8",
                cardShadow
              )}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-accent">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
              </div>
              <p className="mt-4 leading-relaxed text-foreground/65">{body}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20 py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">Milestones</p>
            <h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl lg:text-4xl">Achievements</h2>
          </motion.div>
          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
            {about.achievements.map((item, i) => (
              <motion.div
                key={i}
                {...(reduceMotion ? {} : fade(0.04 + i * 0.03))}
                className={cn(
                  "flex gap-3.5 rounded-2xl border border-border/70 bg-card p-4 sm:gap-4 sm:p-5",
                  cardShadow
                )}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-[11px] font-semibold text-foreground/55 sm:size-10 sm:text-sm">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-relaxed text-foreground/70 sm:text-[15px]">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...(reduceMotion ? {} : fade(0))}
            className={cn("rounded-[1.5rem] border border-border/70 bg-card p-6 sm:p-8 md:p-10", cardShadow)}
          >
            <div className="max-w-3xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-accent">The ecosystem</p>
              <h2 className="mt-2 font-display text-xl font-semibold sm:text-2xl md:text-3xl">
                Everything begins with Awud Digitals
              </h2>
              <div className="mt-4 space-y-3">
                {ecosystemIntro.map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-foreground/65">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4">
              {ecosystemProducts.map((product, i) => (
                <motion.article
                  key={product.title}
                  {...(reduceMotion ? {} : fade(0.04 + i * 0.04))}
                  className="rounded-2xl border border-border/70 bg-muted/30 p-5 sm:p-6"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Layers className="size-4 text-accent" />
                    <h3 className="font-display text-lg font-semibold text-foreground sm:text-xl">
                      {product.title}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-accent">{product.tagline}</p>
                  <p className="mt-2.5 text-sm leading-relaxed text-foreground/60">{product.description}</p>
                </motion.article>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="/#ecosystem"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
              >
                View our products
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Work with us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border/60 pb-20 pt-14 md:pb-28 md:pt-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div {...(reduceMotion ? {} : fade(0))}>
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              {about.closingTitle}
            </h2>
            <div className="mt-5 space-y-4 text-left sm:mt-6 sm:space-y-5 md:text-center">
              {closingParagraphs.map((paragraph, i) => (
                <p key={i} className="text-base leading-relaxed text-foreground/65 md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            {about.closingTagline.trim() ? (
              <p className="mt-7 font-display text-base font-semibold text-accent sm:text-lg md:text-xl">
                {about.closingTagline}
              </p>
            ) : null}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
