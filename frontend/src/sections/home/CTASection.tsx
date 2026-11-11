"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { ArrowRight, PhoneCall } from "lucide-react";
import Link from "next/link";

export default function CTASection() {
  return (
    <SectionWrapper id="cta" className="bg-background pb-28 pt-8">
      <div className="mx-auto max-w-3xl text-center">
        <FadeIn>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Ready to build with Awud Digitals?
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-foreground/60 md:text-lg">
            Tell us what you need — we&apos;ll map scope, timeline, and the right next step.
          </p>
        </FadeIn>
        <FadeIn delay={0.12}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#contact"
              className="group inline-flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Send a request
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#book-call"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border px-8 text-sm font-semibold text-foreground transition-colors hover:bg-muted/50 sm:w-auto"
            >
              <PhoneCall className="size-4" />
              Book a call
            </Link>
          </div>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
