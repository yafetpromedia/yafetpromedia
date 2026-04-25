"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import FadeIn from "@/components/animations/FadeIn";
import { ArrowRight, Play, Database, Shield, Zap } from "lucide-react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax Values
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "80%"]);
  const yForeground1 = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={ref}
      className="relative min-h-[120vh] flex flex-col items-center pt-32 pb-20 overflow-hidden bg-[#050505]"
    >
      {/* 1. Deep Background Layer (Slow Parallax) */}
      <motion.div 
        style={{ y: yBg, opacity }} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Core Glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#ff6a00]/15 rounded-full blur-[140px]" />
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at top center, black, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at top center, black, transparent 70%)"
          }}
        />
      </motion.div>
      
      {/* 2. Midground Layer: Core Typography (Medium Parallax) */}
      <motion.div 
        style={{ y: yText, opacity }}
        className="container px-4 mx-auto relative z-10 flex flex-col items-center w-full"
      >
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
          <FadeIn distance={40}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase border border-white/10 rounded-full bg-white/[0.03] text-gray-300 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6a00] opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-[#ff6a00]"></span>
              </span>
              Digital Systems Infrastructure
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1} distance={40}>
            <h1 className="text-[3rem] sm:text-6xl md:text-7xl lg:text-[7rem] font-display font-bold mb-8 leading-[1.05] tracking-tighter">
              We build <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ff6a00] to-[#ff9b4d] pr-2 pb-2 block sm:inline">complete</span><br className="hidden sm:block" />
              digital systems.
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2} distance={40}>
            <p className="text-gray-400 text-lg md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              We design infrastructure, not just interfaces. Our systems power organizations 
              through scalable technology, integrated branding, and strategic marketing.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3} distance={40} className="relative z-50 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full bg-[#ff6a00] hover:bg-[#e65c00] text-white shadow-[0_0_40px_rgba(255,106,0,0.25)] hover:shadow-[0_0_60px_rgba(255,106,0,0.4)] transition-all duration-300 group">
                Start a Project
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold rounded-full border-white/10 text-white hover:bg-white/5 backdrop-blur-md transition-colors duration-300">
                <Play className="mr-2 size-4 fill-current" />
                View Products
              </Button>
            </div>
          </FadeIn>
        </div>
      </motion.div>

      {/* 3. Mid-Foreground: Trusted By Ticker */}
      <motion.div 
        style={{ y: yText, opacity }}
        className="w-full max-w-5xl mx-auto mt-24 relative z-20"
      >
        <FadeIn delay={0.5} distance={20}>
          <p className="text-center text-xs font-bold tracking-[0.2em] uppercase text-gray-600 mb-8">
            Powering infrastructure for modern organizations
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale transition-all duration-700">
            {/* Minimalist text logos for professional SaaS look */}
            <div className="text-xl font-bold tracking-tighter flex items-center gap-1"><Zap className="size-5"/> VORTEX</div>
            <div className="text-xl font-bold tracking-tighter flex items-center gap-1"><Database className="size-5"/> LUMINA</div>
            <div className="text-xl font-bold tracking-tighter flex items-center gap-1"><Shield className="size-5"/> AEGIS</div>
            <div className="text-xl font-bold tracking-tighter hidden sm:flex items-center gap-1"><ArrowRight className="size-5"/> NEXUS</div>
            <div className="text-xl font-bold tracking-tighter hidden md:flex items-center gap-1"><Play className="size-5"/> SYNTH</div>
          </div>
        </FadeIn>
      </motion.div>

      {/* 4. Foreground Layer: Abstract Dashboard / Mockup (Fast Parallax) */}
      <motion.div 
        style={{ y: yForeground1, opacity }}
        className="w-full max-w-6xl mx-auto mt-32 px-4 relative z-30 [perspective:2000px]"
      >
        <FadeIn delay={0.6} distance={60}>
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl sm:rounded-[2rem] border border-white/10 bg-[#0c0c0c]/80 backdrop-blur-2xl overflow-hidden shadow-2xl group transform-gpu [transform:rotateX(15deg)] hover:[transform:rotateX(0deg)] transition-transform duration-1000 ease-out">
            {/* Top Bar */}
            <div className="absolute top-0 w-full h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-2">
              <div className="flex gap-2">
                <div className="size-3 rounded-full bg-white/10" />
                <div className="size-3 rounded-full bg-white/10" />
                <div className="size-3 rounded-full bg-white/10" />
              </div>
              <div className="mx-auto px-4 py-1 rounded-md bg-black/50 border border-white/5 text-[10px] text-gray-500 font-mono flex items-center gap-2">
                <Shield className="size-3" /> core-system-architecture.tsx
              </div>
            </div>
            
            {/* Abstract UI content */}
            <div className="p-8 pt-20 h-full grid grid-cols-12 gap-6 opacity-60 group-hover:opacity-100 transition-opacity duration-1000">
              <div className="col-span-3 hidden md:flex flex-col gap-4 border-r border-white/5 pr-6">
                <div className="h-4 w-20 bg-white/10 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-3/4 bg-[#ff6a00]/30 rounded" />
                <div className="h-3 w-full bg-white/5 rounded" />
                <div className="h-3 w-5/6 bg-white/5 rounded" />
              </div>
              <div className="col-span-12 md:col-span-9 flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <div className="h-6 w-32 bg-white/10 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/5" />
                    <div className="h-8 w-24 rounded-full bg-[#ff6a00]/20" />
                  </div>
                </div>
                <div className="flex-1 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 p-6 flex flex-col justify-end">
                  {/* Abstract Chart */}
                  <div className="flex items-end gap-2 h-32 w-full">
                    {[40, 20, 50, 80, 45, 90, 60, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-[#ff6a00]/40 to-[#ff6a00]/10" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ff6a00]/5 via-transparent to-transparent pointer-events-none" />
          </div>
        </FadeIn>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-40" />
    </section>
  );
}
