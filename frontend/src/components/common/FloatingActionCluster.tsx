"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Bot, PhoneCall } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import AiHubPanel from "@/components/common/AiHubPanel";

const shellCls =
  "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[65] sm:bottom-6 sm:right-6";

export default function FloatingActionCluster() {
  const { t } = useLanguage();
  const [aiOpen, setAiOpen] = useState(false);

  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 140, damping: 24 });
  const y = useTransform(smoothY, [0, 160], [16, 0]);

  const clusterHover = reduceMotion ? {} : { y: -6 };
  const clusterSpring = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.55 };

  return (
    <motion.div style={{ y }} className={shellCls}>
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10 blur-3xl opacity-30 dark:opacity-[0.65]"
          style={{
            background:
              "radial-gradient(ellipse 85% 75% at 90% 88%, rgba(255,106,0,0.18), transparent 52%), radial-gradient(circle at 40% 35%, rgba(148,163,184,0.12), transparent 45%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-10 -z-10 hidden blur-3xl dark:block dark:opacity-[0.65]"
          style={{
            background:
              "radial-gradient(ellipse 85% 75% at 90% 88%, rgba(255,106,0,0.42), transparent 52%), radial-gradient(circle at 40% 35%, rgba(251,191,36,0.1), transparent 45%)",
          }}
        />

        <motion.div
          initial={false}
          whileHover={clusterHover}
          transition={clusterSpring}
          className="relative flex flex-col items-end gap-2"
        >
          <AiHubPanel open={aiOpen} onClose={() => setAiOpen(false)} />

          {!aiOpen ? (
            <>
              <button
                type="button"
                aria-expanded={aiOpen}
                aria-controls="floating-ai-hub-panel"
                aria-label={t("aiAssistant")}
                onClick={() => setAiOpen((prev) => !prev)}
                className={cn(
                  "group/ai relative inline-flex h-10 min-h-10 max-w-10 cursor-pointer flex-row-reverse items-center gap-2 overflow-hidden rounded-full px-0 shadow-md backdrop-blur-md transition-[max-width,padding,transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[max-width] motion-reduce:duration-300 motion-reduce:will-change-auto",
                  "hover:max-w-[min(calc(100vw-2rem),14rem)] hover:px-2 hover:-translate-x-px hover:shadow-[0_8px_32px_-8px_rgba(255,106,0,0.28)] focus-visible:max-w-[min(calc(100vw-2rem),14rem)] focus-visible:px-2 focus-visible:-translate-x-px focus-visible:shadow-[0_8px_32px_-8px_rgba(255,106,0,0.28)] active:translate-x-0",
                  "motion-reduce:hover:-translate-x-0 motion-reduce:focus-visible:-translate-x-0",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "border border-[#ff6a00]/75 bg-background/90 text-[#ff6a00] hover:border-orange-400 hover:bg-[#ff6a00]/[0.07] dark:border-orange-400/65 dark:bg-[#0f172a]/92 dark:text-orange-300 dark:hover:bg-orange-500/14"
                )}
              >
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 group-hover/ai:scale-[1.03] group-focus-visible/ai:scale-[1.03] motion-reduce:group-hover:scale-100">
                  <Bot className="size-[17px] shrink-0 stroke-[2.35]" aria-hidden />
                </span>
                <span
                  className={cn(
                    "max-w-0 shrink-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold tracking-wide transition-[max-width,opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 motion-reduce:blur-none",
                    "translate-x-1 opacity-0 blur-[1px] group-hover/ai:max-w-[11rem] group-hover/ai:translate-x-0 group-hover/ai:opacity-100 group-hover/ai:blur-none group-focus-visible/ai:max-w-[11rem] group-focus-visible/ai:translate-x-0 group-focus-visible/ai:opacity-100 group-focus-visible/ai:blur-none",
                    "text-foreground dark:text-orange-50"
                  )}
                >
                  {t("aiAssistant")}
                </span>
              </button>

              <Link
                href="#contact"
                aria-label={t("bookCall")}
                className={cn(
                  "group/call relative inline-flex h-10 min-h-10 max-w-10 flex-row-reverse items-center gap-2 overflow-hidden rounded-full px-0 transition-[max-width,padding,transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[max-width] motion-reduce:duration-300 motion-reduce:will-change-auto",
                  "bg-gradient-to-br from-[#ff6a00] via-[#ff7316] to-[#ffa033] text-white shadow-[0_10px_36px_-12px_rgba(255,106,0,0.52)] ring-1 ring-white/15",
                  "hover:max-w-[min(calc(100vw-2rem),12rem)] hover:px-2 hover:-translate-x-px hover:brightness-[1.03] hover:shadow-[0_14px_44px_-14px_rgba(255,106,0,0.68)] focus-visible:max-w-[min(calc(100vw-2rem),12rem)] focus-visible:px-2 focus-visible:-translate-x-px active:translate-x-0",
                  "motion-reduce:hover:-translate-x-0 motion-reduce:focus-visible:-translate-x-0",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:shadow-[0_12px_40px_-14px_rgba(255,106,0,0.48)] dark:ring-white/10"
                )}
              >
                <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 group-hover/call:scale-[1.03] group-focus-visible/call:scale-[1.03] motion-reduce:group-hover:scale-100">
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.42),transparent_52%)] opacity-90" />
                  <PhoneCall className="relative size-[17px] shrink-0 stroke-[2.35]" aria-hidden />
                </span>
                <span className="max-w-0 shrink-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/95 opacity-0 blur-[1px] transition-[max-width,opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 motion-reduce:blur-none translate-x-1 group-hover/call:max-w-[9rem] group-hover/call:translate-x-0 group-hover/call:opacity-100 group-hover/call:blur-none group-focus-visible/call:max-w-[9rem] group-focus-visible/call:translate-x-0 group-focus-visible/call:opacity-100 group-focus-visible/call:blur-none">
                  {t("bookCall")}
                </span>
              </Link>
            </>
          ) : null}
        </motion.div>
      </div>
    </motion.div>
  );
}
