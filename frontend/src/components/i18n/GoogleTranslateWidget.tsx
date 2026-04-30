"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Languages, Search } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
            autoDisplay?: boolean;
            layout?: number;
          },
          elementId: string
        ) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
    __googleTranslateInitialized?: boolean;
  }
}

function ensureGoogleTranslateScript() {
  const existing = document.querySelector<HTMLScriptElement>('script[data-google-translate="true"]');
  if (existing) return;
  const script = document.createElement("script");
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  script.defer = true;
  script.setAttribute("data-google-translate", "true");
  document.body.appendChild(script);
}

const GLOBAL_TRANSLATE_HOST_ID = "google-translate-global-host";

type DynamicLanguageOption = { code: string; label: string; native: string };
const SUPPORTED_CODES = [
  "af","sq","am","ar","hy","az","eu","be","bn","bs","bg","ca","ceb","ny","zh-CN","zh-TW","co","hr","cs","da",
  "nl","en","eo","et","tl","fi","fr","fy","gl","ka","de","el","gu","ht","ha","haw","he","hi","hmn","hu","is",
  "ig","id","ga","it","ja","jw","kn","kk","km","ko","ku","ky","lo","la","lv","lt","lb","mk","mg","ms","ml",
  "mt","mi","mr","mn","my","ne","no","or","ps","fa","pl","pt","pa","ro","ru","sm","gd","sr","st","sn","sd",
  "si","sk","sl","so","es","su","sw","sv","tg","ta","te","th","tr","uk","ur","uz","vi","cy","xh","yi","yo","zu"
];
const FULL_INCLUDED_LANGUAGES = SUPPORTED_CODES.join(",");

function getDefaultLanguageOptions(): DynamicLanguageOption[] {
  const displayNames =
    typeof Intl !== "undefined" && "DisplayNames" in Intl
      ? new Intl.DisplayNames(["en"], { type: "language" })
      : null;
  return SUPPORTED_CODES.map((code) => {
    const base = code.split("-")[0];
    const label = displayNames?.of(base) ?? code;
    const nativeDisplay =
      typeof Intl !== "undefined" && "DisplayNames" in Intl
        ? new Intl.DisplayNames([base], { type: "language" }).of(base) ?? label
        : label;
    return { code, label, native: nativeDisplay };
  }).sort((a, b) => a.label.localeCompare(b.label));
}

function setGoogTransCookie(code: string) {
  const value = `/en/${code}`;
  const cookie = `googtrans=${value};path=/;max-age=31536000`;
  document.cookie = cookie;
  document.cookie = `${cookie};domain=${window.location.hostname}`;
}

function readCurrentLanguage(): string {
  const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-z-]+)/i);
  return m?.[1] ?? "en";
}

function parseComboLanguages(): DynamicLanguageOption[] {
  const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
  if (!combo) return [];
  const options = [...combo.options]
    .map((opt) => ({ code: opt.value?.trim(), label: opt.text?.trim() }))
    .filter((opt) => opt.code && opt.label && opt.code !== "auto")
    .map((opt) => ({ code: opt.code, label: opt.label, native: opt.label }));
  return options;
}

function formatLanguageLabel(option: DynamicLanguageOption): string {
  const english = option.label.trim();
  const native = option.native.trim() || english;
  return `${getLanguageFlag(option.code)} ${native} (${english})`;
}

function getLanguageFlag(code: string): string {
  const base = code.toLowerCase().split("-")[0];
  const map: Record<string, string> = {
    af: "🇿🇦",
    am: "🇪🇹",
    ar: "🇸🇦",
    az: "🇦🇿",
    be: "🇧🇾",
    bg: "🇧🇬",
    bn: "🇧🇩",
    bs: "🇧🇦",
    ca: "🇪🇸",
    cs: "🇨🇿",
    cy: "🏴",
    da: "🇩🇰",
    de: "🇩🇪",
    el: "🇬🇷",
    en: "🇬🇧",
    es: "🇪🇸",
    et: "🇪🇪",
    eu: "🇪🇸",
    fa: "🇮🇷",
    fi: "🇫🇮",
    fr: "🇫🇷",
    ga: "🇮🇪",
    gl: "🇪🇸",
    gu: "🇮🇳",
    ha: "🇳🇬",
    he: "🇮🇱",
    hi: "🇮🇳",
    hr: "🇭🇷",
    hu: "🇭🇺",
    hy: "🇦🇲",
    id: "🇮🇩",
    ig: "🇳🇬",
    is: "🇮🇸",
    it: "🇮🇹",
    ja: "🇯🇵",
    ka: "🇬🇪",
    kk: "🇰🇿",
    km: "🇰🇭",
    kn: "🇮🇳",
    ko: "🇰🇷",
    ku: "🇮🇶",
    ky: "🇰🇬",
    lo: "🇱🇦",
    lt: "🇱🇹",
    lv: "🇱🇻",
    mk: "🇲🇰",
    ml: "🇮🇳",
    mn: "🇲🇳",
    mr: "🇮🇳",
    ms: "🇲🇾",
    mt: "🇲🇹",
    my: "🇲🇲",
    ne: "🇳🇵",
    nl: "🇳🇱",
    no: "🇳🇴",
    pa: "🇮🇳",
    pl: "🇵🇱",
    ps: "🇦🇫",
    pt: "🇵🇹",
    ro: "🇷🇴",
    ru: "🇷🇺",
    sd: "🇵🇰",
    si: "🇱🇰",
    sk: "🇸🇰",
    sl: "🇸🇮",
    so: "🇸🇴",
    sq: "🇦🇱",
    sr: "🇷🇸",
    st: "🇱🇸",
    su: "🇮🇩",
    sv: "🇸🇪",
    sw: "🇹🇿",
    ta: "🇮🇳",
    te: "🇮🇳",
    th: "🇹🇭",
    tl: "🇵🇭",
    tr: "🇹🇷",
    uk: "🇺🇦",
    ur: "🇵🇰",
    uz: "🇺🇿",
    vi: "🇻🇳",
    xh: "🇿🇦",
    yi: "🇮🇱",
    yo: "🇳🇬",
    zh: "🇨🇳",
    zu: "🇿🇦",
  };
  return map[base] ?? "🌐";
}

export default function GoogleTranslateWidget({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string>("en");
  const [languages, setLanguages] = useState<DynamicLanguageOption[]>(() => getDefaultLanguageOptions());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter((o) => o.label.toLowerCase().includes(q) || o.code.toLowerCase().includes(q));
  }, [languages, query]);

  const active = useMemo(
    () => languages.find((o) => o.code === language) ?? { code: "en", label: "English", native: "English" },
    [language, languages]
  );

  useEffect(() => {
    setLanguage(readCurrentLanguage());
  }, []);

  useEffect(() => {
    const ensureGlobalHost = () => {
      let host = document.getElementById(GLOBAL_TRANSLATE_HOST_ID);
      if (host) return host;
      host = document.createElement("div");
      host.id = GLOBAL_TRANSLATE_HOST_ID;
      host.className = "google-translate-host pointer-events-none absolute -z-10 h-0 w-0 overflow-hidden opacity-0";
      document.body.appendChild(host);
      return host;
    };

    const init = () => {
      if (window.__googleTranslateInitialized) return;
      if (!window.google?.translate?.TranslateElement) return;
      const target = ensureGlobalHost();
      if (!target) return;
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: FULL_INCLUDED_LANGUAGES,
          autoDisplay: false,
        },
        GLOBAL_TRANSLATE_HOST_ID
      );
      window.__googleTranslateInitialized = true;

      window.setTimeout(() => {
        const parsed = parseComboLanguages();
        if (parsed.length > 5) {
          setLanguages(parsed);
        }
      }, 400);
    };

    window.googleTranslateElementInit = init;
    init();
    ensureGoogleTranslateScript();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    const normalizeGoogleChrome = () => {
      document.body.style.top = "0px";
      document.documentElement.style.top = "0px";
      const banner = document.querySelector<HTMLElement>(".skiptranslate");
      if (banner) banner.style.display = "none";
    };
    normalizeGoogleChrome();
    const observer = new MutationObserver(normalizeGoogleChrome);
    observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const applyLanguage = (code: string) => {
    setLanguage(code);
    setGoogTransCookie(code);
    const combo = document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (combo && [...combo.options].some((opt) => opt.value === code)) {
      combo.value = code;
      combo.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      window.location.reload();
    }
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border/70 bg-foreground/5 px-3.5 text-sm text-foreground/90 transition hover:bg-foreground/[0.08]"
      >
        <Languages className="size-4 text-primary" />
        <span className="font-medium">{active.code.toUpperCase()}</span>
        <ChevronDown className={cn("size-4 text-foreground/55 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.55rem)] z-[120] w-[min(86vw,300px)] overflow-hidden rounded-2xl border border-border/70 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl">
          <div className="sticky top-0 z-10 mb-1.5 flex items-center gap-2 rounded-xl border border-border/60 bg-background/95 px-2.5 py-2 backdrop-blur">
            <Search className="size-3.5 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language..."
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-foreground/45"
            />
          </div>
          <div className="max-h-72 overflow-auto pr-1 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/25">
            {filtered.map((option) => {
            const isActive = option.code === language;
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => applyLanguage(option.code)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition",
                  isActive ? "bg-primary/12 text-foreground" : "text-foreground/80 hover:bg-foreground/[0.06]"
                )}
              >
                <span className="text-sm">{formatLanguageLabel(option)}</span>
                {isActive ? <Check className="size-4 text-primary" /> : null}
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
        .skiptranslate {
          display: none !important;
        }
        body {
          top: 0 !important;
        }
        html {
          top: 0 !important;
        }
        #goog-gt-tt,
        .goog-te-balloon-frame,
        .goog-tooltip,
        .goog-tooltip:hover {
          display: none !important;
        }
        .goog-text-highlight {
          background: transparent !important;
          box-shadow: none !important;
        }
        iframe.goog-te-menu-frame {
          display: none !important;
        }
        .google-translate-host .goog-te-gadget {
          opacity: 0 !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
    </div>
  );
}

