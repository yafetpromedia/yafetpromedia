"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { Quote, Star, PenLine, CheckCircle2 } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import TestimonialSubmitDialog from "@/components/testimonials/TestimonialSubmitDialog";
import { cn } from "@/lib/utils";

type ApprovedTestimonial = {
  quote: string;
  author: string;
  role: string;
  rating: number;
};

export default function TrustSection() {
  const { content } = useSiteContent();
  const [submitOpen, setSubmitOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [approvedTestimonials, setApprovedTestimonials] = useState<ApprovedTestimonial[]>([]);

  const loadApproved = useCallback(() => {
    fetch("/api/testimonials/approved")
      .then((res) => res.json())
      .then((data: { testimonials?: ApprovedTestimonial[] }) => {
        if (Array.isArray(data.testimonials)) setApprovedTestimonials(data.testimonials);
      })
      .catch(() => setApprovedTestimonials([]));
  }, []);

  useEffect(() => {
    loadApproved();
  }, [loadApproved]);

  useEffect(() => {
    if (!showSuccessToast) return;
    const hide = window.setTimeout(() => setShowSuccessToast(false), 4500);
    return () => window.clearTimeout(hide);
  }, [showSuccessToast]);

  const baseLogos = content.trustLogoItems.filter((l) => l.imageSrc.trim() || l.name.trim());
  const marqueeLogos = baseLogos.length > 0 ? [...baseLogos, ...baseLogos] : [];

  return (
    <SectionWrapper id="trust" className="bg-background border-t border-border pt-32 pb-32">
      <div className="text-center max-w-3xl mx-auto mb-12 text-foreground">
        <FadeIn>
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-[1px] w-8 bg-primary" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">{content.trustSectionTag}</span>
            <div className="h-[1px] w-8 bg-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
            {content.trustSectionTitle}
          </h2>
        </FadeIn>
      </div>

      {marqueeLogos.length > 0 ? (
        <FadeIn className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 py-5">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
            <div className="flex min-w-max animate-[marquee_26s_linear_infinite]">
              {marqueeLogos.map((logo, index) => (
                <div
                  key={`${logo.name}-${logo.imageSrc}-${index}`}
                  className="mx-3 inline-flex h-12 max-w-[12rem] shrink-0 items-center justify-center rounded-full border border-border bg-background px-6 sm:h-14 sm:max-w-[14rem]"
                >
                  {logo.imageSrc.trim() ? (
                    <Image
                      src={logo.imageSrc}
                      alt={logo.name ? `${logo.name} logo` : "Partner logo"}
                      width={176}
                      height={48}
                      className="h-8 w-auto max-h-9 max-w-[10rem] object-contain object-center sm:max-h-10 sm:max-w-[12rem]"
                      unoptimized={shouldUseUnoptimizedImage(logo.imageSrc)}
                    />
                  ) : (
                    <span className="text-center text-xs font-mono uppercase tracking-[0.2em] text-foreground/55">
                      {logo.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      ) : null}

      {approvedTestimonials.length === 0 ? (
        <FadeIn>
          <p className="mx-auto max-w-lg py-6 text-center text-sm text-foreground/50">
            Client stories will show here after you approve submissions in the admin Testimonials page.
          </p>
        </FadeIn>
      ) : (
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {approvedTestimonials.map((item, index) => {
            const stars = Math.min(5, Math.max(1, Math.round(item.rating)));
            return (
              <FadeIn key={`${item.author}-${index}`} delay={index * 0.08}>
                <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-4 text-foreground transition-colors hover:border-primary/25">
                  <Quote className="pointer-events-none absolute top-3 right-3 size-5 text-foreground/[0.08]" aria-hidden />

                  <div className="mb-2 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "size-2.5",
                          star <= stars ? "fill-primary text-primary" : "text-foreground/15"
                        )}
                      />
                    ))}
                  </div>

                  <p
                    className="relative z-[1] line-clamp-4 text-sm leading-snug text-foreground/75"
                    title={item.quote}
                  >
                    &quot;{item.quote}&quot;
                  </p>

                  <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-foreground/[0.04] font-display text-[11px] font-bold text-foreground/45">
                      {item.author.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-foreground">{item.author}</h4>
                      <p className="truncate text-[10px] font-mono uppercase tracking-[0.16em] text-primary">{item.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}

      <FadeIn className="mt-10">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3 text-center">
          <p className="text-sm text-foreground/55">
            Worked with us? Share a short testimonial and rating — we review submissions before they may appear here.
          </p>
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-6 text-sm font-semibold text-primary transition hover:bg-primary/15"
          >
            <PenLine className="size-4" />
            Submit your testimonial
          </button>
        </div>
      </FadeIn>

      <TestimonialSubmitDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        onSubmitted={() => {
          setShowSuccessToast(true);
          loadApproved();
        }}
      />

      {showSuccessToast ? (
        <div
          role="status"
          aria-live="polite"
          className="animate-in fade-in slide-in-from-bottom-4 fixed bottom-6 left-1/2 z-[200] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-2xl border border-emerald-500/25 bg-card px-4 py-3 shadow-[0_18px_50px_-24px_rgba(0,0,0,0.35)] duration-300 ring-1 ring-emerald-500/10 sm:bottom-8"
        >
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Testimonial sent</p>
            <p className="mt-0.5 text-sm text-foreground/65">Thank you — we&apos;ll review it and may feature it on the site.</p>
          </div>
        </div>
      ) : null}
    </SectionWrapper>
  );
}
