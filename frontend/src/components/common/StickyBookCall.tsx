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
        className="group inline-flex items-center rounded-full h-12 w-12 hover:w-[156px] pr-4 pl-4 overflow-hidden bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(255,106,0,0.24)] hover:shadow-[0_0_55px_rgba(255,106,0,0.55)] hover:bg-primary/90 transition-all duration-300"
      >
        <PhoneCall className="size-4 shrink-0" />
        <span className="ml-2 whitespace-nowrap max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-300">
          {t("bookCall")}
        </span>
      </Link>
    </motion.div>
  );
}
