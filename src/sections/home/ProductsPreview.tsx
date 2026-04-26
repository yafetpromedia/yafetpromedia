"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { Boxes, ChartColumn, ShieldCheck, Workflow } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";

export default function ProductsPreview() {
  const { content } = useSiteContent();
  const icons = [Boxes, ChartColumn, ShieldCheck, Workflow];
  const cards = content.productsCards.map((card, index) => ({
    ...card,
    icon: icons[index] ?? Boxes,
  }));

  return (
    <SectionWrapper id="products" className="overflow-hidden bg-background">
      <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 md:p-10 lg:p-12 text-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary),transparent_55%)] opacity-10 pointer-events-none" />

        <FadeIn className="relative z-10 max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-foreground/5 text-[11px] font-mono tracking-widest uppercase text-foreground/70 mb-6">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            {content.productsSectionTag}
          </div>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-[1.08] tracking-tight">
            {content.productsSectionTitle}
          </h3>
        </FadeIn>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, index) => (
            <FadeIn key={card.title} delay={index * 0.08}>
              <article className="group h-full rounded-3xl border border-border bg-background/70 p-6 md:p-7 hover:border-primary/40 hover:bg-background transition-all duration-500">
                <div className="mb-5 flex items-center justify-between">
                  <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <card.icon className="size-5 text-primary" />
                  </div>
                  <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/45 font-mono">{card.label}</span>
                </div>
                <h4 className="text-xl md:text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                  {card.title}
                </h4>
                <p className="text-foreground/65 leading-relaxed">
                  {card.description}
                </p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
