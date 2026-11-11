"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export default function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "notranslate inline-flex rounded-full border border-border bg-foreground/5 p-1",
        className
      )}
      translate="no"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs transition-colors",
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-foreground/65 hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("am")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs transition-colors",
          language === "am"
            ? "bg-primary text-primary-foreground"
            : "text-foreground/65 hover:text-foreground"
        )}
      >
        AM
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={cn(
          "rounded-full px-3 py-1.5 text-xs transition-colors",
          language === "ar"
            ? "bg-primary text-primary-foreground"
            : "text-foreground/65 hover:text-foreground"
        )}
      >
        AR
      </button>
    </div>
  );
}
