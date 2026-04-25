"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/animations/FadeIn";
import { ArrowRight, Terminal } from "lucide-react";

export default function CTASection() {
  return (
    <SectionWrapper id="cta" className="pb-32 bg-background">
      <div className="relative rounded-[3rem] border border-border bg-card p-12 md:p-24 overflow-hidden text-center group">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-[radial-gradient(ellipse_at_center,var(--color-primary),transparent_70%)] pointer-events-none group-hover:opacity-20 opacity-10 transition-opacity duration-1000" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-foreground">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] font-mono tracking-widest uppercase border border-primary/20 rounded-full bg-primary/5 text-primary backdrop-blur-md">
              <Terminal className="size-3" />
              Ready to deploy
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-8 leading-tight tracking-tight">
              Build your complete <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff9b4d]">digital system.</span>
            </h2>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-foreground/60 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              Partner with us to design the infrastructure that will power 
              your organization&apos;s growth for years to come.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_rgba(255,106,0,0.3)] hover:shadow-[0_0_60px_rgba(255,106,0,0.5)] transition-all duration-300 group/btn">
                Start a Project
                <ArrowRight className="ml-2 size-5 transition-transform group-hover/btn:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 text-lg font-bold rounded-full border-border text-foreground hover:bg-foreground/5 backdrop-blur-md transition-colors duration-300">
                Contact Sales
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </SectionWrapper>
  );
}
