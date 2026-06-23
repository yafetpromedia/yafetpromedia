"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Language = "en" | "am";

type Dictionary = Record<string, string>;

const messages: Record<Language, Dictionary> = {
  en: {
    navSystems: "Systems",
    navEcosystem: "Ecosystem",
    navServices: "Services",
    navProducts: "Products",
    navCaseStudies: "Portfolio",
    navInsights: "Insights",
    navAbout: "About",
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
    typeMessage: "Ask about services, pricing, or timelines…",
    send: "Send",
    talk: "Talk",
    stop: "Stop",
    aiOnline: "Online now",
    aiPowered: "Live AI",
    aiReset: "New conversation",
    aiVoiceOn: "Voice replies on",
    aiVoiceOff: "Voice replies off",
    aiPromptServices: "What services do you offer?",
    aiPromptPricing: "How does pricing work?",
    aiPromptTimeline: "Typical project timeline?",
    aiPromptMrSoftware: "Tell me about Mr.Software",
    greeting:
      "Hi — I'm {name}, your Yafetpromedia assistant. Ask me about services, pricing, timelines, or the right setup for your business.",
  },
  am: {
    navSystems: "ሲስተሞች",
    navEcosystem: "ኢኮሲስተም",
    navServices: "አገልግሎቶች",
    navProducts: "ምርቶች",
    navCaseStudies: "ፖርትፎሊዮ",
    navInsights: "ግንዛቤዎች",
    navAbout: "ስለ እኛ",
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
    typeMessage: "ስለ አገልግሎት፣ ዋጋ ወይም ጊዜ ይጠይቁ…",
    send: "ላክ",
    talk: "ተናገር",
    stop: "አቁም",
    aiOnline: "አሁን በመስመር ላይ",
    aiPowered: "ቀጥታ AI",
    aiReset: "አዲስ ውይይት",
    aiVoiceOn: "ድምጽ መልስ በርቷል",
    aiVoiceOff: "ድምጽ መልስ ጠፍቷል",
    aiPromptServices: "ምን አገልግሎቶች አሉ?",
    aiPromptPricing: "ዋጋ እንዴት ይሰራል?",
    aiPromptTimeline: "ተራ ፕሮጀክት ጊዜ?",
    aiPromptMrSoftware: "ስለ Mr.Software ንገረኝ",
    greeting:
      "ሰላም — እኔ {name} ነኝ፣ የYafetpromedia ረዳት። ስለ አገልግሎቶች፣ ዋጋ፣ ጊዜ ወይም ለቢዝነስዎ የሚመች መፍትሄ ይጠይቁኝ።",
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
