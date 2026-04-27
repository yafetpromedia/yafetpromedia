"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
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
import type { PublicationCard } from "@/lib/site-content.shared";

const ease = [0.16, 1, 0.3, 1] as const;

function splitArticleBody(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  return t
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

export type PublicationReadDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publication: PublicationCard | null;
};

export default function PublicationReadDialog({
  open,
  onOpenChange,
  publication,
}: PublicationReadDialogProps) {
  const reduce = useReducedMotion();
  if (!publication) return null;

  const paragraphs = splitArticleBody(publication.articleBody);
  const hasImage = Boolean(publication.imageSrc?.trim());
  const hasHref = Boolean(publication.href?.trim());
  const external = hasHref && /^https?:\/\//i.test(publication.href);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        finalFocus={false}
        overlayClassName="bg-zinc-950/55 supports-[backdrop-filter]:backdrop-blur-md"
        className={cn(
          "flex w-full max-w-[min(100%-1.5rem,40rem)] flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0",
          "sm:max-w-[min(100%-1.5rem,40rem)]",
          "max-h-[min(92vh,44rem)] bg-background/90 supports-[backdrop-filter]:backdrop-blur-2xl",
          "shadow-[0_28px_80px_-32px_rgba(0,0,0,0.5)] ring-1 ring-primary/15",
          "[&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3"
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-8 top-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
          aria-hidden
        />

        <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-44">
          {hasImage ? (
            <>
              <Image
                src={publication.imageSrc}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 40rem"
                unoptimized={/^https?:\/\//i.test(publication.imageSrc)}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/35 to-transparent" />
            </>
          ) : (
            <div
              className="h-full w-full bg-gradient-to-br from-primary/20 via-primary/5 to-muted/40"
              aria-hidden
            />
          )}
          <div className="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-primary backdrop-blur-sm">
              {publication.category}
            </span>
          </div>
        </div>

        <div className="shrink-0 border-b border-border/50 px-5 pb-4 pt-4 sm:px-6">
          <DialogHeader className="gap-1 text-left">
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {publication.title}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono uppercase tracking-widest text-foreground/45">
              {publication.dateLabel} · {publication.readTime}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
          data-lenis-prevent
        >
          {paragraphs.length > 0 ? (
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  className="text-pretty text-[15px] leading-[1.72] text-foreground/85"
                  initial={reduce ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0 : 0.25, ease, delay: reduce ? 0 : 0.03 * i }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-foreground/55">
              Add the full article in Admin → Publications → “Article (popup)”.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-border/60 bg-muted/15 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          {hasHref ? (
            external ? (
              <a
                href={publication.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "h-10 gap-2 rounded-full border-border/80"
                )}
                onClick={() => onOpenChange(false)}
              >
                Original link
                <ArrowUpRight className="size-4" />
              </a>
            ) : (
              <Link
                href={publication.href}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "h-10 gap-2 rounded-full border-border/80"
                )}
                onClick={() => onOpenChange(false)}
              >
                Original link
                <ArrowUpRight className="size-4" />
              </Link>
            )
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
