"use client";

import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import { Accordion } from "@base-ui/react/accordion";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";

export default function ProcessAndFaq() {
  const { content } = useSiteContent();

  return (
    <SectionWrapper id="process-faq" className="border-t border-border/60 bg-background">
      <div className="mb-10 max-w-2xl text-foreground">
        <FadeIn>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/45">
            {content.processFaqSectionTag}
          </p>
          <h2 className="mb-3 font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            {content.processFaqSectionTitle}
          </h2>
          <p className="text-base leading-relaxed text-foreground/60 md:text-lg">
            {content.processFaqSectionDescription}
          </p>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-8 text-foreground lg:grid-cols-2 lg:gap-10">
        <FadeIn>
          <div className="relative h-full rounded-2xl border border-border bg-card p-7 md:p-8">
            <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.18em] text-foreground/45">
              {content.processFaqProcessCardLabel}
            </p>
            <ul className="space-y-5">
              {content.processSteps.map((step, index) => (
                <li key={`step-${index}`} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-foreground/40" />
                  <span className="text-foreground/70">{step.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="rounded-[2rem] border border-border bg-card p-8 md:p-10 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
                {content.processFaqFaqCardLabel}
              </span>
            </div>
            <Accordion.Root className="space-y-3">
              {content.faqItems.map((faq, index) => (
                <Accordion.Item
                  key={`faq-${index}`}
                  value={`item-${index}`}
                  className="rounded-xl border border-border bg-background/40"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full px-4 py-4 text-left flex items-center justify-between gap-4 font-medium">
                      <span>{faq.question}</span>
                      <ChevronDown className="size-4 text-foreground/60 transition-transform data-[panel-open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel className="px-4 pb-4 text-foreground/65 text-sm leading-relaxed">
                    {faq.answer}
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
