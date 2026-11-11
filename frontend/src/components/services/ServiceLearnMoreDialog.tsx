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
        overlayClassName="bg-foreground/25 backdrop-blur-[2px]"
        className={cn(
          "w-[min(100%-1.25rem,30rem)] gap-0 overflow-hidden rounded-[1.5rem] border border-border/70 p-0 shadow-sm",
          "bg-card text-foreground",
          "sm:max-w-md md:max-w-[30rem]",
          "data-open:duration-200 data-closed:duration-150",
          "[&_[data-slot=dialog-close]]:top-4 [&_[data-slot=dialog-close]]:right-4 [&_[data-slot=dialog-close]]:rounded-full"
        )}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.35, ease }}
          className="relative px-6 pb-5 pt-7 sm:px-7"
          data-lenis-prevent
        >
          <DialogHeader className="gap-0 text-left">
            <div className="flex items-start gap-4 pr-8">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <Icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 space-y-2 pt-0.5">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Service</p>
                <DialogTitle className="font-display text-[1.4rem] font-semibold leading-[1.15] tracking-tight text-foreground sm:text-2xl">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-[15px] leading-relaxed text-muted-foreground">
                  {description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </motion.div>

        <div
          className="max-h-[min(48vh,22rem)] overflow-y-auto px-6 py-1 sm:px-7"
          data-lenis-prevent
        >
          <div className="space-y-4 border-t border-border/60 py-5">
            {body.map((p, i) => (
              <motion.p
                key={i}
                className="text-pretty text-[15px] leading-[1.7] text-foreground/80"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduce ? 0 : 0.3,
                  ease,
                  delay: reduce ? 0 : 0.04 * i,
                }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            className="order-2 h-10 rounded-full px-5 text-muted-foreground hover:bg-muted hover:text-foreground sm:order-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Link
            href="#contact"
            onClick={() => onOpenChange(false)}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "group order-1 h-11 rounded-full px-6 text-sm font-semibold transition hover:opacity-90 sm:order-2"
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
