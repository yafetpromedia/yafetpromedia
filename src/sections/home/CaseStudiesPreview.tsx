"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/animations/FadeIn";
import { TrendingUp, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useSiteContent } from "@/components/common/SiteContentProvider";

export default function CaseStudiesPreview() {
  const { content } = useSiteContent();
  const icons = [Users, TrendingUp, Users];
  const cases = content.caseStudiesCards.map((item, index) => ({
    ...item,
    icon: icons[index] ?? Users,
  }));

  return (
    <SectionWrapper id="case-studies" className="bg-background border-t border-border relative z-10 pt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-foreground">
        <div className="max-w-2xl">
          <FadeIn>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">{content.caseStudiesSectionTag}</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
              {content.caseStudiesSectionTitle}
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed font-light">
              {content.caseStudiesSectionDescription}
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2} className="shrink-0">
          <Link href="#contact" className="group inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-foreground hover:text-primary transition-colors pb-2 border-b border-border hover:border-primary">
            {content.caseStudiesSectionCtaLabel}
            <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </FadeIn>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {cases.map((item, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <div className="bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/30 hover:bg-card/80 transition-all duration-500 flex flex-col h-full group relative text-foreground">
              {/* Subtle gradient overlay */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary),transparent_70%)] opacity-5 pointer-events-none" />
              
              <div className="p-8 lg:p-12 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <Badge variant="secondary" className="bg-foreground/5 hover:bg-foreground/10 text-foreground/70 border border-border px-4 py-1 text-xs tracking-wider rounded-full font-mono">
                    {item.category}
                  </Badge>
                  <div className="size-10 rounded-full border border-border flex items-center justify-center bg-background group-hover:border-primary/30 transition-colors">
                    <item.icon className="size-4 text-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-display font-bold mb-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-foreground/60 transition-all">
                  {item.title}
                </h3>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-[2px] bg-red-500/20 rounded-full" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-foreground/40 tracking-widest block mb-2">The Constraint</span>
                      <p className="text-foreground/60 font-light leading-relaxed">{item.problem}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-[2px] bg-primary/40 rounded-full" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-primary tracking-widest block mb-2">The Architecture</span>
                      <p className="text-foreground font-light leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-border bg-foreground/5 p-8 lg:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10 group-hover:bg-foreground/[0.08] transition-colors">
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase text-primary tracking-[0.2em] block mb-2">Verifiable Result</span>
                  <p className="text-foreground font-medium">{item.result}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-4xl md:text-5xl font-display font-bold text-foreground block">{item.stat}</span>
                  <span className="text-xs text-foreground/40 font-mono uppercase tracking-widest">{item.statLabel}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
