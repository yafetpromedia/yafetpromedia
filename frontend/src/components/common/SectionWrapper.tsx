"use client";

import { cn } from "@/lib/utils";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
}

/** Quiet section shell — no nested scroll animations (FadeIn handles reveals). */
export default function SectionWrapper({
  children,
  className,
  id,
  containerClassName,
}: SectionWrapperProps) {
  return (
    <section id={id} className={cn("relative overflow-x-clip py-20 md:py-28", className)}>
      <div className={cn("mx-auto w-full max-w-7xl px-6", containerClassName)}>{children}</div>
    </section>
  );
}
