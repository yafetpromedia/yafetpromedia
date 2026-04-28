"use client";

import { Briefcase } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CaseStudyCard } from "@/lib/site-content.shared";

const ease = [0.16, 1, 0.3, 1] as const;

export type CaseStudiesCatalogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  caseStudies: CaseStudyCard[];
};

export default function CaseStudiesCatalogDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  caseStudies,
}: CaseStudiesCatalogDialogProps) {
  const reduce = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-zinc-950/60 supports-[backdrop-filter]:backdrop-blur-[10px] data-open:duration-200"
        className={cn(
          "flex w-full max-w-[min(100%-1.5rem,56rem)] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0",
          "sm:max-w-[min(100%-1.5rem,56rem)]",
          "max-h-[min(86vh,44rem)] sm:max-h-[min(88vh,46rem)] lg:max-h-[min(90vh,48rem)]",
          "bg-background/80 supports-[backdrop-filter]:backdrop-blur-2xl",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_100px_-40px_rgba(0,0,0,0.65),0_24px_64px_-28px_rgba(255,106,0,0.12)]",
          "ring-1 ring-white/10",
          "[&_[data-slot=dialog-close]]:top-2.5 [&_[data-slot=dialog-close]]:right-2.5 sm:[&_[data-slot=dialog-close]]:top-4 sm:[&_[data-slot=dialog-close]]:right-4"
        )}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-[18rem] rounded-full bg-primary/[0.08] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-12 size-[14rem] rounded-full bg-primary/[0.04] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-10 top-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          aria-hidden
        />

        <div className="relative shrink-0 border-b border-border/50 bg-gradient-to-br from-primary/[0.1] via-background/30 to-transparent px-5 pb-5 pt-6 sm:px-8 sm:pb-5 sm:pt-7">
          <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Briefcase className="size-5" aria-hidden />
          </div>
          <DialogHeader className="gap-1.5 text-left sm:gap-2">
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl">
              {title}
            </DialogTitle>
            {subtitle ? (
              <DialogDescription className="max-w-2xl text-pretty text-sm leading-relaxed text-foreground/60 sm:text-base">
                {subtitle}
              </DialogDescription>
            ) : null}
            <p className="pt-0.5 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-foreground/40">
              {caseStudies.length} {caseStudies.length === 1 ? "case" : "cases"}
            </p>
          </DialogHeader>
        </div>

        <div
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
          data-lenis-prevent
        >
          <ul className="flex flex-col gap-4 sm:gap-5">
            {caseStudies.map((c, i) => (
              <motion.li
                key={`${c.title}-${i}`}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.32, ease, delay: reduce ? 0 : 0.04 * i }}
              >
                <article
                  className={cn(
                    "overflow-hidden rounded-2xl border border-border/70 bg-card/50 text-left",
                    "shadow-sm ring-1 ring-foreground/5"
                  )}
                >
                  <div className="p-4 sm:p-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-foreground/5 text-foreground/70"
                      >
                        {c.category}
                      </Badge>
                    </div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl">
                      {c.title}
                    </h3>
                    <div className="mt-4 space-y-4 text-sm sm:text-[15px]">
                      <div className="flex gap-3">
                        <div className="w-0.5 shrink-0 rounded-full bg-destructive/20" />
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-foreground/40">
                            The constraint
                          </span>
                          <p className="mt-1.5 font-light leading-relaxed text-foreground/70">
                            {c.problem}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-0.5 shrink-0 rounded-full bg-primary/40" />
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                            The architecture
                          </span>
                          <p className="mt-1.5 font-light leading-relaxed text-foreground">
                            {c.solution}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-border/60 bg-foreground/5 p-4 sm:px-5 sm:py-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary">
                          Result
                        </span>
                        <p className="mt-1 text-sm font-medium text-foreground">{c.result}</p>
                      </div>
                      <div className="shrink-0 sm:text-right">
                        <p className="text-2xl font-display font-bold text-foreground sm:text-3xl">
                          {c.stat}
                        </p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-foreground/45">
                          {c.statLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative shrink-0 border-t border-border/50 bg-muted/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <p className="text-center text-[11px] text-foreground/45 sm:mr-auto sm:text-left sm:text-xs">
              Full portfolio of outcomes and metrics.
            </p>
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-full border-border/80 px-6 text-sm font-semibold"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
