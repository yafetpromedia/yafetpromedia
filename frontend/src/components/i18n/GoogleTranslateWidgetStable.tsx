"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Languages, Loader2, Search } from "lucide-react";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LANG_OPTIONS, type AppLanguage } from "@/lib/app-language";

/** Language switcher — real page translation via /api/translate (not Google’s dead site widget). */
export default function GoogleTranslateWidgetStable({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lenis = useLenis();
  const { language, setLanguage, translating, translateProgress, translateError } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keep scroll focus inside the language list — don't scroll the page behind it.
  useEffect(() => {
    if (!open) return;

    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const isInsideList = (target: EventTarget | null) => {
      const list = listRef.current;
      return !!(list && target instanceof Node && list.contains(target));
    };

    const onWheel = (event: WheelEvent) => {
      if (isInsideList(event.target)) {
        const list = listRef.current!;
        const { scrollTop, scrollHeight, clientHeight } = list;
        const atTop = scrollTop <= 0 && event.deltaY < 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 1 && event.deltaY > 0;
        if (atTop || atBottom) event.preventDefault();
        event.stopPropagation();
        return;
      }
      event.preventDefault();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (isInsideList(event.target)) {
        event.stopPropagation();
        return;
      }
      event.preventDefault();
    };

    document.addEventListener("wheel", onWheel, { passive: false, capture: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    return () => {
      document.removeEventListener("wheel", onWheel, true);
      document.removeEventListener("touchmove", onTouchMove, true);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [open, lenis]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANG_OPTIONS;
    return LANG_OPTIONS.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || option.code.toLowerCase().includes(q)
    );
  }, [query]);

  const active = useMemo(
    () => LANG_OPTIONS.find((option) => option.code === language) ?? LANG_OPTIONS[0],
    [language]
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "notranslate relative inline-flex h-9 items-center rounded-full border border-border/60 bg-background/80 px-1.5 pr-1.5 shadow-sm backdrop-blur-md sm:pr-2",
        className
      )}
      translate="no"
    >
      <Languages className="mr-1 hidden size-3.5 shrink-0 text-accent sm:mr-1.5 sm:block" aria-hidden />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${active.label}`}
        disabled={translating}
        className="inline-flex h-7 min-w-0 max-w-[7.5rem] items-center justify-between gap-1 rounded-full border border-border/55 bg-transparent px-2 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-70 sm:max-w-[9.5rem] sm:gap-1.5"
      >
        <span className="flex min-w-0 items-center gap-1 truncate sm:gap-1.5">
          {translating ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin text-accent" />
          ) : (
            <span className="shrink-0">{active.flag}</span>
          )}
          <span className="truncate">
            {translating ? `${translateProgress || 0}%` : active.label}
          </span>
        </span>
        <ChevronDown className={cn("size-3 text-foreground/65 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.45rem)] z-[140] w-[min(88vw,280px)] overflow-hidden rounded-2xl border border-border/70 bg-card p-1.5 shadow-[0_16px_48px_-20px_rgba(12,12,12,0.45)]"
          onWheel={(event) => event.stopPropagation()}
        >
          <div className="mb-1.5 flex items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-2.5 py-2">
            <Search className="size-3.5 shrink-0 text-foreground/45" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language..."
              autoFocus
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/40"
            />
          </div>
          {translateError ? (
            <p className="mb-1.5 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
              {translateError}
            </p>
          ) : null}
          <div
            ref={listRef}
            role="listbox"
            aria-label="Language options"
            data-lang-list
            className="max-h-72 overscroll-contain overflow-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/20"
          >
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs text-foreground/45">No languages found</p>
            ) : (
              filtered.map((option) => {
                const selected = option.code === active.code;
                return (
                  <button
                    key={option.code}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={translating}
                    onClick={() => {
                      setLanguage(option.code as AppLanguage);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition disabled:opacity-50",
                      selected
                        ? "bg-foreground text-background"
                        : "text-foreground/80 hover:bg-muted"
                    )}
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <span className="text-base leading-none">{option.flag}</span>
                      <span className="font-medium">{option.label}</span>
                    </span>
                    {selected ? <Check className="size-4 shrink-0" /> : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
