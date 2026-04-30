"use client";

import Link from "next/link";
import { Ban, CheckCircle2, Inbox, MessageSquareQuote, Shield, Sparkles, Trash2 } from "lucide-react";
import type { TestimonialSubmission } from "@/app/admin/types";
import TestimonialSubmissionsPanel from "@/app/admin/components/TestimonialSubmissionsPanel";
import { cn } from "@/lib/utils";

type Props = { initialTestimonialSubmissions: TestimonialSubmission[] };

const workflowCard =
  "rounded-2xl border border-white/[0.07] bg-gradient-to-b from-card/95 to-card/75 p-4 shadow-sm ring-1 ring-black/[0.04] dark:from-card/[0.92] dark:to-card/55";

export default function AdminTestimonialsSection({ initialTestimonialSubmissions }: Props) {
  const count = initialTestimonialSubmissions.length;

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-rose-500/[0.08] via-card/92 to-amber-500/[0.07] p-6 shadow-[0_28px_80px_-44px_rgba(251,113,133,0.28)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-rose-400/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-amber-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-800 ring-1 ring-rose-500/28 dark:text-rose-400">
              <MessageSquareQuote className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-800/95 dark:text-rose-400/95">
                Homepage · Social proof
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Testimonial inbox
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Visitors submit quotes from the homepage form—approve what appears on the Trust section with their star
                rating. Heading and logos stay editable under Trust.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <Inbox className="size-3.5 text-rose-600/85 dark:text-rose-400/90" />
            {count} in queue / live
          </div>
        </div>
      </div>

      {/* Workflow */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <Shield className="size-4 text-rose-600/85 dark:text-rose-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Moderation workflow</h4>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={cn(workflowCard, "border-emerald-500/15 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.06]")}>
            <div className="mb-2 flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="size-5 shrink-0" />
              <span className="text-sm font-semibold">Approve</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/65">
              Publishes the quote to the Trust section with the rating the visitor selected.
            </p>
          </div>
          <div className={cn(workflowCard, "border-amber-500/18 bg-amber-500/[0.05] dark:bg-amber-500/[0.07]")}>
            <div className="mb-2 flex items-center gap-2 text-amber-950 dark:text-amber-200">
              <Ban className="size-5 shrink-0" />
              <span className="text-sm font-semibold">Reject / unpublish</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/65">
              Reject or unpublish hides quotes from the site but keeps them here until you delete them; you can publish
              again anytime.
            </p>
          </div>
          <div className={cn(workflowCard, "border-red-500/15 bg-red-500/[0.04] dark:bg-red-500/[0.06]")}>
            <div className="mb-2 flex items-center gap-2 text-red-800 dark:text-red-400">
              <Trash2 className="size-5 shrink-0" />
              <span className="text-sm font-semibold">Delete</span>
            </div>
            <p className="text-sm leading-relaxed text-foreground/65">
              Permanently removes the database row—use when you truly don&apos;t need the record.
            </p>
          </div>
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-1.5 text-sm text-foreground/60">
          <Sparkles className="size-4 shrink-0 text-primary/80" />
          Edit the Trust section headline and partner marquee under{" "}
          <Link href="/admin/trust" className="font-semibold text-primary underline-offset-4 hover:underline">
            Trust
          </Link>
          .
        </p>
      </section>

      {/* Panel */}
      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Submissions
            </p>
            <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Inbox &amp; live</h4>
            <p className="mt-1 max-w-xl text-sm text-foreground/52">
              Pending items show approve/reject; live items can be unpublished (listed as unpublished until you delete).
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.06] bg-card/40 p-4 shadow-inner backdrop-blur-sm dark:bg-card/25 sm:p-6">
          <TestimonialSubmissionsPanel submissions={initialTestimonialSubmissions} />
        </div>
      </section>
    </div>
  );
}
