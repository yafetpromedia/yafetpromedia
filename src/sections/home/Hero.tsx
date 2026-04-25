"use client";

import { useRef } from "react";
import Image from "next/image";
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
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section 
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center pt-28 pb-20 overflow-hidden bg-[#050505]"
    >
      {/* 1. Deep Background Layer (Slow Parallax) */}
      <motion.div 
        style={{ y: yBg, opacity }} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Core Glow — pushed to the right to complement the image layout */}
        <div className="absolute top-[30%] right-[10%] w-[700px] h-[600px] bg-[#ff6a00]/10 rounded-full blur-[160px]" />
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-[#ff6a00]/5 rounded-full blur-[120px]" />
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 75%)"
          }}
        />
      </motion.div>
      
      {/* 2. Main Two-Column Content — constrained to same max-width as navbar */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-8rem)]">
          
          {/* LEFT COLUMN: Typography & CTAs */}
          <motion.div
            style={{ y: yText, opacity }}
            className="flex flex-col items-start justify-center"
          >
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
              <h1 className="text-[3rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-display font-bold mb-6 leading-[1.05] tracking-tighter text-left">
                We build{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#ff6a00] to-[#ff9b4d]">
                  complete
                </span>
                <br />
                digital systems.
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.2} distance={40}>
              <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-xl leading-relaxed font-light tracking-wide text-left">
                We design infrastructure, not just interfaces. Our systems power organizations 
                through scalable technology, integrated branding, and strategic marketing.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.3} distance={40} className="relative z-50 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
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

            {/* Trust Ticker — left aligned under CTAs */}
            <FadeIn delay={0.5} distance={20} className="mt-16 w-full">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-600 mb-6">
                Powering infrastructure for modern organizations
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 opacity-40 grayscale">
                <div className="text-sm font-bold tracking-tighter flex items-center gap-1"><Zap className="size-4"/> VORTEX</div>
                <div className="text-sm font-bold tracking-tighter flex items-center gap-1"><Database className="size-4"/> LUMINA</div>
                <div className="text-sm font-bold tracking-tighter flex items-center gap-1"><Shield className="size-4"/> AEGIS</div>
                <div className="text-sm font-bold tracking-tighter flex items-center gap-1"><ArrowRight className="size-4"/> NEXUS</div>
                <div className="text-sm font-bold tracking-tighter hidden sm:flex items-center gap-1"><Play className="size-4"/> SYNTH</div>
              </div>
            </FadeIn>
          </motion.div>

          {/* RIGHT COLUMN: Brand SVG with Parallax */}
          <motion.div
            style={{ y: yImage, opacity }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <FadeIn delay={0.2} distance={60} className="relative w-full max-w-lg lg:max-w-none">
              {/* Glow behind the image */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,106,0,0.2),transparent_70%)] blur-3xl scale-110 pointer-events-none" />
              
              {/* The SVG brand image */}
              <div className="relative w-full aspect-square max-w-[540px] mx-auto lg:ml-auto">
                <Image
                  src="/images/hero/hero image.svg"
                  alt="Yafet Pro Media — Digital Systems"
                  fill
                  className="object-contain drop-shadow-2xl select-none"
                  priority
                />
              </div>

              {/* Floating metric badge — top left of image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="absolute -left-6 top-12 rounded-2xl border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl p-4 shadow-2xl hidden md:flex items-center gap-3"
              >
                <div className="size-9 rounded-full bg-[#ff6a00]/10 border border-[#ff6a00]/20 flex items-center justify-center">
                  <Shield className="size-4 text-[#ff6a00]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Systems Active</p>
                  <p className="text-white font-bold text-lg leading-none">99.9% <span className="text-xs text-[#ff6a00] font-mono">uptime</span></p>
                </div>
              </motion.div>

              {/* Floating metric badge — bottom right of image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                className="absolute -right-4 bottom-16 rounded-2xl border border-white/10 bg-[#0c0c0c]/90 backdrop-blur-xl p-4 shadow-2xl hidden md:flex items-center gap-3"
              >
                <div className="size-9 rounded-full bg-[#ff6a00]/10 border border-[#ff6a00]/20 flex items-center justify-center">
                  <Zap className="size-4 text-[#ff6a00]" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Clients Deployed</p>
                  <p className="text-white font-bold text-lg leading-none">50+ <span className="text-xs text-[#ff6a00] font-mono">orgs</span></p>
                </div>
              </motion.div>
            </FadeIn>
          </motion.div>

        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent pointer-events-none z-40" />
    </section>
  );
}
