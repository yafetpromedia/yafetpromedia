"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { Quote, Star } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";

export default function TrustSection() {
  const { content } = useSiteContent();
  const logos = [...content.trustLogoItems, ...content.trustLogoItems];

  return (
    <SectionWrapper id="trust" className="bg-background border-t border-border pt-32 pb-32">
      <div className="text-center max-w-3xl mx-auto mb-20 text-foreground">
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

      <FadeIn className="mb-14">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 py-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          <div className="flex animate-[marquee_26s_linear_infinite] min-w-max">
            {logos.map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                className="mx-3 inline-flex h-10 items-center rounded-full border border-border bg-background px-5 text-xs font-mono uppercase tracking-[0.2em] text-foreground/55"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {content.trustTestimonials.map((item, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <div className="bg-card border border-border p-5 md:p-6 rounded-[1.25rem] relative overflow-hidden group hover:border-primary/30 hover:bg-card/80 transition-all duration-700 h-full flex flex-col text-foreground">
              {/* Abstract decorative elements */}
              <div className="absolute -top-10 -right-10 size-28 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
              <Quote className="absolute top-5 right-5 size-9 text-foreground/5 group-hover:text-primary/10 transition-colors duration-700" />
              
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="size-3 fill-primary text-primary" />
                ))}
              </div>

              <div className="relative z-10 flex-1">
                <p className="text-base md:text-xl text-foreground/80 mb-5 leading-relaxed font-light">
                  &quot;{item.quote}&quot;
                </p>
                
                <div className="mt-auto flex items-center gap-3">
                  <div className="size-8 rounded-full bg-foreground/5 border border-border flex items-center justify-center font-display font-bold text-xs text-foreground/40">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-foreground font-bold text-sm">{item.author}</h4>
                    <p className="text-primary text-[10px] font-mono uppercase tracking-[0.18em] mt-0.5">{item.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
