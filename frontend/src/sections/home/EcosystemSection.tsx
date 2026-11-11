"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, Circle, Sparkles } from "lucide-react";
import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { cn } from "@/lib/utils";
import type { EcosystemProductCard } from "@/lib/site-content.shared";

const STATUS_LABEL: Record<EcosystemProductCard["status"], string> = {
  live: "Live",
  building: "Building",
  planned: "Planned",
};

const STATUS_STYLE: Record<EcosystemProductCard["status"], string> = {
  live: "bg-emerald-500/15 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400",
  building: "bg-amber-500/15 text-amber-700 ring-amber-500/25 dark:text-amber-400",
  planned: "bg-foreground/8 text-foreground/55 ring-foreground/15",
};

function ProductLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (!href.trim()) return null;
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function TreeConnector({ columnCount }: { columnCount: number }) {
  if (columnCount <= 0) return null;

  if (columnCount === 1) {
    return (
      <div className="flex justify-center py-3 md:py-5" aria-hidden>
        <div className="h-10 w-px bg-gradient-to-b from-foreground/25 via-foreground/10 to-border md:h-14" />
      </div>
    );
  }

  const width = 640;
  const height = 44;
  const stem = 14;
  const cx = width / 2;
  const positions = Array.from({ length: columnCount }, (_, i) => {
    const segment = width / columnCount;
    return segment * i + segment / 2;
  });

  const path = [
    `M ${cx} 0 V ${stem}`,
    `M ${positions[0]} ${stem} H ${positions[columnCount - 1]}`,
    ...positions.map((x) => `M ${x} ${stem} V ${height}`),
  ].join(" ");

  return (
    <div className="relative mx-auto hidden w-full max-w-4xl px-4 py-2 md:block lg:max-w-5xl" aria-hidden>
      <svg
        className="mx-auto w-full text-foreground/20"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ height: "2.75rem" }}
      >
        <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function MobileStackConnector() {
  return (
    <div className="flex justify-center py-2 md:hidden" aria-hidden>
      <div className="h-8 w-px bg-gradient-to-b from-foreground/25 to-border" />
    </div>
  );
}

function ParentCompanyCard({ label, founderName }: { label: string; founderName: string }) {
  return (
    <div className="relative w-full max-w-[min(100%,22rem)] sm:max-w-md">
      <div className="relative overflow-hidden rounded-[1.65rem] border border-border bg-card px-6 py-6 text-center shadow-[0_10px_40px_-18px_rgba(12,12,12,0.18)] sm:px-8 sm:py-7 dark:shadow-[0_10px_40px_-18px_rgba(0,0,0,0.55)]">
        <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground/70 sm:size-12">
          <Building2 className="size-5 sm:size-6" />
        </span>
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-foreground/45">
          {label}
        </p>
        <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">Awud Digitals</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/58">
          Founded by {founderName} · Parent company & product studio
        </p>
      </div>
    </div>
  );
}

function ProductCard({ card, index }: { card: EcosystemProductCard; index: number }) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_10px_40px_-18px_rgba(12,12,12,0.18)] transition duration-300 dark:shadow-[0_10px_40px_-18px_rgba(0,0,0,0.55)]",
        "hover:border-accent/30",
        card.featured && "border-accent/25"
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-border/50 bg-muted/40 sm:aspect-[5/3]">
        {card.imageSrc.trim() ? (
          <Image
            src={card.imageSrc}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            unoptimized={shouldUseUnoptimizedImage(card.imageSrc)}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={index === 0}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 via-muted/30 to-transparent">
            <Sparkles className="size-9 text-accent/50 sm:size-10" />
          </div>
        )}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 sm:left-4 sm:top-4 sm:px-3",
            STATUS_STYLE[card.status]
          )}
        >
          <Circle className="size-1.5 fill-current" />
          {STATUS_LABEL[card.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">{card.tagline}</p>
        <h3 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">{card.title}</h3>
        <p className="mt-2.5 flex-1 text-sm leading-relaxed text-foreground/62 sm:mt-3">{card.description}</p>
        {card.href.trim() ? (
          <ProductLink
            href={card.href}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:gap-2.5 sm:mt-5"
          >
            {card.linkLabel}
            <ArrowUpRight className="size-4 shrink-0" />
          </ProductLink>
        ) : null}
      </div>
    </article>
  );
}

function cardsGridClass(count: number) {
  if (count <= 1) return "mx-auto max-w-md grid-cols-1";
  if (count === 2) return "mx-auto max-w-4xl grid-cols-1 sm:grid-cols-2";
  return "mx-auto max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
}

export default function EcosystemSection() {
  const { content } = useSiteContent();
  const featured = content.ecosystemCards.find((c) => c.featured);
  const others = content.ecosystemCards.filter((c) => !c.featured);
  const cards = [...(featured ? [featured] : []), ...others];

  return (
    <SectionWrapper
      id="ecosystem"
      className="relative z-10 border-t border-border bg-background py-20 sm:py-24 md:py-28 lg:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(255,106,0,0.08),transparent_62%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:3rem_3rem] dark:opacity-[0.2]"
        aria-hidden
      />

      <div className="relative">
        <FadeIn>
          <div className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-3xl lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start sm:mb-5">
              <div className="h-px w-8 bg-primary" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-accent">
                {content.ecosystemSectionTag}
              </span>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
              {content.ecosystemSectionTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-foreground/60 sm:mt-5 sm:text-lg lg:mx-0">
              {content.ecosystemSectionDescription}
            </p>
          </div>
        </FadeIn>

        <div className="relative mt-12 sm:mt-14 md:mt-16">
          <FadeIn delay={0.08}>
            <div className="flex flex-col items-center">
              <ParentCompanyCard
                label={content.ecosystemParentLabel}
                founderName={content.aboutYafet.pageTitle}
              />
              <MobileStackConnector />
              <TreeConnector columnCount={cards.length} />
            </div>
          </FadeIn>

          {cards.length > 0 ? (
            <div className={cn("mt-4 grid gap-5 sm:mt-5 sm:gap-6 md:mt-2", cardsGridClass(cards.length))}>
              {cards.map((card, index) => (
                <FadeIn key={`${card.title}-${index}`} delay={0.12 + index * 0.06}>
                  <ProductCard card={card} index={index} />
                </FadeIn>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </SectionWrapper>
  );
}
