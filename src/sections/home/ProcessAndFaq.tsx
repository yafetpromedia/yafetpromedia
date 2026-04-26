"use client";

import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import { Accordion } from "@base-ui/react/accordion";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";

export default function ProcessAndFaq() {
  const { content } = useSiteContent();

  return (
    <SectionWrapper id="process-faq" className="bg-background border-t border-border pt-28">
      <div className="max-w-3xl mb-10 text-foreground">
        <FadeIn>
          <div className="flex items-center gap-2 mb-5">
            <div className="h-[1px] w-8 bg-primary" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
              {content.processFaqSectionTag}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-4 leading-tight">
            {content.processFaqSectionTitle}
          </h2>
          <p className="text-foreground/60 text-lg leading-relaxed font-light">
            {content.processFaqSectionDescription}
          </p>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 text-foreground">
        <FadeIn>
          <div className="rounded-[2rem] border border-border bg-card p-8 md:p-10 h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent group-hover:from-primary/5 transition-colors duration-700 pointer-events-none" />
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
                Process
              </span>
            </div>
            <ul className="space-y-5">
              {content.processSteps.map((step, index) => (
                <li key={`${step.text}-${index}`} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
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
                FAQ
              </span>
            </div>
            <Accordion.Root className="space-y-3">
              {content.faqItems.map((faq, index) => (
                <Accordion.Item
                  key={faq.question}
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
