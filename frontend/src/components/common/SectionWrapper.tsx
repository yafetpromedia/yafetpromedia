"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  containerClassName?: string;
}

export default function SectionWrapper({
  children,
  className,
  id,
  containerClassName,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn("relative overflow-x-clip py-24 md:py-32", className)}
    >
      <motion.div 
        className={cn("max-w-7xl w-full mx-auto px-6", containerClassName)}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1] 
        }}
      >
        {children}
      </motion.div>
    </section>
  );
}
