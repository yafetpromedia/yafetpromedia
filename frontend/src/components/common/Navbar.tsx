"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Menu, X, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import GoogleTranslateWidget from "@/components/i18n/GoogleTranslateWidgetStable";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { useHydrated } from "@/lib/use-hydrated";
import { NAV_SECTION_GROUPS, collectHashSectionHrefs } from "@/lib/nav-sections";

type ResolvedNavGroup = {
  name: string;
  href: string;
  children: { name: string; href: string; description?: string }[];
};

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolveHref = useCallback((href: string) => {
    if (href.startsWith("#")) return pathname === "/" ? href : `/${href}`;
    return href;
  }, [pathname]);

  const navGroups = useMemo<ResolvedNavGroup[]>(
    () =>
      NAV_SECTION_GROUPS.map((group) => ({
        name: t(group.labelKey),
        href: group.href,
        children: group.children.map((child) => ({
          name: t(child.labelKey),
          href: child.href,
          description: child.descriptionKey ? t(child.descriptionKey) : undefined,
        })),
      })),
    [t]
  );

  const sectionHrefs = useMemo(() => collectHashSectionHrefs(), []);

  const isHrefActive = useCallback(
    (href: string) => {
      if (href.startsWith("/")) {
        return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
      }
      return pathname === "/" && activeSection === href;
    },
    [pathname, activeSection]
  );

  const isGroupActive = useCallback(
    (group: ResolvedNavGroup) => {
      if (isHrefActive(group.href)) return true;
      return group.children.some((child) => isHrefActive(child.href));
    },
    [isHrefActive]
  );

  const openMenu = (name: string) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setOpenDropdown(name);
  };

  const scheduleCloseMenu = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      if (pathname !== "/") return;

      const sectionMeta = sectionHrefs
        .map((href) => {
          const id = href.replace("#", "");
          const section = document.getElementById(id);
          return section ? { href, top: section.offsetTop } : null;
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
  }, [pathname, sectionHrefs]);

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

  useEffect(() => {
    if (!isMobileMenuOpen) setExpandedMobile(null);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const closeMenusOnScroll = () => {
      setOpenDropdown(null);
    };
    window.addEventListener("scroll", closeMenusOnScroll, { passive: true });
    return () => window.removeEventListener("scroll", closeMenusOnScroll);
  }, []);

  const pillActive = "bg-foreground text-background shadow-sm";
  const pillIdle = "text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06]";

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          // Always notranslate: nav uses t() dictionaries (avoids hydration mismatch)
          "notranslate fixed left-0 right-0 z-50 transition-all duration-500",
          isScrolled ? "top-3" : "top-5"
        )}
      >
        <div className="flex w-full justify-center px-3 sm:px-4">
          <div
            className={cn(
              "flex w-full max-w-7xl items-center justify-between gap-2 rounded-full border transition-all duration-500",
              isScrolled
                ? "border-border/70 bg-card/95 px-3 py-2 shadow-sm backdrop-blur-xl sm:px-4 sm:py-2.5"
                : "border-border/50 bg-card/80 px-3 py-2 backdrop-blur-md sm:px-4 sm:py-2.5"
            )}
          >
            <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
              <div className="relative flex size-8 items-center justify-center overflow-hidden rounded-full border border-border bg-white p-1 shadow-sm transition-colors group-hover:border-foreground/20 sm:size-9 dark:border-white/20">
                <Image
                  src={logoSrc}
                  alt="Awud Digitals Logo"
                  width={32}
                  height={32}
                  className="h-full w-full object-contain"
                  priority
                  unoptimized={shouldUseUnoptimizedImage(logoSrc)}
                />
              </div>
              <span className="hidden truncate text-base font-semibold tracking-tight text-foreground md:block xl:text-lg">
                Awud Digitals
              </span>
            </Link>

            {/* Desktop links only from xl (1280+) — prevents crush at ~1024 */}
            <div className="hidden min-w-0 items-center gap-0.5 rounded-full border border-border/60 bg-background/50 px-1 py-1 xl:flex">
              {navGroups.map((group) => {
                const active = isGroupActive(group);
                const isOpen = openDropdown === group.name;
                const hasMenu = group.children.length > 1;

                if (!hasMenu) {
                  const only = group.children[0] ?? { name: group.name, href: group.href };
                  return (
                    <Link
                      key={group.name}
                      href={resolveHref(only.href)}
                      className={cn(
                        "rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300 2xl:px-3.5 2xl:text-sm",
                        isHrefActive(only.href) ? pillActive : pillIdle
                      )}
                    >
                      {group.name}
                    </Link>
                  );
                }

                return (
                  <div
                    key={group.name}
                    className="relative"
                    onMouseEnter={() => openMenu(group.name)}
                    onMouseLeave={scheduleCloseMenu}
                  >
                    <button
                      type="button"
                      className={cn(
                        "inline-flex items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300 2xl:gap-1 2xl:px-3.5 2xl:text-sm",
                        active || isOpen ? pillActive : pillIdle
                      )}
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      onClick={() => setOpenDropdown((prev) => (prev === group.name ? null : group.name))}
                    >
                      {group.name}
                      <ChevronDown
                        className={cn("size-3.5 opacity-80 transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute left-1/2 top-[calc(100%+0.45rem)] z-50 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2"
                          role="menu"
                          onMouseEnter={() => openMenu(group.name)}
                          onMouseLeave={scheduleCloseMenu}
                        >
                          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card p-1.5 shadow-sm">
                            {group.children.map((child) => (
                              <Link
                                key={`${group.name}-${child.href}`}
                                href={resolveHref(child.href)}
                                role="menuitem"
                                className={cn(
                                  "block rounded-xl px-3.5 py-2.5 transition-colors",
                                  isHrefActive(child.href)
                                    ? "bg-muted text-foreground"
                                    : "text-foreground/75 hover:bg-muted/70 hover:text-foreground"
                                )}
                                onClick={() => setOpenDropdown(null)}
                              >
                                <span className="block text-sm font-semibold">{child.name}</span>
                                {child.description ? (
                                  <span className="mt-0.5 block text-xs leading-relaxed text-foreground/50">
                                    {child.description}
                                  </span>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <GoogleTranslateWidget className="origin-right scale-[0.88] sm:scale-95 xl:scale-100" />
              <ThemeToggle className="size-9" />
              <Link
                href={pathname === "/" ? "#contact" : "/#contact"}
                className="group hidden h-9 items-center rounded-full bg-foreground px-4 text-[13px] font-semibold text-background transition-opacity hover:opacity-90 xl:inline-flex 2xl:h-10 2xl:px-5 2xl:text-sm"
              >
                {t("startProject")}
                <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                className="relative z-50 inline-flex size-10 items-center justify-center text-foreground/70 hover:text-foreground xl:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
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

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 overflow-y-auto bg-background/95 px-5 pb-8 pt-24 backdrop-blur-xl xl:hidden"
          >
            <div className="mx-auto flex max-w-md flex-col gap-2">
              {navGroups.map((group, i) => {
                const hasMenu = group.children.length > 1;
                const expanded = expandedMobile === group.name;

                if (!hasMenu) {
                  const only = group.children[0] ?? { name: group.name, href: group.href };
                  return (
                    <motion.div
                      key={group.name}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.35 }}
                    >
                      <Link
                        href={resolveHref(only.href)}
                        className={cn(
                          "block rounded-2xl border px-4 py-3.5 text-lg font-display font-bold transition-colors",
                          isHrefActive(only.href)
                            ? "border-foreground/20 bg-foreground text-background"
                            : "border-border/70 text-foreground/80 hover:bg-muted"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {group.name}
                      </Link>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={group.name}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                    className="overflow-hidden rounded-2xl border border-border/70"
                  >
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-3.5 text-left text-lg font-display font-bold transition-colors",
                        isGroupActive(group) ? "bg-muted text-foreground" : "text-foreground/85"
                      )}
                      onClick={() => setExpandedMobile((prev) => (prev === group.name ? null : group.name))}
                      aria-expanded={expanded}
                    >
                      {group.name}
                      <ChevronDown className={cn("size-5 transition-transform", expanded && "rotate-180")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {expanded ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="border-t border-border/60 bg-foreground/[0.02]"
                        >
                          <div className="space-y-1 p-2">
                            {group.children.map((child) => (
                              <Link
                                key={`${group.name}-${child.href}`}
                                href={resolveHref(child.href)}
                                className={cn(
                                  "block rounded-xl px-3 py-2.5 transition-colors",
                                  isHrefActive(child.href)
                                    ? "bg-muted text-foreground"
                                    : "text-foreground/75 hover:bg-muted/70 hover:text-foreground"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span className="block text-sm font-semibold">{child.name}</span>
                                {child.description ? (
                                  <span className="mt-0.5 block text-xs text-foreground/50">{child.description}</span>
                                ) : null}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              className="mx-auto mt-8 flex max-w-md flex-col gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href={pathname === "/" ? "#contact" : "/#contact"}
                className="inline-flex h-12 w-full items-center justify-center rounded-full bg-foreground text-base font-semibold text-background transition-opacity hover:opacity-90"
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
