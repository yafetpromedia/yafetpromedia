export type AppLanguage =
  | "en"
  | "am"
  | "ar"
  | "de"
  | "es"
  | "fr"
  | "hi"
  | "it"
  | "ja"
  | "ko"
  | "om"
  | "pt"
  | "ru"
  | "sw"
  | "ti"
  | "tr"
  | "zh-CN";

export const LANG_COOKIE = "awud-preferred-lang";
export const LANG_STORAGE_KEY = "awud-preferred-lang";

export const LANG_OPTIONS: { code: AppLanguage; label: string; flag: string }[] = [
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
];

export function isAppLanguage(value: string): value is AppLanguage {
  return LANG_OPTIONS.some((l) => l.code === value);
}

export function parseAppLanguage(value: string | undefined | null): AppLanguage {
  if (value && isAppLanguage(value)) return value;
  return "en";
}

export function htmlLangFor(lang: AppLanguage): string {
  return lang === "zh-CN" ? "zh-CN" : lang;
}

export function htmlDirFor(lang: AppLanguage): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr";
}
