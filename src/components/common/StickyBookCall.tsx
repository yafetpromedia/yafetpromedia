"use client";

import Link from "next/link";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { PhoneCall } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function StickyBookCall() {
  const { t } = useLanguage();
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 140, damping: 24 });
  const y = useTransform(smoothY, [0, 180], [80, 0]);
  const opacity = useTransform(smoothY, [0, 120], [0, 1]);

  return (
    <motion.div
      style={{ y, opacity }}
      className="fixed bottom-6 right-6 z-[60]"
      aria-label="Book call floating action"
    >
      <Link
        href="#contact"
        className="inline-flex items-center gap-2 rounded-full h-12 px-5 bg-primary text-primary-foreground font-semibold shadow-[0_0_30px_rgba(255,106,0,0.35)] hover:shadow-[0_0_40px_rgba(255,106,0,0.5)] hover:bg-primary/90 transition-all"
      >
        <PhoneCall className="size-4" />
        {t("bookCall")}
      </Link>
    </motion.div>
  );
}
