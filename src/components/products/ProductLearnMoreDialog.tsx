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
        overlayClassName="bg-zinc-950/50 supports-[backdrop-filter]:backdrop-blur-[6px]"
        className={cn(
          "w-[min(100%-1.25rem,30rem)] gap-0 overflow-hidden rounded-[1.35rem] border-0 p-0",
          "shadow-[0_24px_80px_-24px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)]",
          "bg-background/80 supports-[backdrop-filter]:backdrop-blur-2xl dark:bg-background/55",
          "ring-1 ring-primary/[0.14] dark:ring-primary/20",
          "sm:max-w-md md:max-w-[32rem]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-6 top-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/80 to-transparent opacity-90"
          aria-hidden
        />

        {/* Hero strip: product image or gradient */}
        <div className="relative h-36 w-full overflow-hidden sm:h-40">
          {hasImage ? (
            <>
              <Image
                src={imageSrc}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 32rem"
                unoptimized={/^https?:\/\//i.test(imageSrc)}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            </>
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-primary/25 via-primary/5 to-muted/40"
              aria-hidden
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_20%_0%,rgba(255,106,0,0.3),transparent_55%)]" />
            </div>
          )}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
            {featured && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/20 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-primary backdrop-blur-sm">
                <Sparkles className="size-3" />
                Flagship
              </span>
            )}
            <span className="rounded-full border border-white/20 bg-background/80 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-foreground/85 backdrop-blur-md">
              {label}
            </span>
          </div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease }}
          className="relative border-b border-border/50 bg-gradient-to-br from-primary/[0.08] to-transparent px-6 pb-5 pt-4"
          data-lenis-prevent
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
              maskImage: "radial-gradient(ellipse 100% 100% at 0% 0%, black, transparent 70%)",
            }}
            aria-hidden
          />
          <DialogHeader className="relative z-10 gap-0 text-left">
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-primary/90">Product</p>
            <DialogTitle className="mt-1 font-display text-xl font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-2xl">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-2 text-[15px] leading-relaxed text-foreground/65">
              {description}
            </DialogDescription>
          </DialogHeader>
        </motion.div>

        <div
          className="relative max-h-[min(48vh,20rem)] overflow-y-auto px-6 py-5 sm:max-h-[min(52vh,22rem)]"
          data-lenis-prevent
        >
          <div className="pointer-events-none absolute left-0 top-5 bottom-5 w-px bg-gradient-to-b from-primary/45 via-primary/10 to-transparent opacity-70" />
          <div className="space-y-4 pl-4">
            {body.map((p, i) => (
              <motion.p
                key={i}
                className="text-pretty text-[15px] leading-[1.72] text-foreground/85"
                initial={reduce ? false : { opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.32, ease, delay: reduce ? 0 : 0.04 * i }}
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 bg-gradient-to-b from-muted/15 to-muted/35 px-4 py-3.5 supports-[backdrop-filter]:backdrop-blur-sm sm:flex-row sm:items-stretch sm:justify-between sm:gap-3 sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="h-10 shrink-0 rounded-full text-foreground/60 hover:text-foreground sm:order-1"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <div className="flex flex-col gap-2 sm:order-2 sm:flex-row sm:justify-end">
            {href ? (
              <ProductFooterLink
                href={href}
                onNavigate={() => onOpenChange(false)}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "group h-11 justify-center gap-2 rounded-full border border-primary/25 px-6 text-sm font-semibold shadow-[0_8px_28px_-8px_rgba(255,106,0,0.5)]"
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
                "h-11 justify-center gap-2 rounded-full border-border/80"
              )}
            >
              Start a project
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
