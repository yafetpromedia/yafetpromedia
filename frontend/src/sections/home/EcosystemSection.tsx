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

export default function EcosystemSection() {
  const { content } = useSiteContent();
  const featured = content.ecosystemCards.find((c) => c.featured);
  const others = content.ecosystemCards.filter((c) => !c.featured);

  return (
    <SectionWrapper id="ecosystem" className="relative z-10 border-t border-border bg-background py-28 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(255,106,0,0.07),transparent_60%)]" />

      <div className="relative">
        <FadeIn>
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-5 flex items-center gap-2">
                <div className="h-px w-8 bg-primary" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                  {content.ecosystemSectionTag}
                </span>
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
                {content.ecosystemSectionTitle}
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-foreground/60">{content.ecosystemSectionDescription}</p>
            </div>
          </div>
        </FadeIn>

        {/* Hierarchy tree */}
        <div className="relative mx-auto max-w-4xl">
          <FadeIn delay={0.08}>
            <div className="relative flex flex-col items-center">
              <div className="relative z-10 flex w-full max-w-md flex-col items-center rounded-3xl border border-primary/35 bg-gradient-to-br from-primary/[0.12] via-card to-card px-8 py-7 text-center shadow-[0_24px_80px_-40px_rgba(255,106,0,0.45)] ring-1 ring-primary/20">
                <span className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Building2 className="size-6" />
                </span>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/90">
                  {content.ecosystemParentLabel}
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold text-foreground">YafetPromedia</h3>
                <p className="mt-2 text-sm text-foreground/58">Parent company · agency + product studio</p>
              </div>

              <div aria-hidden className="my-3 h-10 w-px bg-gradient-to-b from-primary/50 to-border" />
              <div aria-hidden className="h-px w-[min(100%,520px)] bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          </FadeIn>

          <div className="mt-2 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...(featured ? [featured] : []), ...others].map((card, index) => (
              <FadeIn key={`${card.title}-${index}`} delay={0.12 + index * 0.06}>
                <article
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card/80 transition duration-500 hover:border-primary/35 hover:shadow-[0_20px_60px_-30px_rgba(255,106,0,0.35)]",
                    card.featured && "md:col-span-2 lg:col-span-1 lg:row-span-1 ring-1 ring-primary/15"
                  )}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/40">
                    {card.imageSrc.trim() ? (
                      <Image
                        src={card.imageSrc}
                        alt=""
                        fill
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                        unoptimized={shouldUseUnoptimizedImage(card.imageSrc)}
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/15 to-transparent">
                        <Sparkles className="size-10 text-primary/50" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                    <span
                      className={cn(
                        "absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1",
                        STATUS_STYLE[card.status]
                      )}
                    >
                      <Circle className="size-1.5 fill-current" />
                      {STATUS_LABEL[card.status]}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6 lg:p-7">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/85">
                      {card.tagline}
                    </p>
                    <h3 className="mt-2 font-display text-2xl font-bold text-foreground">{card.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/62">{card.description}</p>
                    {card.href.trim() && (
                      <ProductLink
                        href={card.href}
                        className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-2.5"
                      >
                        {card.linkLabel}
                        <ArrowUpRight className="size-4" />
                      </ProductLink>
                    )}
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
