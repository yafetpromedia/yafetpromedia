"use client";

import { useState } from "react";
import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import ServiceLearnMoreDialog from "@/components/services/ServiceLearnMoreDialog";
import { Globe, Layers, Rocket, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";

const serviceIcons = [Globe, Layers, Rocket, ShieldCheck];

export default function ServicesGrid() {
  const { content } = useSiteContent();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const services = content.servicesCards.map((service, index) => ({
    ...service,
    icon: serviceIcons[index] ?? Globe,
  }));

  return (
    <SectionWrapper id="services" className="bg-background border-t border-border pt-28">
      <div className="max-w-4xl mb-14 text-foreground">
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-[1px] w-8 bg-primary" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
              {content.servicesSectionTag}
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight">
            {content.servicesSectionTitle}
          </h2>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <FadeIn key={service.title} delay={index * 0.08}>
            <article className="group relative rounded-[1.75rem] border border-border bg-card p-8 md:p-10 hover:border-primary/40 hover:bg-card/90 transition-all duration-500 text-foreground h-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent group-hover:from-primary/10 transition-colors duration-700 pointer-events-none" />
              <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                <service.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 group-hover:text-primary transition-colors">{service.title}</h3>
              <p className="text-foreground/65 leading-relaxed">{service.description}</p>
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground/55 group-hover:text-primary transition-colors cursor-pointer"
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
