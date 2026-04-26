"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export default function Navbar() {
  const { t } = useLanguage();
  const navLinks = [
    { name: t("navSystems"), href: "#systems" },
    { name: t("navServices"), href: "#services" },
    { name: t("navProducts"), href: "#products" },
    { name: t("navCaseStudies"), href: "#case-studies" },
    { name: t("navProcess"), href: "#process" },
    { name: t("navFaq"), href: "#faq" },
  ];
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
                  src="/images/navbar/hero image.svg"
                  alt="Yafet Pro Media Logo"
                  width={32}
                  height={32}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 hidden sm:block">
                Yafet<span className="text-foreground/50 font-normal">Pro</span>Media
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1 bg-foreground/5 rounded-full px-2 py-1 border border-border">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/10 px-4 py-2 rounded-full transition-all duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <Link href="#contact" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                {t("contactSales")}
              </Link>
              <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">{t("login")}</Link>
              <Link href="/admin" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">{t("admin")}</Link>
              <LanguageToggle />
              <ThemeToggle />
              <Link
                href="#contact"
                className="rounded-full px-6 h-10 inline-flex items-center bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(255,106,0,0.3)] hover:shadow-[0_0_30px_rgba(255,106,0,0.5)] transition-all duration-300 group text-sm font-medium"
              >
                {t("startProject")}
                <ChevronRight className="ml-1 size-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageToggle className="scale-90 origin-right" />
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
                    href={link.href}
                    className="text-3xl font-display font-bold text-foreground/70 hover:text-foreground"
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
                href="#contact"
                className="w-full rounded-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("startProject")}
              </Link>
              <Link
                href="#contact"
                className="w-full rounded-full h-14 text-lg border border-border bg-transparent text-foreground inline-flex items-center justify-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t("contactSales")}
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl border border-border h-12 inline-flex items-center justify-center">{t("login")}</Link>
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl border border-border h-12 inline-flex items-center justify-center">{t("admin")}</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
