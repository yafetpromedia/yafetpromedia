"use client";

import SectionWrapper from "@/components/common/SectionWrapper";
import FadeIn from "@/components/animations/FadeIn";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote: "Yafet Pro Media didn't just build us a website; they built the engine that runs our entire organization. Their system-level thinking is unparalleled.",
    author: "Dr. Samuel Kebede",
    role: "Director, National Tech Institute",
  },
  {
    quote: "The infrastructure they designed for our global brand has simplified our workflow across three continents. Professional, technical, and truly premium.",
    author: "Elena Rodriguez",
    role: "COO, Global Logistics Systems",
  }
];

export default function TrustSection() {
  return (
    <SectionWrapper id="trust" className="bg-[#050505] border-t border-white/5 pt-32 pb-32">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <FadeIn>
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="h-[1px] w-8 bg-[#ff6a00]" />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-[#ff6a00]">Institutional Trust</span>
            <div className="h-[1px] w-8 bg-[#ff6a00]" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
            Trusted by leading <br className="hidden md:block"/> institutions.
          </h2>
        </FadeIn>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {testimonials.map((item, index) => (
          <FadeIn key={index} delay={index * 0.1}>
            <div className="bg-[#080808] border border-white/5 p-10 md:p-14 rounded-[2rem] relative overflow-hidden group hover:border-[#ff6a00]/30 hover:bg-[#0c0c0c] transition-all duration-700 h-full flex flex-col">
              {/* Abstract decorative elements */}
              <div className="absolute -top-10 -right-10 size-40 bg-[#ff6a00]/5 rounded-full blur-3xl group-hover:bg-[#ff6a00]/10 transition-colors duration-700" />
              <Quote className="absolute top-10 right-10 size-16 text-white/5 group-hover:text-[#ff6a00]/10 transition-colors duration-700" />
              
              <div className="flex gap-1 mb-8">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="size-4 fill-[#ff6a00] text-[#ff6a00]" />
                ))}
              </div>

              <div className="relative z-10 flex-1">
                <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed font-light">
                  &quot;{item.quote}&quot;
                </p>
                
                <div className="mt-auto flex items-center gap-4">
                  <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-display font-bold text-gray-400">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{item.author}</h4>
                    <p className="text-[#ff6a00] text-xs font-mono uppercase tracking-widest mt-1">{item.role}</p>
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
