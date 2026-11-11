"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { cn } from "@/lib/utils";

export default function PricingSection() {
  const { content } = useSiteContent();
  const packages = content.pricingPackages ?? [];

  if (packages.length === 0) return null;

  return (
    <SectionWrapper id="pricing" className="relative z-10 border-t border-border/60 bg-background">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <FadeIn>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            {content.pricingSectionTag}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {content.pricingSectionTitle}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/60 md:text-lg">
            {content.pricingSectionDescription}
          </p>
        </FadeIn>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-6 lg:items-stretch">
        {packages.map((pkg, index) => (
          <FadeIn key={`${pkg.name}-${index}`} delay={index * 0.08}>
            <div
              className={cn(
                "relative flex h-full flex-col border-t-2 border-border/80 pt-8",
                pkg.highlighted && "border-t-accent"
              )}
            >
              {pkg.highlighted ? (
                <span className="mb-4 inline-flex w-fit rounded-full bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
                  Most chosen
                </span>
              ) : (
                <span className="mb-4 h-6" aria-hidden />
              )}
              <h3 className="font-display text-2xl font-bold text-foreground">{pkg.name}</h3>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                {pkg.priceLabel}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-foreground/60">{pkg.description}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm text-foreground/75">
                    <Check className="mt-0.5 size-4 shrink-0 text-foreground/45" strokeWidth={2.5} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={pkg.highlighted || /book|scop/i.test(pkg.ctaLabel) ? "#book-call" : "#contact"}
                className={cn(
                  "mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition",
                  pkg.highlighted
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border border-border bg-card text-foreground hover:bg-muted"
                )}
              >
                {pkg.ctaLabel}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
