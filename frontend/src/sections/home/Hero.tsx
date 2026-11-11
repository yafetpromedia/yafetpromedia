"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/animations/FadeIn";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { useHydrated } from "@/lib/use-hydrated";

const CAROUSEL_INTERVAL_MS = 6500;

export default function Hero() {
  const { t } = useLanguage();
  const { content, isLoading } = useSiteContent();
  const hydrated = useHydrated();
  const ref = useRef<HTMLDivElement>(null);
  const carouselRegionRef = useRef<HTMLDivElement>(null);
  const { heroHeadline, heroHighlight, heroTail, heroBadge } = content;
  const reduceMotion = useReducedMotion();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselDir, setCarouselDir] = useState(1);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const heroSlides = useMemo(() => {
    const source =
      hydrated && !isLoading ? content.heroCarouselSlides : defaultSiteContent.heroCarouselSlides;
    return source.map((s) => ({
      key: s.id,
      src: s.src,
      alt: s.alt,
    }));
  }, [content.heroCarouselSlides, hydrated, isLoading]);

  useEffect(() => {
    startTransition(() => {
      setCarouselIndex((i) => Math.min(i, Math.max(0, heroSlides.length - 1)));
    });
  }, [heroSlides.length]);

  const nextSlide = useCallback(() => {
    const len = heroSlides.length;
    if (len < 2) return;
    setCarouselDir(1);
    setCarouselIndex((i) => (i + 1) % len);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    const len = heroSlides.length;
    if (len < 2) return;
    setCarouselDir(-1);
    setCarouselIndex((i) => (i - 1 + len) % len);
  }, [heroSlides.length]);

  const goToSlide = useCallback(
    (wrapped: number) => {
      const len = heroSlides.length;
      if (len === 0 || wrapped === carouselIndex) return;
      let d: 1 | -1;
      if (carouselIndex === len - 1 && wrapped === 0) d = 1;
      else if (carouselIndex === 0 && wrapped === len - 1) d = -1;
      else d = wrapped > carouselIndex ? 1 : -1;
      setCarouselDir(d);
      setCarouselIndex(wrapped);
    },
    [carouselIndex, heroSlides.length]
  );

  useEffect(() => {
    if (reduceMotion || carouselPaused || heroSlides.length < 2) return;
    const id = window.setInterval(() => {
      setCarouselDir(1);
      setCarouselIndex((i) => (i + 1) % heroSlides.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, carouselPaused, heroSlides.length]);

  useEffect(() => {
    const el = carouselRegionRef.current;
    if (!el || heroSlides.length < 2) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevSlide();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextSlide();
      }
    };
    el.tabIndex = 0;
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [heroSlides.length, nextSlide, prevSlide]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: reduceMotion ? 0 : direction * 20,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: reduceMotion ? 0 : direction * -20,
      opacity: 0,
    }),
  };

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[min(88vh,820px)] flex-col overflow-hidden bg-background pb-14 pt-24 sm:pb-16 sm:pt-28 md:pt-32 xl:pb-24 xl:pt-36"
    >
      {/* Soft modern wash — mostly neutral, tiny warm accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_55%_at_78%_18%,rgba(232,93,4,0.07),transparent_55%),radial-gradient(ellipse_60%_50%_at_12%_88%,rgba(12,12,12,0.04),transparent_50%),linear-gradient(180deg,#f4f4f2_0%,#fafafa_48%,#f0f0ee_100%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_78%_18%,rgba(249,115,22,0.08),transparent_55%),linear-gradient(180deg,#0b0b0b_0%,#121212_100%)]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* Stack until xl so ~1024 viewports aren't crushed side-by-side */}
        <div className="grid flex-1 grid-cols-1 items-center gap-8 md:gap-10 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-x-12 2xl:gap-x-16">
          <motion.div style={{ y: yText }} className="relative flex flex-col items-start">
            <FadeIn distance={10} revealOnMount>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-[10px] font-medium tracking-wide text-foreground/60 sm:mb-6 sm:text-[11px]">
                <span className="size-1.5 rounded-full bg-accent" />
                {heroBadge}
              </div>
            </FadeIn>

            <FadeIn delay={0.05} distance={12} revealOnMount>
              <h1 className="mb-5 max-w-[min(100%,38rem)] text-left font-display text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground [text-wrap:balance] sm:mb-7 sm:text-[2.65rem] sm:leading-[1.04] md:text-[3.1rem] xl:text-[clamp(2.85rem,3.8vw,4rem)]">
                {heroHeadline.trim() ? <span>{heroHeadline.trim()} </span> : null}
                {heroHighlight.trim() ? (
                  <span className="text-accent">{heroHighlight.trim()}</span>
                ) : null}
                {heroTail.trim() ? (
                  <>
                    <br />
                    <span className="text-foreground/80">{heroTail.trim()}</span>
                  </>
                ) : null}
              </h1>
            </FadeIn>

            <FadeIn delay={0.1} distance={10} className="w-full" revealOnMount>
              <div className="notranslate flex w-full flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <Link
                  href="#contact"
                  className="group inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:h-12 sm:w-auto sm:px-7"
                >
                  {t("startProject")}
                  <ArrowRight
                    className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    strokeWidth={2.25}
                  />
                </Link>
                <Link
                  href="#book-call"
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted sm:h-12 sm:w-auto sm:px-7"
                >
                  {t("bookCall")}
                </Link>
              </div>
            </FadeIn>
          </motion.div>

          <motion.div
            style={{ y: yImage }}
            className="relative flex items-center justify-center xl:justify-end"
          >
            <FadeIn delay={0.08} distance={14} className="relative w-full max-w-md xl:max-w-none" revealOnMount>
              <div
                ref={carouselRegionRef}
                className="relative mx-auto w-full max-w-[min(300px,82vw)] outline-none sm:max-w-[min(360px,70vw)] md:max-w-[400px] xl:ml-auto xl:max-w-[min(520px,40vw)]"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
                role="region"
                aria-roledescription="carousel"
                aria-label="Hero media"
              >
                <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/50 p-2 dark:bg-card/25">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.35rem] bg-muted/40 sm:aspect-[16/11]">
                    <AnimatePresence custom={carouselDir} initial={false} mode="wait">
                      <motion.div
                        key={heroSlides[carouselIndex]?.key ?? carouselIndex}
                        custom={carouselDir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-0"
                      >
                        {heroSlides[carouselIndex] && (
                          <Image
                            src={heroSlides[carouselIndex].src}
                            alt={heroSlides[carouselIndex].alt}
                            fill
                            sizes="(min-width: 1280px) min(520px,40vw), (min-width: 768px) 400px, (min-width: 640px) 70vw, 82vw"
                            unoptimized={shouldUseUnoptimizedImage(heroSlides[carouselIndex].src)}
                            className="object-contain p-3 select-none sm:p-4"
                            priority={carouselIndex === 0}
                            loading={carouselIndex === 0 ? "eager" : "lazy"}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {heroSlides.length > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    {heroSlides.map((s, i) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => goToSlide(i)}
                        className={cn(
                          "h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30",
                          i === carouselIndex ? "w-7 bg-foreground" : "w-1.5 bg-foreground/20 hover:bg-foreground/35"
                        )}
                        aria-label={`Slide ${i + 1} of ${heroSlides.length}`}
                        aria-current={i === carouselIndex ? "true" : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-auto absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 hidden -translate-x-1/2 min-[700px]:block">
        <Link
          href="#systems"
          className="group flex flex-col items-center gap-1 text-[10px] font-medium uppercase tracking-[0.22em] text-foreground/35 transition hover:text-foreground/55"
        >
          <span>Scroll</span>
          <ChevronDown className="size-4 opacity-50 transition group-hover:opacity-80" />
        </Link>
      </div>
    </section>
  );
}
