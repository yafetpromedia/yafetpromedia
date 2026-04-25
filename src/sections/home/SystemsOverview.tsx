"use client";

import { motion } from "framer-motion";
import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { Database, Layout, Video, LineChart, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const systems = [
  {
    title: "Core Infrastructure",
    description: "Robust, scalable backend systems and architecture that power complex organizational workflows securely.",
    icon: Database,
    className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2",
    delay: 0.1,
    tag: "SYS_ARCH",
  },
  {
    title: "Brand Ecosystems",
    description: "System-based branding that scales infinitely across all platforms.",
    icon: Layout,
    className: "col-span-1 md:col-span-1 lg:col-span-2 row-span-1",
    delay: 0.2,
    tag: "BRAND_OS",
  },
  {
    title: "Media Pipelines",
    description: "Automated production pipelines for high-volume content.",
    icon: Video,
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    delay: 0.3,
    tag: "MEDIA_NET",
  },
  {
    title: "Growth Engines",
    description: "Data-driven marketing automation built for extreme scalability.",
    icon: LineChart,
    className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1",
    delay: 0.4,
    tag: "GROWTH_LOGIC",
  },
];

export default function SystemsOverview() {
  return (
    <SectionWrapper id="systems" className="bg-background border-t border-border relative z-10 pt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 text-foreground">
        <div className="max-w-2xl">
          <FadeIn>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-primary" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">Ecosystem Architecture</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
              Integrated infrastructure <br className="hidden lg:block"/> for modern scale.
            </h2>
            <p className="text-foreground/60 text-lg leading-relaxed font-light text-balance">
              We don&apos;t just build websites; we engineer the underlying digital ecosystems that drive business operations and brand authority.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2} className="shrink-0">
          <Link href="#contact" className="group inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-foreground hover:text-primary transition-colors pb-2 border-b border-border hover:border-primary">
            Explore Architecture
            <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </FadeIn>
      </div>
      
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
              delayChildren: 0.2
            }
          }
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-[auto] lg:grid-rows-2 gap-4 lg:gap-6 min-h-[600px]"
      >
        {systems.map((system, index) => (
          <motion.div 
            key={index} 
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.95 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
              }
            }}
            className={`group relative rounded-[2rem] border border-border bg-card overflow-hidden hover:border-primary/30 transition-colors duration-500 ${system.className}`}
          >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-transparent group-hover:from-primary/5 transition-colors duration-700 pointer-events-none" />
            
            <div className="absolute top-6 right-6 px-3 py-1 rounded-full border border-border bg-foreground/5 text-[10px] font-mono text-foreground/40 tracking-wider">
              {system.tag}
            </div>

            <div className="flex flex-col h-full p-8 lg:p-10 z-10 relative text-foreground">
              <div className="size-14 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center mb-auto group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500">
                <system.icon className="size-6 text-foreground/70 group-hover:text-primary transition-colors duration-500" />
              </div>
              
              <div className="mt-12">
                <h3 className="text-2xl font-display font-bold mb-4 tracking-tight group-hover:text-primary transition-colors">
                  {system.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed font-light">
                  {system.description}
                </p>
              </div>
            </div>
            
            {/* Tech Pattern Decoration */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_bottom_right,var(--color-primary),transparent_70%)] opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}
