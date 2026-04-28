"use client";

import Image from "next/image";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
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
import type { ProductCard } from "@/lib/site-content.shared";

const ease = [0.16, 1, 0.3, 1] as const;

export type ProductsCatalogDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Section heading inside the modal */
  title: string;
  subtitle?: string;
  products: ProductCard[];
  onPickProduct: (index: number) => void;
};

function CatalogThumb({ src }: { src: string }) {
  const has = Boolean(src?.trim());
  if (!has) {
    return (
      <div
        className="h-full w-full bg-gradient-to-br from-primary/25 via-primary/5 to-muted/40"
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
      sizes="(max-width: 640px) 100vw, 180px"
      unoptimized={/^https?:\/\//i.test(src)}
    />
  );
}

export default function ProductsCatalogDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  products,
  onPickProduct,
}: ProductsCatalogDialogProps) {
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
        {/* Ambient accents */}
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
            <LayoutGrid className="size-5" aria-hidden />
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
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </DialogHeader>
        </div>

        <div
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5"
          data-lenis-prevent
        >
          <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
            {products.map((p, i) => (
              <motion.li
                key={`${p.title}-${i}`}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduce ? 0 : 0.35, ease, delay: reduce ? 0 : 0.04 * i }}
              >
                <button
                  type="button"
                  onClick={() => {
                    onPickProduct(i);
                    onOpenChange(false);
                  }}
                  className={cn(
                    "group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/40 text-left",
                    "shadow-sm transition duration-300",
                    "hover:-translate-y-0.5 hover:border-primary/45 hover:bg-card/80 hover:shadow-[0_20px_50px_-28px_rgba(0,0,0,0.35)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    p.featured && "ring-1 ring-primary/30"
                  )}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/60">
                    <CatalogThumb src={p.imageSrc} />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/5 to-transparent" />
                    {p.featured && (
                      <span className="absolute bottom-2 left-2 rounded-md bg-primary px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20">
                        Flagship
                      </span>
                    )}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col p-3.5 sm:p-4">
                    <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.16em] text-primary">
                      {p.label}
                    </p>
                    <p className="mt-1 font-display text-base font-bold leading-tight text-foreground transition group-hover:text-primary sm:text-lg">
                      {p.title}
                    </p>
                    <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-foreground/60 sm:text-sm">
                      {p.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary sm:text-sm">
                      Open details
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:size-4" />
                    </span>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="relative shrink-0 border-t border-border/50 bg-muted/10 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex flex-col items-stretch justify-end gap-2.5 sm:flex-row sm:items-center">
            <p className="text-center text-[11px] text-foreground/45 sm:mr-auto sm:text-left sm:text-xs">
              Select a product to read the full story and primary actions.
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
