"use client";

import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import { Accordion } from "@base-ui/react/accordion";
import { CheckCircle2, ChevronDown } from "lucide-react";

const steps = [
  "Discovery call and business goals mapping",
  "UX, brand direction, and system architecture",
  "Rapid implementation with weekly checkpoints",
  "Launch, analytics setup, and optimization cycle",
];

const faqs = [
  {
    q: "How long does a typical project take?",
    a: "Most projects launch in 3-8 weeks depending on scope, integrations, and required content.",
  },
  {
    q: "Can you redesign our current website?",
    a: "Yes. We can modernize your existing site, preserve SEO value, and improve speed and conversion.",
  },
  {
    q: "Do you provide ongoing support after launch?",
    a: "Yes. We offer monthly support for updates, analytics reviews, and growth-focused improvements.",
  },
];

export default function ProcessAndFaq() {
  return (
    <SectionWrapper id="process" className="bg-background border-t border-border pt-28">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 text-foreground">
        <FadeIn>
          <div className="rounded-[2rem] border border-border bg-card p-8 md:p-10 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
                Process
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-8">
              A clear process from idea to launch.
            </h3>
            <ul className="space-y-5">
              {steps.map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/70">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div id="faq" className="rounded-[2rem] border border-border bg-card p-8 md:p-10 h-full">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
                FAQ
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-8">
              Answers to common questions.
            </h3>

            <Accordion.Root className="space-y-3">
              {faqs.map((faq, index) => (
                <Accordion.Item
                  key={faq.q}
                  value={`item-${index}`}
                  className="rounded-xl border border-border bg-background/40"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full px-4 py-4 text-left flex items-center justify-between gap-4 font-medium">
                      <span>{faq.q}</span>
                      <ChevronDown className="size-4 text-foreground/60 transition-transform data-[panel-open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel className="px-4 pb-4 text-foreground/65 text-sm leading-relaxed">
                    {faq.a}
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
