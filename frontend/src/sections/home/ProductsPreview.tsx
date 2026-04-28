"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import ProductLearnMoreDialog from "@/components/products/ProductLearnMoreDialog";
import ProductsCatalogDialog from "@/components/products/ProductsCatalogDialog";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { cn } from "@/lib/utils";
import type { ProductCard } from "@/lib/site-content.shared";

/** Shown on the home products section; additional products are only in “Explore all”. */
const LANDING_PRODUCTS_LIMIT = 4;

type ProductWithMeta = ProductCard & { id: string; originalIndex: number };

function ProductCtaLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!href.trim()) return null;
  const external = /^https?:\/\//i.test(href);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function ProductImage({ src, className, priority }: { src: string; className?: string; priority?: boolean }) {
  const has = Boolean(src?.trim());
  if (!has) {
    return (
      <div
        className={cn(
          "relative flex h-full w-full items-end justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-muted/30",
          className
        )}
        aria-hidden
      >
        <div className="h-32 w-32 rounded-3xl bg-primary/10 blur-2xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,106,0,0.2),transparent_55%)]" />
      </div>
    );
  }
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 40vw"
        className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
        unoptimized={/^https?:\/\//i.test(src)}
        priority={priority}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
    </div>
  );
}

function ProductCardBlock({
  card,
  index,
  onLearnMore,
  className,
}: {
  card: ProductWithMeta;
  index: number;
  onLearnMore: () => void;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/80 text-foreground shadow-sm transition duration-500",
        "hover:border-primary/35 hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.2)]",
        "supports-[backdrop-filter]:backdrop-blur-sm",
        className
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[5/3]">
        <div className="absolute inset-0">
          <ProductImage src={card.imageSrc} priority={index < 2} />
        </div>
        <div className="absolute left-3 top-3 z-10">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-background/80 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-foreground/80 backdrop-blur-md">
            {card.label}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h4 className="mb-2 font-display text-lg font-bold tracking-tight text-foreground transition group-hover:text-primary md:text-xl">
          {card.title}
        </h4>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/65">{card.description}</p>
        <div className="mt-auto">
          <button
            type="button"
            onClick={onLearnMore}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2"
          >
            Learn more
            <ArrowUpRight className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductsPreview() {
  const { content } = useSiteContent();
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const allWithIds: ProductWithMeta[] = content.productsCards.map((c, i) => ({
    ...c,
    id: `${c.title}-${i}`,
    originalIndex: i,
  }));
  const landingCards = allWithIds.slice(0, LANDING_PRODUCTS_LIMIT);
  const featuredIdxInLanding = landingCards.findIndex((c) => c.featured);
  const featured = featuredIdxInLanding >= 0 ? landingCards[featuredIdxInLanding]! : null;
  const rest =
    featuredIdxInLanding >= 0
      ? landingCards.filter((_, i) => i !== featuredIdxInLanding)
      : landingCards;
  const hasMoreInCatalog = content.productsCards.length > LANDING_PRODUCTS_LIMIT;
  const dialogProduct = dialogIndex !== null ? allWithIds[dialogIndex] : undefined;

  return (
    <SectionWrapper id="products" className="overflow-hidden bg-background">
      <div className="relative">
        <div
          className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/[0.07] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-primary/[0.05] blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 mb-10 flex flex-col gap-8 text-foreground md:flex-row md:items-end md:justify-between">
          <FadeIn className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-foreground/70">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              {content.productsSectionTag}
            </div>
            <h3 className="text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-4xl lg:text-5xl">
              {content.productsSectionTitle}
            </h3>
            {content.productsSectionDescription ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/60 md:text-lg">
                {content.productsSectionDescription}
              </p>
            ) : null}
          </FadeIn>
          {hasMoreInCatalog && content.productsCatalogCtaLabel.trim() ? (
            <FadeIn delay={0.12} className="shrink-0">
              <button
                type="button"
                onClick={() => setCatalogOpen(true)}
                className="group inline-flex items-center gap-2 border-b border-border pb-2 text-left text-sm font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {content.productsCatalogCtaLabel}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </FadeIn>
          ) : null}
        </div>

        {featured && (
          <FadeIn delay={0.06} className="relative z-10 mb-6">
            <div className="group relative overflow-hidden rounded-[1.5rem] border border-primary/20 bg-gradient-to-br from-card via-card to-primary/[0.06] shadow-[0_24px_60px_-28px_rgba(255,106,0,0.25)] ring-1 ring-primary/10">
              <div className="grid gap-0 md:grid-cols-12 md:items-stretch">
                <div className="relative min-h-[220px] md:col-span-5">
                  <div className="absolute inset-0 min-h-[220px] md:min-h-full">
                    <ProductImage src={featured.imageSrc} priority />
                  </div>
                  <div className="absolute left-4 top-4 z-10 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                      <Sparkles className="size-3.5" />
                      Flagship
                    </span>
                    <span className="rounded-full border border-white/20 bg-background/75 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-foreground/80 backdrop-blur-md">
                      {featured.label}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-7">
                  <h4 className="mb-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {featured.title}
                  </h4>
                  <p className="mb-6 text-[15px] leading-relaxed text-foreground/70 sm:text-base">{featured.description}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDialogIndex(featured.originalIndex)}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-5 py-2.5 text-sm font-semibold text-foreground/80 backdrop-blur-sm transition hover:border-primary/40 hover:text-primary"
                    >
                      Learn more
                      <ArrowUpRight className="size-4" />
                    </button>
                    {featured.href ? (
                      <ProductCtaLink
                        href={featured.href}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
                      >
                        {featured.linkLabel}
                        <ArrowUpRight className="size-4" />
                      </ProductCtaLink>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((card, index) => (
            <FadeIn key={card.id} delay={0.04 * index}>
              <ProductCardBlock
                card={card}
                index={index}
                onLearnMore={() => setDialogIndex(card.originalIndex)}
              />
            </FadeIn>
          ))}
        </div>

        <ProductsCatalogDialog
          open={catalogOpen}
          onOpenChange={setCatalogOpen}
          title={content.productsSectionTitle}
          subtitle={content.productsSectionDescription || undefined}
          products={content.productsCards}
          onPickProduct={(i) => setDialogIndex(i)}
        />

        {dialogProduct ? (
          <ProductLearnMoreDialog
            open={dialogIndex !== null}
            onOpenChange={(o) => {
              if (!o) setDialogIndex(null);
            }}
            title={dialogProduct.title}
            description={dialogProduct.description}
            learnMore={dialogProduct.learnMore}
            label={dialogProduct.label}
            imageSrc={dialogProduct.imageSrc}
            href={dialogProduct.href}
            linkLabel={dialogProduct.linkLabel}
            featured={dialogProduct.featured === true}
          />
        ) : null}
      </div>
    </SectionWrapper>
  );
}
