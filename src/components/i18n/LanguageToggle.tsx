"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export default function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={cn("inline-flex rounded-full border border-border bg-foreground/5 p-1", className)}>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "px-3 py-1.5 text-xs rounded-full transition-colors",
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-foreground/65 hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("am")}
        className={cn(
          "px-3 py-1.5 text-xs rounded-full transition-colors",
          language === "am"
            ? "bg-primary text-primary-foreground"
            : "text-foreground/65 hover:text-foreground"
        )}
      >
        AM
      </button>
    </div>
  );
}
