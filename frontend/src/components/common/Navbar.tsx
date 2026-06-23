"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import GoogleTranslateWidget from "@/components/i18n/GoogleTranslateWidgetStable";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { useHydrated } from "@/lib/use-hydrated";

export default function Navbar() {
  const { content, isLoading } = useSiteContent();
  const hydrated = useHydrated();
  const logoSrc =
    (hydrated && !isLoading ? content.siteLogoSrc : defaultSiteContent.siteLogoSrc) ||
    defaultSiteContent.siteLogoSrc;
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const resolveHref = useCallback((href: string) => {
    if (href.startsWith("#")) return pathname === "/" ? href : `/${href}`;
    return href;
  }, [pathname]);

  const isLinkActive = useCallback(
    (href: string) => {
      if (href.startsWith("/")) {
        return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
      }
      return pathname === "/" && activeSection === href;
    },
    [pathname, activeSection]
  );

  const navLinks = useMemo(
    () => [
      { name: t("navEcosystem"), href: "#ecosystem" },
      { name: t("navServices"), href: "#services" },
      { name: t("navProducts"), href: "#products" },
      { name: t("navCaseStudies"), href: "#case-studies" },
      { name: t("navInsights"), href: "#insights" },
      { name: t("navAbout"), href: "/about/yafet" },
    ],
    [t]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (pathname !== "/") return;

      const sectionMeta = navLinks
        .filter((link) => link.href.startsWith("#"))
        .map((link) => {
          const id = link.href.replace("#", "");
          const section = document.getElementById(id);
          return section ? { href: link.href, top: section.offsetTop } : null;
        })
        .filter((item): item is { href: string; top: number } => Boolean(item))
        .sort((a, b) => a.top - b.top);

      if (sectionMeta.length === 0) return;

      const scrollPosition = window.scrollY + 140;
      let currentSection = "";

      if (scrollPosition < sectionMeta[0].top) {
        setActiveSection("");
        return;
      }

      for (let i = 0; i < sectionMeta.length; i += 1) {
        const current = sectionMeta[i];
        const next = sectionMeta[i + 1];
        if (scrollPosition >= current.top && (!next || scrollPosition < next.top)) {
          currentSection = current.href;
          break;
        }
      }

      setActiveSection(currentSection);
    };

    const handleHashChange = () => {
      if (window.location.hash) {
        setActiveSection(window.location.hash);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [navLinks, pathname]);

  useEffect(() => {
    if (pathname === "/about/yafet") setActiveSection("/about/yafet");
    else if (pathname.startsWith("/blog/")) setActiveSection("#insights");
    else if (pathname !== "/") setActiveSection("");
  }, [pathname]);

  useEffect(() => {
    const handleSecretShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        window.location.href = "/login";
      }
    };
    window.addEventListener("keydown", handleSecretShortcut);
    return () => window.removeEventListener("keydown", handleSecretShortcut);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "top-4" : "top-6"
        )}
      >
        <div className="w-full px-4 flex justify-center">
          <div 
            className={cn(
              "flex items-center justify-between w-full max-w-7xl transition-all duration-500 rounded-full border",
              isScrolled 
                ? "bg-background/60 backdrop-blur-xl border-border py-3 px-6 shadow-2xl" 
                : "bg-transparent border-transparent py-4 px-0"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative size-10 rounded-xl overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center p-1 group-hover:border-primary/50 group-hover:bg-primary/15 transition-all duration-300">
                <Image
                  src={logoSrc}
                  alt="Yafetpromedia Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                  priority
                  unoptimized={shouldUseUnoptimizedImage(logoSrc)}
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 hidden sm:block">
                Yafetpromedia
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 bg-foreground/5 rounded-full px-2 py-1 border border-border">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={resolveHref(link.href)}
                  className={cn(
                    "text-sm font-medium px-4 py-2 rounded-full transition-all duration-300",
                    isLinkActive(link.href)
                      ? "text-primary-foreground bg-gradient-to-r from-primary to-[#ff9b4d] shadow-[0_8px_24px_rgba(255,106,0,0.35)]"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/10"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <GoogleTranslateWidget />
              <ThemeToggle />
              <Link
                href={pathname === "/" ? "#contact" : "/#contact"}
                className="rounded-full px-6 h-10 inline-flex items-center bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)] transition-all duration-300 group text-sm font-medium"
              >
                {t("startProject")}
                <ChevronRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <GoogleTranslateWidget className="scale-90 origin-right" />
              <ThemeToggle className="size-9" />
              <button
                className="relative z-50 p-2 text-foreground/70 hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.span key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }} className="block">
                      <X className="size-6" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }} transition={{ duration: 0.2 }} className="block">
                      <Menu className="size-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden pt-32 px-6 flex flex-col"
          >
            <div className="flex flex-col gap-6 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <Link
                    href={resolveHref(link.href)}
                    className={cn(
                      "text-3xl font-display font-bold transition-colors",
                      isLinkActive(link.href) ? "text-primary" : "text-foreground/70 hover:text-foreground"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            
            <motion.div 
              className="mt-12 flex flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href={pathname === "/" ? "#contact" : "/#contact"}
                className="w-full rounded-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("startProject")}
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
