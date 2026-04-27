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
    startProject: "Start a Project",
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
    heroHeadline: "We",
    heroHighlight: "deliver full digital solutions",
    heroTail: "for your brand, team, and operations.",
    heroBadge: "End-to-end digital",
    heroStatSystemsActive: "Systems Active",
    heroStatUptime: "uptime",
    heroStatClientsDeployed: "Clients Deployed",
    heroStatOrgs: "orgs",
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
    startProject: "ፕሮጀክት ጀምር",
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
    heroHeadline: "እኛ ",
    heroHighlight: "ሙሉ ዲጂታል መፍትሄዎች",
    heroTail: "ለምርት ስምህ እና ስራዎ ።",
    heroBadge: "ከመጀመሪያ እስከ መድረሻ ዲጂታል",
    heroStatSystemsActive: "ሲስተሞች ንቁ",
    heroStatUptime: "ሥራ ሰዓት",
    heroStatClientsDeployed: "የተግብሩ ደንበኞች",
    heroStatOrgs: "ድርጅቶች",
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
