"use client";

import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import { Globe, Layers, Rocket, ShieldCheck } from "lucide-react";

const services = [
  {
    title: "Website & Product Design",
    description:
      "Conversion-focused websites and interfaces designed to reflect your brand and move visitors to action.",
    icon: Globe,
  },
  {
    title: "Automation & Workflows",
    description:
      "Smart internal systems that automate repetitive operations and keep teams aligned in real time.",
    icon: Layers,
  },
  {
    title: "Growth Strategy",
    description:
      "Data-backed campaigns, content systems, and funnels built to scale customer acquisition reliably.",
    icon: Rocket,
  },
  {
    title: "Security & Reliability",
    description:
      "Stable, secure delivery standards with monitoring and performance practices for business-critical systems.",
    icon: ShieldCheck,
  },
];

export default function ServicesGrid() {
  return (
    <SectionWrapper id="services" className="bg-background border-t border-border pt-28">
      <div className="max-w-3xl mb-14 text-foreground">
        <FadeIn>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-[1px] w-8 bg-primary" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
              What We Do
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight">
            Modern digital systems for real business growth.
          </h2>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <FadeIn key={service.title} delay={index * 0.08}>
            <article className="group rounded-[1.75rem] border border-border bg-card p-8 md:p-10 hover:border-primary/40 hover:bg-card/80 transition-all duration-500 text-foreground h-full">
              <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 group-hover:scale-105 transition-transform">
                <service.icon className="size-5 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">{service.title}</h3>
              <p className="text-foreground/65 leading-relaxed">{service.description}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
