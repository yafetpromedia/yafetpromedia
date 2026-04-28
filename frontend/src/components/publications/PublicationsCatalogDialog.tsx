"use client";

import Image from "next/image";
import { ArrowUpRight, Library } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PublicationCard } from "@/lib/site-content.shared";

const ease = [0.16, 1, 0.3, 1] as const;

export type PublicationsCatalogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  publications: PublicationCard[];
  /** Opens the read popup for this index; catalog closes first */
  onReadPublication: (index: number) => void;
};

function PubThumb({ src }: { src: string }) {
  const has = Boolean(src?.trim());
  if (!has) {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-muted/40"
        aria-hidden
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      className="object-cover object-center"
      sizes="(max-width: 640px) 100vw, 200px"
      unoptimized={/^https?:\/\//i.test(src)}
    />
  );
}

export default function PublicationsCatalogDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  publications,
  onReadPublication,
}: PublicationsCatalogDialogProps) {
  const reduce = useReducedMotion();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        finalFocus={false}
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
            <Library className="size-5" aria-hidden />
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
              {publications.length} {publications.length === 1 ? "publication" : "publications"}
            </p>
          </DialogHeader>
        </div>

        <div
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
          data-lenis-prevent
        >
          <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
            {publications.map((pub, i) => (
              <motion.li
                key={`${pub.title}-${i}`}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.32, ease, delay: reduce ? 0 : 0.04 * i }}
              >
                <button
                  type="button"
                  className="group block w-full rounded-2xl text-left outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={pub.title ? `Read: ${pub.title}` : "Read publication"}
                  onMouseDown={(e) => {
                    if (e.button === 0) e.preventDefault();
                  }}
                  onClick={() => {
                    onReadPublication(i);
                    onOpenChange(false);
                  }}
                >
                  <article
                    className={cn(
                      "flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm",
                      "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
                      "group-hover:border-primary/40 group-hover:bg-primary/[0.03] group-hover:shadow-[0_18px_50px_-28px_rgba(255,106,0,0.2)]"
                    )}
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted/50">
                      <div className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                        <PubThumb src={pub.imageSrc} />
                      </div>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-primary">
                          {pub.category}
                        </span>
                        <div
                          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform duration-200 group-hover:scale-105"
                          aria-hidden
                        >
                          <ArrowUpRight className="size-3.5 text-primary-foreground" />
                        </div>
                      </div>
                      <h3 className="font-display text-base font-bold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary sm:text-lg">
                        {pub.title}
                      </h3>
                      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-[10px] font-mono text-foreground/45 uppercase tracking-widest sm:text-[11px]">
                        <span>{pub.dateLabel}</span>
                        <span className="size-1 rounded-full bg-foreground/25" />
                        <span>{pub.readTime}</span>
                      </div>
                    </div>
                  </article>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative shrink-0 border-t border-border/50 bg-muted/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <p className="text-center text-[11px] text-foreground/45 sm:mr-auto sm:text-left sm:text-xs">
              Choose a piece to open the reader.
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
