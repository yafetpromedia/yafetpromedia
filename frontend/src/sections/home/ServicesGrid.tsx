"use client";

import { useState } from "react";
import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import ServiceLearnMoreDialog from "@/components/services/ServiceLearnMoreDialog";
import {
  ArrowUpRight,
  Box,
  Cpu,
  Globe,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";

const serviceIcons = [Globe, Layers, Rocket, ShieldCheck, Sparkles, Zap, Box, Cpu];

export default function ServicesGrid() {
  const { content } = useSiteContent();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const services = content.servicesCards.map((service, index) => ({
    ...service,
    icon: serviceIcons[index] ?? Globe,
  }));

  return (
    <SectionWrapper id="services" className="border-t border-border/60 bg-background">
      <div className="mb-12 max-w-3xl text-foreground">
        <FadeIn>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
            {content.servicesSectionTag}
          </p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
            {content.servicesSectionTitle}
          </h2>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {services.map((service, index) => (
          <FadeIn key={`svc-${index}`} delay={index * 0.06}>
            <article className="group relative h-full overflow-hidden border-t border-border/70 pt-8 text-foreground transition-colors duration-300 hover:border-t-foreground/35">
              <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-muted text-foreground/70">
                <service.icon className="size-5" />
              </div>
              <h3 className="mb-3 font-display text-2xl font-semibold tracking-tight">
                {service.title}
              </h3>
              <p className="leading-relaxed text-foreground/60">{service.description}</p>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="mt-7 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground/50 transition-colors hover:text-foreground group-hover:text-foreground"
              >
                Learn more <ArrowUpRight className="size-4" />
              </button>
            </article>
          </FadeIn>
        ))}
      </div>

      {openIndex !== null && (
        <ServiceLearnMoreDialog
          open
          onOpenChange={(o) => {
            if (!o) setOpenIndex(null);
          }}
          title={services[openIndex].title}
          description={services[openIndex].description}
          learnMore={services[openIndex].learnMore}
          icon={services[openIndex].icon}
        />
      )}
    </SectionWrapper>
  );
}
