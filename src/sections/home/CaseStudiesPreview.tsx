"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import { Badge } from "@/components/ui/badge";
import FadeIn from "@/components/animations/FadeIn";
import { TrendingUp, Users, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const cases = [
  {
    title: "National Education System",
    category: "Infrastructure",
    problem: "Fragmented student data and manual administrative processes leading to high error rates.",
    solution: "Implementation of a centralized digital infrastructure with real-time sync across 50+ institutions.",
    result: "40% reduction in admin overhead and 100% data integrity achievement.",
    icon: Users,
    stat: "50+",
    statLabel: "Institutions",
  },
  {
    title: "Global Logistics Brand",
    category: "Identity & Media",
    problem: "Inconsistent brand representation across 12 countries affecting market authority.",
    solution: "A unified brand identity system and media production pipeline for global marketing.",
    result: "25% increase in brand recognition and centralized asset management.",
    icon: TrendingUp,
    stat: "+25%",
    statLabel: "Growth",
  }
];

export default function CaseStudiesPreview() {
  return (
    <SectionWrapper id="case-studies" className="bg-[#050505] border-t border-white/5 relative z-10 pt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="max-w-2xl">
          <FadeIn>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-[#ff6a00]" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#ff6a00]">Proven Architecture</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
              Systems that deliver <br className="hidden lg:block"/> measurable scale.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light">
              Explore how our digital ecosystems have transformed enterprise workflows and driven verifiable growth.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2} className="shrink-0">
          <Link href="#contact" className="group inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-white hover:text-[#ff6a00] transition-colors pb-2 border-b border-white/20 hover:border-[#ff6a00]">
            View All Cases
            <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </FadeIn>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {cases.map((item, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <div className="bg-[#0c0c0c] border border-white/10 rounded-[2rem] overflow-hidden hover:border-white/20 hover:bg-[#0f0f0f] transition-all duration-500 flex flex-col h-full group relative">
              {/* Subtle gradient overlay */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(ellipse_at_top_right,rgba(255,106,0,0.05),transparent_70%)] pointer-events-none" />
              
              <div className="p-8 lg:p-12 flex-1 relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <Badge variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-4 py-1 text-xs tracking-wider rounded-full font-mono">
                    {item.category}
                  </Badge>
                  <div className="size-10 rounded-full border border-white/10 flex items-center justify-center bg-black group-hover:border-[#ff6a00]/30 transition-colors">
                    <item.icon className="size-4 text-gray-500 group-hover:text-[#ff6a00] transition-colors" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-display font-bold mb-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                  {item.title}
                </h3>
                
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-[2px] bg-red-500/20 rounded-full" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-gray-500 tracking-widest block mb-2">The Constraint</span>
                      <p className="text-gray-400 font-light leading-relaxed">{item.problem}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-[2px] bg-[#ff6a00]/40 rounded-full" />
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#ff6a00] tracking-widest block mb-2">The Architecture</span>
                      <p className="text-gray-200 font-light leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white/5 bg-[#080808] p-8 lg:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10 group-hover:bg-[#0a0a0a] transition-colors">
                <div className="flex-1">
                  <span className="text-[10px] font-mono uppercase text-[#ff6a00] tracking-[0.2em] block mb-2">Verifiable Result</span>
                  <p className="text-white font-medium">{item.result}</p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-4xl md:text-5xl font-display font-bold text-white block">{item.stat}</span>
                  <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">{item.statLabel}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
