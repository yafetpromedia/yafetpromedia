"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, PhoneCall } from "lucide-react";
import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import { useSiteContent } from "@/components/common/SiteContentProvider";

/** Compact booking strip — one calendar action or a handoff to Contact (no second form). */
export default function BookCallSection() {
  const { content } = useSiteContent();
  const bookingUrl = (content.bookingUrl ?? "").trim();

  const embedUrl = useMemo(() => {
    if (!bookingUrl) return "";
    try {
      new URL(bookingUrl);
      return bookingUrl;
    } catch {
      return "";
    }
  }, [bookingUrl]);

  return (
    <SectionWrapper id="book-call" className="relative z-10 border-t border-border/60 bg-background">
      <FadeIn>
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div className="max-w-xl">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/45">
              Book a call
            </p>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Talk with Awud Digitals
            </h2>
            <p className="mt-3 text-base leading-relaxed text-foreground/60">{content.bookingBlurb}</p>
            <ul className="mt-5 space-y-2 text-sm text-foreground/65">
              <li className="flex gap-2.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" />
                20–30 minute discovery call
              </li>
              <li className="flex gap-2.5">
                <CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" />
                Scope, timeline, and clear next steps
              </li>
            </ul>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:min-w-[220px]">
            {embedUrl ? (
              <a
                href={embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
              >
                Open calendar
                <ExternalLink className="size-4" />
              </a>
            ) : (
              <Link
                href="#contact"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <PhoneCall className="size-4" />
                Request a call
              </Link>
            )}
            <p className="text-center text-xs text-foreground/45 sm:text-left">
              Or write {content.contactEmail}
            </p>
          </div>
        </div>
      </FadeIn>
    </SectionWrapper>
  );
}
