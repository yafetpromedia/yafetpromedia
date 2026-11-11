"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
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
import { shouldUseUnoptimizedImage } from "@/lib/image-src";

const ease = [0.16, 1, 0.3, 1] as const;

function splitLearnMoreBody(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  return t
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

function ProductFooterLink({
  href,
  className,
  children,
  onNavigate,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  if (!href.trim()) return null;
  const external = /^https?:\/\//i.test(href);
  const go = () => onNavigate?.();
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={() => {
          go();
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        go();
      }}
    >
      {children}
    </Link>
  );
}

export type ProductLearnMoreDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  learnMore: string;
  label: string;
  imageSrc: string;
  href: string;
  linkLabel: string;
  featured: boolean;
};

export default function ProductLearnMoreDialog({
  open,
  onOpenChange,
  title,
  description,
  learnMore,
  label,
  imageSrc,
  href,
  linkLabel,
  featured,
}: ProductLearnMoreDialogProps) {
  const reduce = useReducedMotion();
  const paragraphs = splitLearnMoreBody(learnMore);
  const body =
    paragraphs.length > 0
      ? paragraphs
      : [description].filter((p) => p.trim().length > 0);
  const hasImage = Boolean(imageSrc?.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-foreground/25 backdrop-blur-[2px]"
        className={cn(
          "flex w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden rounded-[1.5rem] border border-border/70 p-0 shadow-sm",
          "bg-card text-foreground sm:w-[calc(100%-1.5rem)] sm:max-w-2xl",
          "md:max-w-3xl lg:max-w-4xl",
          "max-h-[min(92dvh,52rem)]",
          "[&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:rounded-full [&_[data-slot=dialog-close]]:bg-background/80 [&_[data-slot=dialog-close]]:backdrop-blur-sm sm:[&_[data-slot=dialog-close]]:top-4 sm:[&_[data-slot=dialog-close]]:right-4"
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:grid-rows-[minmax(0,1fr)_auto]">
          {/* Visual panel */}
          <div className="relative min-h-[11rem] w-full overflow-hidden bg-muted sm:min-h-[13rem] lg:min-h-0 lg:row-span-2">
            {hasImage ? (
              <Image
                src={imageSrc}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 42vw"
                unoptimized={shouldUseUnoptimizedImage(imageSrc)}
                priority
              />
            ) : (
              <div
                className="h-full min-h-[inherit] w-full bg-gradient-to-br from-muted via-card to-muted"
                aria-hidden
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_20%_10%,rgba(232,93,4,0.12),transparent_55%)]" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/70 via-background/20 to-transparent p-4 pt-12 lg:from-background/50">
              <div className="flex flex-wrap items-center gap-2">
                {featured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground shadow-sm">
                    <Sparkles className="size-3 text-accent" />
                    Flagship
                  </span>
                ) : null}
                <span className="rounded-full border border-border/70 bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/70 shadow-sm backdrop-blur-sm">
                  {label}
                </span>
              </div>
            </div>
          </div>

          {/* Copy panel */}
          <div className="flex min-h-0 flex-1 flex-col lg:col-start-2 lg:row-start-1">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduce ? 0 : 0.35, ease }}
              className="relative px-5 pb-4 pt-5 sm:px-7 sm:pb-5 sm:pt-6"
              data-lenis-prevent
            >
              <DialogHeader className="gap-0 pr-8 text-left">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Product</p>
                <DialogTitle className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-[1.65rem]">
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-2.5 text-[15px] leading-relaxed text-muted-foreground">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </motion.div>

            <div
              className="relative min-h-0 flex-1 overflow-y-auto px-5 sm:px-7"
              data-lenis-prevent
            >
              <div className="space-y-4 border-t border-border/60 py-5">
                {body.map((p, i) => (
                  <motion.p
                    key={i}
                    className="text-pretty text-[15px] leading-[1.7] text-foreground/80"
                    initial={reduce ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduce ? 0 : 0.28, ease, delay: reduce ? 0 : 0.04 * i }}
                  >
                    {p}
                  </motion.p>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/30 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 lg:col-span-1 lg:col-start-2 lg:row-start-2">
            <Button
              type="button"
              variant="ghost"
              className="h-10 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              {href ? (
                <ProductFooterLink
                  href={href}
                  onNavigate={() => onOpenChange(false)}
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "group h-11 justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:opacity-90 sm:px-6"
                  )}
                >
                  {linkLabel}
                  <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </ProductFooterLink>
              ) : null}
              <Link
                href="#contact"
                onClick={() => onOpenChange(false)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 justify-center gap-2 rounded-full border-border bg-card hover:bg-muted"
                )}
              >
                Start a project
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
