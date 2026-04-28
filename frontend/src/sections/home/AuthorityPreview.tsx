"use client";

import { useState } from "react";
import Image from "next/image";
import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import PublicationsCatalogDialog from "@/components/publications/PublicationsCatalogDialog";
import PublicationReadDialog from "@/components/publications/PublicationReadDialog";
import type { PublicationCard } from "@/lib/site-content.shared";
import { cn } from "@/lib/utils";

const LANDING_PUBLICATIONS_LIMIT = 3;

function PublicationCardView({
  item,
  onRead,
}: {
  item: PublicationCard;
  onRead: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRead}
      onMouseDown={(e) => {
        if (e.button === 0) e.preventDefault();
      }}
      className={cn(
        "group flex w-full flex-col rounded-[2rem] border border-border bg-card p-8 text-left shadow-sm outline-none",
        "cursor-pointer transition-[border-color,box-shadow,background-color] duration-200 ease-out",
        "hover:border-primary/40 hover:bg-primary/[0.03] hover:shadow-[0_18px_50px_-28px_rgba(255,106,0,0.2)]",
        "focus:outline-none focus:ring-0 focus:ring-offset-0",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
      aria-label={item.title ? `Read: ${item.title}` : "Read publication"}
    >
      {item.imageSrc?.trim() ? (
        <div className="relative -mx-8 -mt-8 mb-6 aspect-[16/9] w-[calc(100%+4rem)] overflow-hidden rounded-t-[2rem]">
          <Image
            src={item.imageSrc}
            alt=""
            fill
            className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={/^https?:\/\//i.test(item.imageSrc)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-12">
        <span className="px-3 py-1.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-[10px] font-mono font-semibold uppercase tracking-widest">
          {item.category}
        </span>
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/25 transition-transform duration-200 ease-out group-hover:scale-105"
          aria-hidden
        >
          <ArrowUpRight className="size-[1.15rem] text-primary-foreground" />
        </div>
      </div>

      <div className="mt-auto">
        <h3 className="text-xl md:text-2xl font-display font-bold leading-tight mb-6 text-foreground transition-colors duration-200 group-hover:text-primary">
          {item.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-foreground/45 uppercase tracking-widest">
          <span>{item.dateLabel}</span>
          <span className="size-1 shrink-0 rounded-full bg-foreground/25" />
          <span>{item.readTime}</span>
        </div>
      </div>
    </button>
  );
}

export default function AuthorityPreview() {
  const { content } = useSiteContent();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [readIndex, setReadIndex] = useState<number | null>(null);
  const landing = content.publicationsCards.slice(0, LANDING_PUBLICATIONS_LIMIT);
  const hasMore = content.publicationsCards.length > LANDING_PUBLICATIONS_LIMIT;

  const readPublication = readIndex !== null ? content.publicationsCards[readIndex] ?? null : null;

  return (
    <SectionWrapper id="insights" className="bg-background border-t border-border pt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-foreground">
        <div className="max-w-2xl">
          <FadeIn>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
                {content.publicationsSectionTag}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
              {content.publicationsSectionTitle}
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed font-light">
              {content.publicationsSectionDescription}
            </p>
          </FadeIn>
        </div>
        {hasMore && content.publicationsCatalogCtaLabel.trim() ? (
          <FadeIn delay={0.2} className="shrink-0">
            <button
              type="button"
              onClick={() => setCatalogOpen(true)}
              className="inline-flex items-center gap-2 border-b border-border pb-2 text-left text-sm font-bold uppercase tracking-wider text-foreground"
            >
              {content.publicationsCatalogCtaLabel}
              <ArrowUpRight className="size-4" />
            </button>
          </FadeIn>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {landing.map((item, index) => (
          <FadeIn key={`${item.title}-${index}`} delay={index * 0.1}>
            <PublicationCardView item={item} onRead={() => setReadIndex(index)} />
          </FadeIn>
        ))}
      </div>

      <PublicationsCatalogDialog
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        title={content.publicationsSectionTitle}
        subtitle={content.publicationsSectionDescription}
        publications={content.publicationsCards}
        onReadPublication={(i) => setReadIndex(i)}
      />

      <PublicationReadDialog
        open={readIndex !== null}
        onOpenChange={(o) => {
          if (!o) setReadIndex(null);
        }}
        publication={readPublication}
      />
    </SectionWrapper>
  );
}
