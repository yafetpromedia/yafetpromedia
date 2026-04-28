"use client";

import { motion, useScroll, useSpring } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 right-0 h-[3px] z-[70] origin-left bg-gradient-to-r from-primary via-[#ff9b4d] to-primary"
      style={{ scaleX }}
    />
  );
}
