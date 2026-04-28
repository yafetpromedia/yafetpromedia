"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

function splitLearnMoreBody(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  return t
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

type ServiceLearnMoreDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  learnMore: string;
  icon: LucideIcon;
};

export default function ServiceLearnMoreDialog({
  open,
  onOpenChange,
  title,
  description,
  learnMore,
  icon: Icon,
}: ServiceLearnMoreDialogProps) {
  const reduce = useReducedMotion();
  const paragraphs = splitLearnMoreBody(learnMore);
  const body =
    paragraphs.length > 0
      ? paragraphs
      : [description].filter((p) => p.trim().length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-zinc-950/50 supports-[backdrop-filter]:backdrop-blur-[6px]"
        className={cn(
          "w-[min(100%-1.25rem,28rem)] gap-0 overflow-hidden rounded-[1.35rem] border-0 p-0 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)]",
          "bg-background/75 supports-[backdrop-filter]:backdrop-blur-2xl dark:bg-background/55",
          "ring-1 ring-primary/[0.12] dark:ring-primary/20",
          "sm:max-w-md md:max-w-[28rem]",
          "data-open:duration-200 data-closed:duration-150"
        )}
      >
        {/* Top glow line */}
        <div
          className="pointer-events-none absolute inset-x-6 top-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-90"
          aria-hidden
        />

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease }}
          className="relative border-b border-border/50 bg-gradient-to-br from-primary/[0.14] via-background/30 to-transparent px-6 pb-6 pt-7"
          data-lenis-prevent
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--border) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.35) 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
              maskImage: "radial-gradient(ellipse 100% 90% at 10% 0%, black, transparent 65%)",
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-primary/[0.15] blur-3xl"
            aria-hidden
          />
          <DialogHeader className="relative z-10 gap-0 text-left sm:text-left">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex size-14 shrink-0 items-center justify-center rounded-2xl",
                  "border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5",
                  "shadow-[0_8px_32px_-12px_rgba(255,106,0,0.45)] ring-1 ring-white/10"
                )}
              >
                <Icon className="size-6 text-primary" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-2.5 pt-0.5">
                <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.22em] text-primary/90">
                  Service
                </p>
                <DialogTitle className="font-display text-[1.35rem] font-bold leading-[1.15] tracking-[-0.02em] text-foreground sm:text-2xl">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-[15px] leading-relaxed text-foreground/65 sm:text-[15px]">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </motion.div>

        <div
          className="relative max-h-[min(54vh,24rem)] overflow-y-auto px-6 py-6"
          data-lenis-prevent
        >
          <div className="pointer-events-none absolute left-0 top-6 bottom-6 w-px bg-gradient-to-b from-primary/40 via-primary/15 to-transparent opacity-60" />
          <div className="space-y-5 pl-4">
            {body.map((p, i) => (
              <motion.p
                key={i}
                className="text-pretty text-[15px] leading-[1.72] text-foreground/[0.82] first:mt-0"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.35,
                  ease,
                  delay: reduce ? 0 : 0.05 * i,
                }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 bg-gradient-to-b from-muted/20 to-muted/40 px-5 py-4 supports-[backdrop-filter]:backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <Button
            type="button"
            variant="ghost"
            className="order-2 h-10 rounded-full px-5 text-foreground/60 hover:text-foreground sm:order-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Link
            href="#contact"
            onClick={() => onOpenChange(false)}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "group order-1 h-11 rounded-full border border-primary/20 px-7 text-sm font-semibold shadow-[0_8px_28px_-8px_rgba(255,106,0,0.55)] transition-shadow hover:shadow-[0_12px_36px_-10px_rgba(255,106,0,0.6)] sm:order-2",
              "gap-2"
            )}
          >
            Start a project
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
