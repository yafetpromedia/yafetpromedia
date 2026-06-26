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
    navEcosystemPlatform: "Company platform",
    navEcosystemPlatformDesc: "Parent company & product ecosystem",
    navSystemsDesc: "Integrated infrastructure for scale",
    navServicesDesc: "Delivery, brand, and operations",
    navServicesOverview: "All services",
    navProcessFaqDesc: "How we work & common questions",
    navProductsDesc: "Mr.Software and product suite",
    navProductsCatalog: "Product catalog",
    navContact: "Contact",
    navContactDesc: "Start a project or send a message",
    navCaseStudiesDesc: "Selected client work",
    navTrustDesc: "Partners, credentials & proof",
    navInsightsDesc: "Blog, guides & thought leadership",
    navAboutYafet: "About Yafet",
    navAboutYafetDesc: "Founder story & mission",
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
    aiPromptPlan: "Help me plan my project",
    aiOpenPlan: "Open Project Planner",
    aiPlanHint: "Switch to the Plan tab for a guided brief with estimates.",
    greeting:
      "Hi — I'm {name}, your Yafetpromedia assistant. Ask about services, pricing, or timelines — or switch to the Plan tab for a guided project brief.",
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
    navEcosystemPlatform: "የኩባንያ መድረክ",
    navEcosystemPlatformDesc: "ዋና ኩባንያ እና የምርት ኢኮሲስተም",
    navSystemsDesc: "ለማስፋፋት የተዋሃደ መሠረተ ልማት",
    navServicesDesc: "ማስረከብ፣ ብራንድ እና ክወና",
    navServicesOverview: "ሁሉም አገልግሎቶች",
    navProcessFaqDesc: "እንዴት እንሰራ እና ተደጋጋሚ ጥያቄዎች",
    navProductsDesc: "Mr.Software እና የምርት ስፔር",
    navProductsCatalog: "የምርት ካታሎግ",
    navContact: "አግኙን",
    navContactDesc: "ፕሮጀክት ይጀምሩ ወይም መልእክት ይላኩ",
    navCaseStudiesDesc: "የተመረጡ የደንበኞች ስራዎች",
    navTrustDesc: "አጋሮች፣ ማስረጃዎች እና መዝገቦች",
    navInsightsDesc: "ብሎግ፣ መመሪያዎች እና አስተያየቶች",
    navAboutYafet: "ስለ ያፌት",
    navAboutYafetDesc: "የመስራች ታሪክ እና ተልዕኮ",
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
    aiPromptPlan: "ፕሮጀክቴን እቅድ አዘጋጅ",
    aiOpenPlan: "የፕሮጀክት Planner ክፈት",
    aiPlanHint: "ለመመሪያ brief እና ግምቶች Plan ትር ይጠቀሙ።",
    greeting:
      "ሰላም — እኔ {name} ነኝ፣ የYafetpromedia ረዳት። ስለ አገልግሎቶች፣ ዋጋ ወይም ጊዜ ይጠይቁ — ወይም ለመመሪያ brief Plan ትር ይጠቀሙ።",
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
