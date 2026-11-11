"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import ExploreArchitectureDialog from "@/components/architecture/ExploreArchitectureDialog";
import { cn } from "@/lib/utils";
import { Database, Layout, Video, LineChart, ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";

const systemLayouts = [
  { icon: Database, className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2", delay: 0.1 },
  { icon: Layout, className: "col-span-1 md:col-span-1 lg:col-span-2 row-span-1", delay: 0.2 },
  { icon: Video, className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1", delay: 0.3 },
  { icon: LineChart, className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1", delay: 0.4 },
];

export default function SystemsOverview() {
  const { content } = useSiteContent();
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const systems = content.systemsCards.map((card, index) => ({
    ...card,
    ...systemLayouts[index],
  }));
  const forMatch = content.systemsSectionTitle.match(/\bfor\b/i);
  const breakIndex = forMatch ? forMatch.index ?? -1 : -1;
  const beforeFor =
    breakIndex >= 0
      ? content.systemsSectionTitle.slice(0, breakIndex + forMatch![0].length)
      : content.systemsSectionTitle;
  const afterFor = breakIndex >= 0 ? content.systemsSectionTitle.slice(breakIndex + forMatch![0].length) : "";

  return (
    <SectionWrapper id="systems" className="bg-background border-t border-border relative z-10 pt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-foreground">
        <div className="max-w-2xl">
          <FadeIn>
            <div className="mb-6 flex items-center gap-2">
              <div className="h-px w-8 bg-accent/70" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{content.systemsSectionTag}</span>
            </div>
            <h2 className="text-[clamp(2rem,4.2vw,3.75rem)] font-display font-bold tracking-tight mb-6 leading-tight">
              {afterFor ? (
                <>
                  <span className="whitespace-nowrap">{beforeFor}</span>
                  <br />
                  {afterFor.trim()}
                </>
              ) : (
                content.systemsSectionTitle
              )}
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed font-light text-balance">
              {content.systemsSectionDescription}
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2} className="shrink-0">
          <button
            type="button"
            onClick={() => setArchitectureOpen(true)}
            className="group inline-flex items-center gap-2 text-left text-sm font-bold tracking-wider uppercase text-foreground hover:text-primary transition-colors pb-2 border-b border-border hover:border-primary"
          >
            {content.systemsExploreCtaLabel}
            <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </FadeIn>
      </div>
      
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.2
            }
          }
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-[auto] lg:grid-rows-2 gap-4 lg:gap-6 min-h-[600px]"
      >
        {systems.map((system, index) => {
          const hasImage = Boolean(system.imageSrc?.trim());
          return (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.95 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className={cn(
                "group relative rounded-[2rem] overflow-hidden transition-all duration-500",
                "md:min-h-0 md:h-full",
                index === 0 ? "min-h-[420px] lg:min-h-full" : "min-h-[300px]",
                hasImage
                  ? "border border-white/10 ring-1 ring-white/5 hover:border-white/20"
                  : "border border-border bg-card hover:border-accent/30",
                system.className
              )}
            >
              {/* Full-card background image */}
              {hasImage && (
                <>
                  <Image
                    src={system.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 28vw"
                    className="z-0 object-cover object-center pointer-events-none transition-transform duration-[1.1s] ease-out group-hover:scale-105"
                    unoptimized={shouldUseUnoptimizedImage(system.imageSrc)}
                    aria-hidden
                  />
                  {/* Readability scrim + brand tint — pointer-events-none so :hover targets card content */}
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/55 to-black/25"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-accent/10 via-transparent to-transparent opacity-80"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-black/35"
                    aria-hidden
                  />
                </>
              )}

              {/* No-image: soft studio background */}
              {!hasImage && (
                <>
                  <div
                    className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-muted/40 via-card to-card"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_0%,rgba(232,93,4,0.05),transparent_55%)]"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-0 z-[1] opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-foreground/[0.04]"
                    aria-hidden
                  />
                </>
              )}

              <div
                className={cn(
                  "absolute top-6 right-6 z-30 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider backdrop-blur-md transition-all duration-300",
                  hasImage
                    ? "border border-white/15 bg-black/40 text-white/85 group-hover:border-white/25"
                    : "border border-border bg-background/80 text-foreground/45 group-hover:border-accent/30 group-hover:text-foreground/70"
                )}
              >
                {system.tag}
              </div>

              <div className="relative z-20 flex h-full min-h-0 w-full flex-col justify-between p-8 lg:p-10 pointer-events-auto">
                <div
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-300",
                    hasImage
                      ? "border-white/20 bg-white/10 text-white backdrop-blur-md group-hover:border-accent/50 group-hover:text-accent"
                      : "border-border bg-muted text-foreground/70 group-hover:border-accent/35 group-hover:text-accent"
                  )}
                >
                  {system.icon && <system.icon className="size-6" />}
                </div>

                <div className="mt-auto max-w-[95%] shrink-0 space-y-3 pt-10">
                  <h3
                    className={cn(
                      "font-display text-2xl font-bold leading-tight tracking-tight transition-colors duration-300 md:text-[1.65rem]",
                      hasImage
                        ? "text-white group-hover:text-accent"
                        : "text-foreground group-hover:text-accent"
                    )}
                  >
                    {system.title}
                  </h3>
                  <p
                    className={cn(
                      "text-[15px] leading-relaxed font-light transition-colors duration-300",
                      hasImage
                        ? "text-white/80 group-hover:text-white"
                        : "text-foreground/60 group-hover:text-foreground/80"
                    )}
                  >
                    {system.description}
                  </p>
                </div>
              </div>

              <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-px z-20 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden
              />
            </motion.div>
          );
        })}
      </motion.div>

      <ExploreArchitectureDialog
        open={architectureOpen}
        onOpenChange={setArchitectureOpen}
        explore={content.exploreArchitecture}
      />
    </SectionWrapper>
  );
}
