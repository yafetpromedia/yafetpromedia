"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SectionWrapper from "@/components/common/SectionWrapper";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/animations/FadeIn";
import { TrendingUp, Users, ArrowUpRight, ExternalLink } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import CaseStudiesCatalogDialog from "@/components/case-studies/CaseStudiesCatalogDialog";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";

const STATUS_LABEL = {
  live: "Live",
  "in-progress": "In progress",
  completed: "Completed",
  concept: "Concept",
} as const;

/** Shown on the home case studies section; additional cases are only in “View all”. */
const LANDING_CASE_STUDIES_LIMIT = 2;

export default function CaseStudiesPreview() {
  const { content } = useSiteContent();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const icons = [Users, TrendingUp, Users];
  const allCases = content.caseStudiesCards.map((item, index) => ({
    ...item,
    icon: icons[index % icons.length] ?? Users,
  }));
  const cases = allCases.slice(0, LANDING_CASE_STUDIES_LIMIT);
  const hasMoreCases = content.caseStudiesCards.length > LANDING_CASE_STUDIES_LIMIT;

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
        {hasMoreCases && content.caseStudiesSectionCtaLabel.trim() ? (
          <FadeIn delay={0.2} className="shrink-0">
            <button
              type="button"
              onClick={() => setCatalogOpen(true)}
              className="group inline-flex items-center gap-2 border-b border-border pb-2 text-left text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {content.caseStudiesSectionCtaLabel}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </FadeIn>
        ) : null}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {cases.map((item, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <div className="bg-card border border-border rounded-[2rem] overflow-hidden hover:border-primary/30 hover:bg-card/80 transition-all duration-500 flex flex-col h-full group relative text-foreground">
              {(item.images?.[0] ?? "").trim() && (
                <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-border/60">
                  <Image
                    src={item.images![0]!}
                    alt=""
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.02]"
                    unoptimized={shouldUseUnoptimizedImage(item.images![0]!)}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              )}
              {/* Subtle gradient overlay */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_top_right,var(--color-primary),transparent_70%)] opacity-5 pointer-events-none" />
              
              <div className="p-8 lg:p-12 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-foreground/5 hover:bg-foreground/10 text-foreground/70 border border-border px-4 py-1 text-xs tracking-wider rounded-full font-mono">
                      {item.category}
                    </Badge>
                    {item.projectStatus && (
                      <Badge className="bg-primary/12 text-primary border-primary/25 px-3 py-1 text-[10px] uppercase tracking-wider">
                        {STATUS_LABEL[item.projectStatus] ?? item.projectStatus}
                      </Badge>
                    )}
                  </div>
                  <div className="size-10 rounded-full border border-border flex items-center justify-center bg-background group-hover:border-primary/30 transition-colors">
                    <item.icon className="size-4 text-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-display font-bold mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-foreground/60 transition-all">
                  {item.title}
                </h3>
                {item.clientName?.trim() && (
                  <p className="mb-8 text-sm text-foreground/50">Client: <span className="font-medium text-foreground/75">{item.clientName}</span></p>
                )}
                {(item.technologies?.length ?? 0) > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2">
                    {item.technologies!.map((tech) => (
                      <span key={tech} className="rounded-full border border-border/80 bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/55">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="space-y-8 flex-1">
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
                  {item.projectLink?.trim() && (
                    <a
                      href={item.projectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                    >
                      View project <ExternalLink className="size-3.5" />
                    </a>
                  )}
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

      <CaseStudiesCatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        title={content.caseStudiesSectionTitle}
        subtitle={content.caseStudiesSectionDescription}
        caseStudies={content.caseStudiesCards}
      />
    </SectionWrapper>
  );
}
