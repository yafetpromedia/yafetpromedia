"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ClipboardList, MessageCircle, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import {
  ConsultantSessionProvider,
} from "@/components/consultant/ConsultantSessionContext";
import ConsultantTalkPane from "@/components/consultant/ConsultantTalkPane";
import ConsultantPlanWorkspace from "@/components/consultant/ConsultantPlanWorkspace";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

export type AiHubTab = "chat" | "plan";

type Props = {
  open: boolean;
  onClose: () => void;
  initialTab?: AiHubTab;
  className?: string;
};

function HubInner({
  open,
  onClose,
  initialTab,
  className,
  assistantName,
}: {
  open: boolean;
  onClose: () => void;
  initialTab: AiHubTab;
  className?: string;
  assistantName: string;
}) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<AiHubTab>(initialTab);

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

  return (
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
              "inset-x-0 bottom-0 top-[max(0.75rem,env(safe-area-inset-top))] rounded-t-[1.5rem]",
              "sm:inset-auto sm:right-6 sm:bottom-6 sm:top-auto sm:h-[min(720px,calc(100dvh-3rem))] sm:w-[min(440px,calc(100vw-3rem))] sm:rounded-[1.5rem]",
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
                    <p className="truncate text-[11px] text-muted-foreground">
                      Talk, plan, and brief — one project
                    </p>
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
                  aria-controls="awud-talk-panel"
                  id="awud-talk-tab"
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
                  aria-controls="awud-plan-panel"
                  id="awud-plan-tab"
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
              <div
                id="awud-talk-panel"
                role="tabpanel"
                aria-labelledby="awud-talk-tab"
                aria-hidden={tab !== "chat"}
                className={cn("flex min-h-0 flex-1 flex-col", tab !== "chat" && "hidden")}
              >
                <ConsultantTalkPane active={tab === "chat"} onOpenPlan={() => setTab("plan")} />
              </div>
              <div
                id="awud-plan-panel"
                role="tabpanel"
                aria-labelledby="awud-plan-tab"
                aria-hidden={tab !== "plan"}
                className={cn("flex min-h-0 flex-1 flex-col", tab !== "plan" && "hidden")}
              >
                <ConsultantPlanWorkspace active={tab === "plan"} onOpenTalk={() => setTab("chat")} />
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

export default function AiHubPanel({ open, onClose, initialTab = "chat", className }: Props) {
  const { content } = useSiteContent();
  const assistantName = content.aiName.trim() || "Awud AI";
  const mounted = useHydrated();

  if (!mounted) return null;

  // Provider stays mounted while panel can reopen — session persists across close via sessionStorage + DB draft.
  const panel = (
    <ConsultantSessionProvider>
      <HubInner
        key={open ? `open-${initialTab}` : "closed"}
        open={open}
        onClose={onClose}
        initialTab={initialTab}
        className={className}
        assistantName={assistantName}
      />
    </ConsultantSessionProvider>
  );

  return createPortal(panel, document.body);
}
