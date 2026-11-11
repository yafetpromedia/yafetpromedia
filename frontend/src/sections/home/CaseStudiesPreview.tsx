"use client";

import Image from "next/image";
import Link from "next/link";
import SectionWrapper from "@/components/common/SectionWrapper";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/animations/FadeIn";
import { TrendingUp, Users, ArrowUpRight, ExternalLink } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { normalizePortfolioCases } from "@/lib/portfolio";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";

const STATUS_LABEL = {
  live: "Live",
  "in-progress": "In progress",
  completed: "Completed",
  concept: "Concept",
} as const;

/** Shown on the home case studies section; additional cases are on /portfolio. */
const LANDING_CASE_STUDIES_LIMIT = 2;

export default function CaseStudiesPreview() {
  const { content } = useSiteContent();
  const icons = [Users, TrendingUp, Users];
  const allCases = normalizePortfolioCases(content.caseStudiesCards).map((item, index) => ({
    ...item,
    icon: icons[index % icons.length] ?? Users,
  }));
  const cases = allCases.slice(0, LANDING_CASE_STUDIES_LIMIT);
  const hasMoreCases = allCases.length > LANDING_CASE_STUDIES_LIMIT;

  return (
    <SectionWrapper id="case-studies" className="bg-background border-t border-border relative z-10 pt-32">
      <div className="mb-16 flex flex-col justify-between gap-8 text-foreground md:flex-row md:items-end">
        <div className="max-w-2xl">
          <FadeIn>
              <div className="mb-6 flex items-center gap-2">
              <div className="h-px w-8 bg-accent/70" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                {content.caseStudiesSectionTag}
              </span>
            </div>
            <h2 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              {content.caseStudiesSectionTitle}
            </h2>
            <p className="text-lg font-light leading-relaxed text-foreground/60">
              {content.caseStudiesSectionDescription}
            </p>
          </FadeIn>
        </div>
        {(hasMoreCases || allCases.length > 0) && content.caseStudiesSectionCtaLabel.trim() ? (
          <FadeIn delay={0.2} className="shrink-0">
            <Link
              href="/portfolio"
              className="group inline-flex items-center gap-2 border-b border-border pb-2 text-left text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {content.caseStudiesSectionCtaLabel}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
          </FadeIn>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {cases.map((item, index) => (
          <FadeIn key={item.slug} delay={index * 0.1}>
            <Link
              href={`/portfolio/${item.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card text-foreground shadow-[0_10px_40px_-18px_rgba(12,12,12,0.18)] transition-colors duration-300 hover:border-accent/30 dark:shadow-[0_10px_40px_-18px_rgba(0,0,0,0.55)]"
            >
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

              <div className="relative z-10 flex-1 p-8 lg:p-12">
                <div className="mb-8 flex items-start justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full border border-border bg-foreground/5 px-4 py-1 font-mono text-xs tracking-wider text-foreground/70 hover:bg-foreground/10"
                    >
                      {item.category}
                    </Badge>
                    {item.projectStatus && (
                      <Badge className="border-accent/25 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-wider text-accent">
                        {STATUS_LABEL[item.projectStatus] ?? item.projectStatus}
                      </Badge>
                    )}
                  </div>
                  <div className="flex size-10 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-accent/30">
                    <item.icon className="size-4 text-foreground/40 transition-colors group-hover:text-accent" />
                  </div>
                </div>

                <h3 className="mb-4 font-display text-3xl font-bold transition-all group-hover:bg-gradient-to-r group-hover:from-foreground group-hover:to-foreground/60 group-hover:bg-clip-text group-hover:text-transparent">
                  {item.title}
                </h3>
                {item.clientName?.trim() && (
                  <p className="mb-8 text-sm text-foreground/50">
                    Client: <span className="font-medium text-foreground/75">{item.clientName}</span>
                  </p>
                )}
                {(item.technologies?.length ?? 0) > 0 && (
                  <div className="mb-8 flex flex-wrap gap-2">
                    {item.technologies!.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-border/80 bg-background/60 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/55"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-1 flex-col space-y-8">
                  <div className="flex gap-4">
                    <div className="w-0.5 rounded-full bg-red-500/20" />
                    <div>
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                        The Constraint
                      </span>
                      <p className="font-light leading-relaxed text-foreground/60">{item.problem}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-0.5 rounded-full bg-accent/40" />
                    <div>
                      <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-accent">
                        The Architecture
                      </span>
                      <p className="font-light leading-relaxed text-foreground">{item.solution}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-start justify-between gap-6 border-t border-border bg-foreground/5 p-8 transition-colors group-hover:bg-foreground/[0.08] sm:flex-row sm:items-center lg:px-12">
                <div className="flex-1">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    Verifiable Result
                  </span>
                  <p className="font-medium text-foreground">{item.result}</p>
                  {item.projectLink?.trim() && (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      View project <ExternalLink className="size-3.5" />
                    </span>
                  )}
                </div>
                <div className="shrink-0 text-left sm:text-right">
                  <span className="block font-display text-4xl font-bold text-foreground md:text-5xl">
                    {item.stat}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-widest text-foreground/40">
                    {item.statLabel}
                  </span>
                </div>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
