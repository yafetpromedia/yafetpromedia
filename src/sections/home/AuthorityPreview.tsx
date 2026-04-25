"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const insights = [
  {
    title: "Why Infrastructure Matters More Than UI in 2026",
    category: "Architecture",
    date: "April 15, 2026",
    readTime: "5 min read"
  },
  {
    title: "Building Scalable Digital Identities for Global Brands",
    category: "Branding",
    date: "April 10, 2026",
    readTime: "4 min read"
  },
  {
    title: "The Future of Integrated Institutional Management",
    category: "Automation",
    date: "April 02, 2026",
    readTime: "8 min read"
  }
];

export default function AuthorityPreview() {
  return (
    <SectionWrapper id="insights" className="bg-[#050505] border-t border-white/5 pt-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div className="max-w-2xl">
          <FadeIn>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-[1px] w-8 bg-[#ff6a00]" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#ff6a00]">Thought Leadership</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
              Authority & Insights.
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed font-light">
              Strategic thinking on digital infrastructure and system-level innovation from our engineering and design teams.
            </p>
          </FadeIn>
        </div>
        <FadeIn delay={0.2} className="shrink-0">
          <Link href="#insights" className="group inline-flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-white hover:text-[#ff6a00] transition-colors pb-2 border-b border-white/20 hover:border-[#ff6a00]">
            View All Publications
            <ArrowUpRight className="size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </FadeIn>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((item, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <div className="group flex flex-col h-full bg-[#080808] border border-white/5 hover:border-white/20 hover:bg-[#0c0c0c] transition-all duration-500 rounded-[2rem] p-8 cursor-pointer relative overflow-hidden">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#ff6a00]/0 to-transparent group-hover:from-[#ff6a00]/5 transition-colors duration-500" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <span className="px-3 py-1 border border-[#ff6a00]/20 bg-[#ff6a00]/5 text-[#ff6a00] text-[10px] font-mono uppercase tracking-widest rounded-full">
                  {item.category}
                </span>
                <div className="size-10 rounded-full border border-white/10 flex items-center justify-center bg-[#111] group-hover:bg-[#ff6a00] group-hover:border-[#ff6a00] transition-all duration-500">
                  <ArrowUpRight className="size-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </div>
              
              <div className="mt-auto relative z-10">
                <h3 className="text-xl md:text-2xl font-display font-bold leading-tight mb-6 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#ff6a00] group-hover:to-[#ff9b4d] transition-all duration-500">
                  {item.title}
                </h3>
                
                <div className="flex items-center gap-4 text-xs font-mono text-gray-600 uppercase tracking-widest">
                  <span>{item.date}</span>
                  <span className="size-1 rounded-full bg-white/20" />
                  <span>{item.readTime}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </SectionWrapper>
  );
}
