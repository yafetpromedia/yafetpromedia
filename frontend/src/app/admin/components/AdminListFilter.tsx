"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminListFilter({
  value,
  onChange,
  placeholder = "Filter list…",
  resultHint,
  className,
  id,
  "aria-label": ariaLabel = "Filter list",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** e.g. "3 of 12 shown" */
  resultHint?: string;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4", className)}>
      <label htmlFor={id} className="relative flex min-h-[40px] min-w-0 flex-1 max-w-xl items-center">
        <span className="sr-only">{ariaLabel}</span>
        <Search className="pointer-events-none absolute left-3.5 size-4 text-foreground/40" aria-hidden />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          className={cn(
            "h-10 w-full rounded-xl border border-border/80 bg-background/90 py-2 pl-10 pr-3 text-sm text-foreground outline-none transition",
            "placeholder:text-foreground/38 focus:border-primary/45 focus:ring-2 focus:ring-primary/12",
            "dark:border-white/[0.09] dark:bg-white/[0.04]"
          )}
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      {resultHint ? (
        <p className="shrink-0 text-[11px] font-medium tabular-nums text-foreground/45">{resultHint}</p>
      ) : null}
    </div>
  );
}
