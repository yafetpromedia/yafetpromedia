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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const panel = (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close assistant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[79] bg-foreground/25 backdrop-blur-[2px] sm:bg-foreground/15"
            onClick={onClose}
          />

          <motion.div
            id="floating-ai-hub-panel"
            role="dialog"
            aria-modal="true"
            aria-label={t("aiAssistant")}
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 420, damping: 36 }}
            className={cn(
              "fixed z-[80] flex flex-col overflow-hidden bg-card text-card-foreground",
              "border border-border/70 shadow-lg",
              // Mobile: almost full-height bottom sheet
              "inset-x-0 bottom-0 top-[max(0.75rem,env(safe-area-inset-top))] rounded-t-[1.5rem]",
              // Desktop: floating panel
              "sm:inset-auto sm:right-6 sm:bottom-6 sm:top-auto sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[min(420px,calc(100vw-3rem))] sm:rounded-[1.5rem]",
              className
            )}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-foreground/15 sm:hidden" aria-hidden />

            <div className="relative shrink-0 border-b border-border/60 px-4 pb-3 pt-2 sm:pt-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground sm:size-10 sm:rounded-2xl">
                    <Bot className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-display text-[15px] font-semibold leading-tight text-foreground">
                      {assistantName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">Chat or plan your project</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div
                role="tablist"
                aria-label="AI modes"
                className="mt-3 grid grid-cols-2 gap-1 rounded-full border border-border/70 bg-muted/60 p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "chat"}
                  onClick={() => setTab("chat")}
                  className={cn(
                    "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition",
                    tab === "chat"
                      ? "bg-background text-foreground shadow-sm"
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
                    "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition",
                    tab === "plan"
                      ? "bg-background text-foreground shadow-sm"
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
        </>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(panel, document.body);
}
