"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/animations/FadeIn";
import { CheckCircle2, Zap, ArrowRight, Activity, Terminal } from "lucide-react";

export default function ProductsPreview() {
  return (
    <SectionWrapper id="products" className="overflow-hidden bg-background">
      <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-16 lg:p-20 relative overflow-hidden text-foreground">
        {/* Deep Glow */}
        <div className="absolute top-0 right-0 w-3/4 h-full bg-[radial-gradient(ellipse_at_top_right,var(--color-primary),transparent_60%)] opacity-10 pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
          <FadeIn direction="right">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-foreground/5 text-[11px] font-mono tracking-widest uppercase text-foreground/70">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Flagship System
              </div>
              
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-[1.1] tracking-tight text-foreground">
                The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ff9b4d]">Modern Scale.</span>
              </h3>
              
              <p className="text-foreground/60 text-lg md:text-xl leading-relaxed font-light">
                Mr.Software is more than a tool—it&apos;s a complete management infrastructure. 
                Streamline operations, track performance, and scale your organization with 
                unprecedented precision.
              </p>
              
              <ul className="space-y-5 pt-4">
                {[
                  "Real-time resource allocation engine",
                  "Automated performance reporting systems",
                  "Secure institutional data vaults",
                  "Cross-department synchronization"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4 text-foreground/80 font-medium">
                    <div className="size-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-3.5 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <div className="pt-8 flex flex-col sm:flex-row items-center gap-4">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 transition-colors group">
                  Deploy System
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full border-border text-foreground hover:bg-foreground/5 transition-colors">
                  Read Documentation
                </Button>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn direction="left" className="relative h-full flex items-center justify-center [perspective:2000px]">
            {/* Layered Abstract UI Elements to represent a complex product */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square md:aspect-[4/3] lg:aspect-[4/5] rounded-3xl border border-border bg-background shadow-2xl flex flex-col overflow-hidden [transform:rotateY(-5deg)] hover:[transform:rotateY(0deg)] transition-transform duration-700 ease-out">
              {/* Fake Window Header */}
              <div className="h-12 border-b border-border bg-foreground/5 flex items-center justify-between px-6">
                <div className="flex gap-2">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-foreground/40">
                  <Terminal className="size-3" /> system_monitor.exe
                </div>
              </div>
              
              {/* UI Mockup Content */}
              <div className="p-6 flex flex-col gap-6 flex-1">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-foreground/5 p-4 flex flex-col gap-2">
                    <Activity className="size-5 text-primary" />
                    <span className="text-2xl font-bold font-mono text-foreground">99.9%</span>
                    <span className="text-[10px] text-foreground/40 uppercase">Uptime</span>
                  </div>
                  <div className="rounded-2xl border border-border bg-foreground/5 p-4 flex flex-col gap-2">
                    <Zap className="size-5 text-primary" />
                    <span className="text-2xl font-bold font-mono text-foreground">1.2ms</span>
                    <span className="text-[10px] text-foreground/40 uppercase">Latency</span>
                  </div>
                </div>
                
                {/* Command Line / Logs */}
                <div className="flex-1 rounded-2xl border border-border bg-background/50 p-4 font-mono text-xs text-primary/80 flex flex-col gap-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/10 z-10" />
                  <p>{">"} INITIALIZING CORE SYSTEMS...</p>
                  <p>{">"} CONNECTING SECURE VAULT [OK]</p>
                  <p>{">"} SYNCING DATABASE CLUSTERS [OK]</p>
                  <p className="text-primary">{">"} DEPLOYING MR.SOFTWARE_V2.0</p>
                  <p>{">"} STATUS: OPERATIONAL</p>
                  <p className="animate-pulse text-foreground">_</p>
                </div>
              </div>
            </div>
            
            {/* Floating widget */}
            <div className="absolute -bottom-6 -left-6 rounded-2xl border border-border bg-card p-4 shadow-2xl z-20 flex items-center gap-4 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">System Deployed</p>
                <p className="text-xs text-foreground/40">All nodes operational</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </SectionWrapper>
  );
}
