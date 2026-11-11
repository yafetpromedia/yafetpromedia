"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { snapshotEnglishOriginals, translatePage } from "@/lib/dom-translator";
import {
  type AppLanguage,
  LANG_COOKIE,
  LANG_STORAGE_KEY,
  htmlDirFor,
  htmlLangFor,
  isAppLanguage,
} from "@/lib/app-language";

export type { AppLanguage } from "@/lib/app-language";
export { LANG_OPTIONS } from "@/lib/app-language";

type Dictionary = Record<string, string>;

const en: Dictionary = {
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
  navPricing: "Pricing",
  navPricingDesc: "Packages and starting points",
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
    "Hi — I'm {name}, your Awud Digitals assistant. Ask about services, pricing, or timelines — or switch to the Plan tab for a guided project brief.",
};

const am: Dictionary = {
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
  navPricing: "ዋጋ",
  navPricingDesc: "ጥቅሎች እና መነሻ ነጥቦች",
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
    "ሰላም — እኔ {name} ነኝ፣ የAwud Digitals ረዳት። ስለ አገልግሎቶች፣ ዋጋ ወይም ጊዜ ይጠይቁ — ወይም ለመመሪያ brief Plan ትር ይጠቀሙ።",
};

const ar: Dictionary = {
  navSystems: "الأنظمة",
  navEcosystem: "النظام البيئي",
  navServices: "الخدمات",
  navProducts: "المنتجات",
  navCaseStudies: "الأعمال",
  navInsights: "رؤى",
  navAbout: "من نحن",
  navTrust: "الثقة",
  navProcessFaq: "العملية والأسئلة",
  navProcess: "العملية",
  navFaq: "الأسئلة",
  navPricing: "التسعير",
  navPricingDesc: "الباقات ونقاط البداية",
  navEcosystemPlatform: "منصة الشركة",
  navEcosystemPlatformDesc: "الشركة الأم ونظام المنتجات",
  navSystemsDesc: "بنية متكاملة للنمو",
  navServicesDesc: "التنفيذ والعلامة والعمليات",
  navServicesOverview: "كل الخدمات",
  navProcessFaqDesc: "كيف نعمل والأسئلة الشائعة",
  navProductsDesc: "Mr.Software ومجموعة المنتجات",
  navProductsCatalog: "كتالوج المنتجات",
  navContact: "تواصل",
  navContactDesc: "ابدأ مشروعاً أو أرسل رسالة",
  navCaseStudiesDesc: "أعمال عملاء مختارة",
  navTrustDesc: "شركاء واعتمادات وإثبات",
  navInsightsDesc: "مدونة وأدلة ورؤى",
  navAboutYafet: "عن يافيت",
  navAboutYafetDesc: "قصة المؤسس والمهمة",
  contactSales: "تواصل مع المبيعات",
  startProject: "أرسل طلباً",
  bookCall: "احجز مكالمة",
  login: "تسجيل الدخول",
  admin: "الإدارة",
  aiAssistant: "مساعد الذكاء",
  typeMessage: "اسأل عن الخدمات أو التسعير أو الجداول…",
  send: "إرسال",
  talk: "تحدث",
  stop: "إيقاف",
  aiOnline: "متصل الآن",
  aiPowered: "ذكاء مباشر",
  aiReset: "محادثة جديدة",
  aiVoiceOn: "الرد الصوتي مفعّل",
  aiVoiceOff: "الرد الصوتي متوقف",
  aiPromptServices: "ما الخدمات التي تقدمونها؟",
  aiPromptPricing: "كيف يعمل التسعير؟",
  aiPromptTimeline: "الجدول الزمني المعتاد؟",
  aiPromptMrSoftware: "أخبرني عن Mr.Software",
  aiPromptPlan: "ساعدني في تخطيط مشروعي",
  aiOpenPlan: "افتح مخطط المشروع",
  aiPlanHint: "انتقل إلى تبويب الخطة لموجز موجّه مع تقديرات.",
  greeting:
    "مرحباً — أنا {name}، مساعد Awud Digitals. اسأل عن الخدمات أو التسعير أو الجداول — أو انتقل إلى تبويب الخطة لموجز مشروع موجّه.",
};

const de: Dictionary = {
  navSystems: "Systeme",
  navEcosystem: "Ökosystem",
  navServices: "Leistungen",
  navProducts: "Produkte",
  navCaseStudies: "Portfolio",
  navInsights: "Einblicke",
  navAbout: "Über uns",
  navTrust: "Vertrauen",
  navProcessFaq: "Ablauf & FAQ",
  navProcess: "Ablauf",
  navFaq: "FAQ",
  navPricing: "Preise",
  navPricingDesc: "Pakete und Einstiegspunkte",
  navEcosystemPlatform: "Unternehmensplattform",
  navEcosystemPlatformDesc: "Muttergesellschaft & Produktökosystem",
  navSystemsDesc: "Integrierte Infrastruktur für Wachstum",
  navServicesDesc: "Umsetzung, Marke und Betrieb",
  navServicesOverview: "Alle Leistungen",
  navProcessFaqDesc: "So arbeiten wir & häufige Fragen",
  navProductsDesc: "Mr.Software und Produktpalette",
  navProductsCatalog: "Produktkatalog",
  navContact: "Kontakt",
  navContactDesc: "Projekt starten oder Nachricht senden",
  navCaseStudiesDesc: "Ausgewählte Kundenprojekte",
  navTrustDesc: "Partner, Nachweise & Belege",
  navInsightsDesc: "Blog, Guides & Thought Leadership",
  navAboutYafet: "Über Yafet",
  navAboutYafetDesc: "Gründerstory & Mission",
  contactSales: "Vertrieb kontaktieren",
  startProject: "Anfrage senden",
  bookCall: "Anruf buchen",
  login: "Anmelden",
  admin: "Admin",
  aiAssistant: "KI-Assistent",
  typeMessage: "Fragen zu Leistungen, Preisen oder Zeitplänen…",
  send: "Senden",
  talk: "Sprechen",
  stop: "Stopp",
  aiOnline: "Jetzt online",
  aiPowered: "Live-KI",
  aiReset: "Neues Gespräch",
  aiVoiceOn: "Sprachantworten an",
  aiVoiceOff: "Sprachantworten aus",
  aiPromptServices: "Welche Leistungen bieten Sie an?",
  aiPromptPricing: "Wie funktioniert die Preisgestaltung?",
  aiPromptTimeline: "Typischer Projektzeitplan?",
  aiPromptMrSoftware: "Erzählen Sie mir von Mr.Software",
  aiPromptPlan: "Helfen Sie mir, mein Projekt zu planen",
  aiOpenPlan: "Projektplaner öffnen",
  aiPlanHint: "Wechseln Sie zum Plan-Tab für ein geführtes Briefing mit Schätzungen.",
  greeting:
    "Hallo — ich bin {name}, Ihr Awud Digitals Assistent. Fragen Sie zu Leistungen, Preisen oder Zeitplänen — oder wechseln Sie zum Plan-Tab für ein geführtes Projektbriefing.",
};

const messages: Partial<Record<AppLanguage, Dictionary>> = { en, am, ar, de };

function applyDocumentLang(lang: AppLanguage) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = htmlLangFor(lang);
  document.documentElement.dir = htmlDirFor(lang);
}

function persistLanguage(next: AppLanguage) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  try {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LANG_COOKIE}=${encodeURIComponent(next)};path=/;max-age=${maxAge};SameSite=Lax`;
  } catch {
    /* ignore */
  }
  applyDocumentLang(next);
  try {
    document.cookie = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    if (window.location.hash.includes("googtrans")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  } catch {
    /* ignore */
  }
}

type LanguageContextType = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string) => string;
  translating: boolean;
  translateProgress: number;
  translateError: string | null;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = "en",
}: {
  children: React.ReactNode;
  initialLanguage?: AppLanguage;
}) {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState(0);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    applyDocumentLang(language);
  }, [language]);

  // One-time: sync cookie if only localStorage had a preference (after hydrate).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (stored && isAppLanguage(stored) && stored !== initialLanguage) {
        persistLanguage(stored);
        setLanguageState(stored);
        return;
      }
      persistLanguage(initialLanguage);
    } catch {
      /* ignore */
    }
  }, [initialLanguage]);

  const runPageTranslate = useCallback(async (lang: AppLanguage) => {
    setTranslateError(null);
    setTranslating(lang !== "en");
    setTranslateProgress(0);
    try {
      snapshotEnglishOriginals();
      await translatePage(lang, (done, total) => {
        setTranslateProgress(total ? Math.round((done / total) * 100) : 100);
      });
    } catch {
      setTranslateError("Translation failed. Try again in a moment.");
    } finally {
      setTranslating(false);
      setTranslateProgress(100);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runPageTranslate(language);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [language, runPageTranslate]);

  const setLanguage = useCallback((next: AppLanguage) => {
    persistLanguage(next);
    startTransition(() => setLanguageState(next));
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string) => {
        const dict = messages[language] ?? messages.en!;
        return dict[key] ?? messages.en![key] ?? key;
      },
      translating,
      translateProgress,
      translateError,
    }),
    [language, setLanguage, translating, translateProgress, translateError]
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
