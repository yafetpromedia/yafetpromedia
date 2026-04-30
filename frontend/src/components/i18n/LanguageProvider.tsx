"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Language = "en" | "am";

type Dictionary = Record<string, string>;

const messages: Record<Language, Dictionary> = {
  en: {
    navSystems: "Systems",
    navServices: "Services",
    navProducts: "Products",
    navCaseStudies: "Case Studies",
    navTrust: "Trust",
    navProcessFaq: "Process & FAQ",
    navProcess: "Process",
    navFaq: "FAQ",
    contactSales: "Contact Sales",
    startProject: "Send a request",
    bookCall: "Book Call",
    login: "Login",
    admin: "Admin",
    aiAssistant: "AI Assistant",
    typeMessage: "Type your message...",
    send: "Send",
    talk: "Talk",
    stop: "Stop",
    greeting:
      "Hi! I am your AI assistant. Ask me about services, pricing, timelines, or the best setup for your business.",
  },
  am: {
    navSystems: "ሲስተሞች",
    navServices: "አገልግሎቶች",
    navProducts: "ምርቶች",
    navCaseStudies: "የስኬት ታሪኮች",
    navTrust: "ታማኝነት",
    navProcessFaq: "ሂደት እና ጥያቄዎች",
    navProcess: "ሂደት",
    navFaq: "ጥያቄዎች",
    contactSales: "ሽያጭ ያነጋግሩ",
    startProject: "ጥያቄ ላክ",
    bookCall: "ጥሪ ያዙ",
    login: "ግባ",
    admin: "አስተዳዳሪ",
    aiAssistant: "AI ረዳት",
    typeMessage: "መልዕክት ይጻፉ...",
    send: "ላክ",
    talk: "ተናገር",
    stop: "አቁም",
    greeting:
      "ሰላም! እኔ የእርስዎ AI ረዳት ነኝ። ስለ አገልግሎቶች፣ ዋጋ፣ ጊዜ እና ለቢዝነስዎ የሚመች መፍትሄ ይጠይቁኝ።",
  },
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string) => messages[language][key] ?? key,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
