"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  /**
   * Play enter animation on mount instead of when scrolled into view.
   * Use for above-the-fold sections: `whileInView` + tight viewport margins can fail to fire for hero content,
   * leaving text stuck at opacity 0 until scroll/layout changes.
   */
  revealOnMount?: boolean;
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 20,
  revealOnMount = false,
}: FadeInProps) {
  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const initial = {
    opacity: 0,
    scale: 0.98,
    ...directions[direction],
  };

  const animateTarget = {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
  };

  const transition = {
    duration: 0.8,
    delay,
    ease: [0.16, 1, 0.3, 1] as const,
  };

  if (revealOnMount) {
    return (
      <motion.div initial={initial} animate={animateTarget} transition={transition} className={cn(className)}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      whileInView={animateTarget}
      viewport={{ once: true, margin: "-100px" }}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
