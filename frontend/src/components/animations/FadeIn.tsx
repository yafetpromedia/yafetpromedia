"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  /**
   * Play enter animation on mount instead of when scrolled into view.
   * Use for above-the-fold sections.
   */
  revealOnMount?: boolean;
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 12,
  revealOnMount = false,
}: FadeInProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={cn(className)}>{children}</div>;
  }

  const directions = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  const initial = {
    opacity: 0,
    ...directions[direction],
  };

  const animateTarget = {
    opacity: 1,
    x: 0,
    y: 0,
  };

  const transition = {
    duration: 0.45,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
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
      viewport={{ once: true, margin: "-40px" }}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
