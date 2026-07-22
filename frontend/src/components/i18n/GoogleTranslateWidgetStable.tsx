"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronDown, Languages, Search } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            autoDisplay?: boolean;
            includedLanguages?: string;
          },
          elementId: string
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const LANG_OPTIONS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "am", label: "Amharic", flag: "🇪🇹" },
  { code: "ar", label: "Arabic", flag: "🇸🇦" },
  { code: "de", label: "German", flag: "🇩🇪" },
  { code: "es", label: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "French", flag: "🇫🇷" },
  { code: "hi", label: "Hindi", flag: "🇮🇳" },
  { code: "it", label: "Italian", flag: "🇮🇹" },
  { code: "ja", label: "Japanese", flag: "🇯🇵" },
  { code: "ko", label: "Korean", flag: "🇰🇷" },
  { code: "om", label: "Oromo", flag: "🇪🇹" },
  { code: "pt", label: "Portuguese", flag: "🇵🇹" },
  { code: "ru", label: "Russian", flag: "🇷🇺" },
  { code: "sw", label: "Swahili", flag: "🇰🇪" },
  { code: "ti", label: "Tigrinya", flag: "🇪🇷" },
  { code: "tr", label: "Turkish", flag: "🇹🇷" },
  { code: "zh-CN", label: "Chinese (Simp.)", flag: "🇨🇳" },
] as const;

const INCLUDED_LANGS = LANG_OPTIONS.map((l) => l.code)
  .filter((c) => c !== "en")
  .map((c) => c.toLowerCase())
  .join(",");
const GLOBAL_HOST_ID = "google_translate_element_global";
let translateElementBootstrapped = false;

function ensureTranslateScript() {
  if (document.querySelector('script[data-google-translate="true"]')) return;
  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.defer = true;
  script.setAttribute("data-google-translate", "true");
  document.body.appendChild(script);
}

function ensureGlobalHost() {
  let host = document.getElementById(GLOBAL_HOST_ID);
  if (host) return host;
  host = document.createElement("div");
  host.id = GLOBAL_HOST_ID;
  host.style.position = "fixed";
  host.style.left = "-9999px";
  host.style.top = "0";
  host.style.width = "1px";
  host.style.height = "1px";
  host.style.opacity = "0";
  host.style.pointerEvents = "none";
  document.body.appendChild(host);
  return host;
}

function getCookieLang(): string {
  if (typeof document === "undefined") return "en";
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/(?:auto|en)\/([^;/]+)/i);
  const raw = m?.[1]?.trim();
  if (!raw) return "en";
  const hit = LANG_OPTIONS.find((l) => l.code.toLowerCase() === raw.toLowerCase());
  return hit?.code ?? "en";
}

function setCookieLang(lang: string) {
  if (lang === "en") {
    document.cookie = "googtrans=;path=/;max-age=0";
    return;
  }
  document.cookie = `googtrans=/auto/${encodeURIComponent(lang)};path=/;max-age=31536000`;
}

function applyGoogleCombo(lang: string): boolean {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return false;
  const hit = [...combo.options].find((o) => o.value.toLowerCase() === lang.toLowerCase());
  combo.value = hit?.value ?? lang;
  combo.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function canUseGoogleProxyTranslate() {
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
  if (host.endsWith(".local")) return false;
  return true;
}

export default function GoogleTranslateWidgetStable({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cookieLang = useSyncExternalStore(
    () => () => {},
    getCookieLang,
    () => "en"
  );
  const [pickedLang, setPickedLang] = useState<string | null>(null);
  const lang = pickedLang ?? cookieLang;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      const node = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  useEffect(() => {
    const init = () => {
      if (!window.google?.translate?.TranslateElement) return;
      const target = ensureGlobalHost();
      if (translateElementBootstrapped || target.querySelector(".goog-te-gadget")) {
        translateElementBootstrapped = true;
        const pending = getCookieLang();
        if (pending !== "en") applyGoogleCombo(pending);
        return;
      }
      translateElementBootstrapped = true;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          autoDisplay: false,
          includedLanguages: INCLUDED_LANGS,
        },
        GLOBAL_HOST_ID
      );
      const pending = getCookieLang();
      if (pending !== "en") {
        window.setTimeout(() => applyGoogleCombo(pending), 120);
      }
    };

    window.googleTranslateElementInit = init;
    init();
    ensureTranslateScript();
    const timer = window.setInterval(init, 400);
    const timeout = window.setTimeout(() => window.clearInterval(timer), 12000);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(timeout);
    };
  }, []);

  const onSelect = useCallback((next: string) => {
    setPickedLang(next);
    setOpen(false);
    setQuery("");
    setCookieLang(next);
    if (next === "en") {
      window.location.reload();
      return;
    }
    if (applyGoogleCombo(next)) return;

    let attempts = 0;
    const retry = window.setInterval(() => {
      attempts += 1;
      if (applyGoogleCombo(next)) {
        window.clearInterval(retry);
        return;
      }
      if (attempts < 12) return;
      window.clearInterval(retry);
      // Cookie is already set. Reload so TranslateElement applies it.
      // On production, fall back to Google's translate proxy if needed.
      if (canUseGoogleProxyTranslate() && !document.querySelector(".goog-te-combo")) {
        const url = new URL("https://translate.google.com/translate");
        url.searchParams.set("sl", "auto");
        url.searchParams.set("tl", next);
        url.searchParams.set("u", window.location.href);
        window.location.href = url.toString();
        return;
      }
      window.location.reload();
    }, 200);
  }, []);

  const options = useMemo(() => LANG_OPTIONS, []);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) || option.code.toLowerCase().includes(q)
    );
  }, [options, query]);
  const active = useMemo(
    () =>
      options.find((option) => option.code.toLowerCase() === lang.toLowerCase()) ??
      options[0],
    [lang, options]
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative inline-flex h-9 items-center rounded-full border border-border/60 bg-background/70 px-1.5 pr-2 shadow-[0_8px_24px_rgba(2,8,23,0.18)] backdrop-blur-md",
        className
      )}
    >
      <Languages className="mr-1.5 size-3.5 shrink-0 text-primary" aria-hidden />
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-7 min-w-[96px] max-w-[132px] items-center justify-between gap-1.5 rounded-full border border-border/55 bg-transparent px-2 text-xs font-semibold text-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/50 sm:min-w-[104px] sm:max-w-[146px]"
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <span className="shrink-0">{active.flag}</span>
          <span className="truncate">{active.label}</span>
        </span>
        <ChevronDown className={cn("size-3 text-foreground/65 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.45rem)] z-[140] w-[min(88vw,270px)] overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="mb-1.5 flex items-center gap-2 rounded-xl border border-border/60 bg-foreground/[0.03] px-2.5 py-1.5">
            <Search className="size-3.5 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language..."
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/45"
            />
          </div>
          <div
            role="listbox"
            aria-label="Language options"
            className="max-h-72 overflow-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/25"
          >
            {filtered.map((option) => {
              const selected = option.code === active.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => onSelect(option.code)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition",
                    selected ? "bg-primary/12 text-foreground" : "text-foreground/80 hover:bg-foreground/[0.06]"
                  )}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span>{option.flag}</span>
                    <span>{option.label}</span>
                  </span>
                  {selected ? <Check className="size-4 text-primary" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .goog-te-banner-frame.skiptranslate {
          display: none !important;
        }
        body,
        html {
          top: 0 !important;
        }
      `}</style>
    </div>
  );
}
