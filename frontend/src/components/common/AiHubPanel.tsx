"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ClipboardList, MessageCircle, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import AiAssistantChat from "@/components/common/AiAssistantChat";
import ProjectConsultantChat from "@/components/common/ProjectConsultantChat";
import { cn } from "@/lib/utils";

export type AiHubTab = "chat" | "plan";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTab?: AiHubTab;
  className?: string;
};

export default function AiHubPanel({ open, onClose, initialTab = "chat", className }: Props) {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const assistantName = content.aiName.trim() || "Awud AI";
  const [tab, setTab] = useState<AiHubTab>(initialTab);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  if (!mounted) return null;

  const panel = (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="floating-ai-hub-panel"
          role="dialog"
          aria-label={t("aiAssistant")}
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className={cn(
            "fixed z-[80] flex flex-col overflow-hidden rounded-[1.35rem]",
            "border border-border/80 bg-background/95 shadow-[0_28px_70px_-28px_rgba(0,0,0,0.18)] backdrop-blur-2xl",
            "ring-1 ring-border/40 dark:shadow-[0_32px_80px_-24px_rgba(0,0,0,0.65)]",
            "inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] top-auto",
            "h-[min(620px,calc(100dvh-1.5rem-env(safe-area-inset-bottom)-env(safe-area-inset-top)))]",
            "sm:inset-x-auto sm:right-6 sm:bottom-6 sm:left-auto sm:w-[min(400px,calc(100vw-3rem))]",
            className
          )}
        >
          <div className="relative shrink-0 overflow-hidden border-b border-border/60 px-4 py-3.5">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_0%_0%,rgba(255,106,0,0.14),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.1),transparent_45%)] dark:bg-[radial-gradient(ellipse_80%_120%_at_0%_0%,rgba(255,106,0,0.22),transparent_55%),radial-gradient(circle_at_100%_0%,rgba(99,102,241,0.18),transparent_45%)]"
            />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6a00] to-[#ff9139] text-white shadow-[0_8px_24px_-8px_rgba(255,106,0,0.55)] ring-1 ring-orange-400/25">
                  <Bot className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-[15px] font-bold leading-tight text-foreground">
                    {assistantName}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Chat or plan your project</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            <div
              role="tablist"
              aria-label="AI modes"
              className="relative mt-3 grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/50 p-1 dark:bg-muted/30"
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === "chat"}
                onClick={() => setTab("chat")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition",
                  tab === "chat"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <MessageCircle className="size-3.5" />
                Talk
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "plan"}
                onClick={() => setTab("plan")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition",
                  tab === "plan"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ClipboardList className="size-3.5" />
                Plan
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className={cn("flex min-h-0 flex-1 flex-col", tab !== "chat" && "hidden")}>
              <AiAssistantChat
                embedded
                open={open}
                active={tab === "chat"}
                onClose={onClose}
                onOpenPlan={() => setTab("plan")}
              />
            </div>
            <div className={cn("flex min-h-0 flex-1 flex-col", tab !== "plan" && "hidden")}>
              <ProjectConsultantChat embedded open={open} active={tab === "plan"} onClose={onClose} />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}
