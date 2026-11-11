"use client";

import { useState } from "react";
import Link from "next/link";
import { Bot, PhoneCall } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import AiHubPanel from "@/components/common/AiHubPanel";

const shellCls =
  "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[65] sm:bottom-6 sm:right-6";

export default function FloatingActionCluster() {
  const { t } = useLanguage();
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className={cn(shellCls, "notranslate")}>
      <div className="relative flex flex-col items-end gap-2.5">
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
                "inline-flex size-12 items-center justify-center rounded-full border border-border bg-card text-foreground/80 shadow-sm transition",
                "hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              )}
            >
              <Bot className="size-[18px] stroke-[2.2]" aria-hidden />
            </button>

            <Link
              href="#book-call"
              aria-label={t("bookCall")}
              className={cn(
                "inline-flex size-12 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition",
                "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              <PhoneCall className="size-[18px] stroke-[2.2]" aria-hidden />
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
}
