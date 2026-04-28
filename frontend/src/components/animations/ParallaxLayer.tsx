"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ParallaxLayerProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
  direction?: "up" | "down";
}

export default function ParallaxLayer({
  children,
  className,
  offset = 50,
  direction = "up",
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === "up" ? [offset, -offset] : [-offset, offset]
  );

  return (
    <motion.div ref={ref} style={{ y }} className={cn(className)}>
      {children}
    </motion.div>
  );
}
