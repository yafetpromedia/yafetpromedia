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
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";

const CAROUSEL_INTERVAL_MS = 6500;

export default function Hero() {
  const { t } = useLanguage();
  const { content, isLoading } = useSiteContent();
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const carouselRegionRef = useRef<HTMLDivElement>(null);
  const { heroHeadline, heroHighlight, heroTail, heroBadge } = content;
  const highlightParts = heroHighlight.trim() ? heroHighlight.trim().split(/\s+/) : [];
  const highlightFirstWord = highlightParts[0] ?? "";
  const highlightRest = highlightParts.slice(1);
  const reduceMotion = useReducedMotion();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselDir, setCarouselDir] = useState(1);
  const [carouselPaused, setCarouselPaused] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

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

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: reduceMotion ? 0 : direction * 48,
      opacity: 0,
      scale: reduceMotion ? 1 : 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: reduceMotion ? 0 : direction * -48,
      opacity: 0,
      scale: reduceMotion ? 1 : 0.96,
    }),
  };

  return (
    <section
      ref={ref}
      className="relative isolate -mt-4 flex min-h-[min(92vh,900px)] flex-col overflow-hidden bg-background pb-20 pt-28 sm:-mt-6 sm:min-h-0 sm:pb-24 sm:pt-32 md:-mt-8 md:pt-36 lg:pb-28"
    >
      {/* Background */}
      <motion.div
        style={{ y: yBg, opacity }}
        className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.2] [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.17)_1px,transparent_0)] [background-size:24px_24px] dark:opacity-[0.16]" />

        {!reduceMotion && (
          <>
            <motion.div
              aria-hidden
              className="absolute right-[4%] top-[18%] size-[min(560px,88vw)] rounded-full bg-primary/[0.13] blur-[120px]"
              animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.75, 0.45] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="absolute bottom-[12%] left-[28%] size-[min(340px,55vw)] rounded-full bg-sky-500/[0.09] blur-[100px]"
              animate={{ scale: [1.08, 1, 1.08], opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
          </>
        )}
        {reduceMotion && (
          <>
            <div className="absolute right-[5%] top-[22%] size-[min(640px,85vw)] rounded-full bg-primary/[0.11] blur-[130px]" />
            <div className="absolute bottom-[15%] left-[35%] size-[min(380px,50vw)] rounded-full bg-sky-500/[0.06] blur-[110px]" />
          </>
        )}

        <div className="absolute left-[6%] top-[6%] size-[min(400px,52vw)] rounded-full bg-primary/[0.055] blur-[95px]" />

        <div
          className="absolute inset-0 opacity-[0.048]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage:
              "radial-gradient(ellipse 88% 68% at 48% 40%, black 16%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 88% 68% at 48% 40%, black 16%, transparent 70%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 flex-col px-5 sm:px-7 lg:px-10">
        <div className="mb-7 flex w-full flex-col items-center gap-3 md:mb-9">
          <FadeIn distance={32} revealOnMount>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-background/75 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ring-1 ring-black/[0.05] dark:border-white/[0.09] dark:bg-white/[0.035] dark:ring-white/[0.06] sm:text-[11px]">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/70 opacity-65" />
                <span className="relative inline-flex size-2 rounded-full bg-primary shadow-[0_0_14px_rgba(255,106,0,0.7)]" />
              </span>
              {heroBadge}
            </div>
          </FadeIn>
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-80" />
        </div>

        <div className="grid flex-1 grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)] lg:gap-x-16 xl:gap-x-20">
          {/* Copy */}
          <motion.div
            style={{ y: yText, opacity }}
            className="relative flex flex-col items-start justify-start"
          >
            <div className="pointer-events-none absolute -left-1 top-[0.15em] hidden h-[calc(100%-0.5em)] w-px bg-gradient-to-b from-primary/70 via-primary/15 to-transparent lg:block" />

            <FadeIn delay={0.08} distance={36} revealOnMount>
              <h1 className="isolate mb-7 max-w-[min(100%,44rem)] text-left font-display text-[2.1rem] font-bold leading-[1.07] tracking-[-0.024em] text-foreground [text-wrap:balance] sm:mb-9 sm:text-[3.2rem] sm:leading-[1.03] sm:tracking-[-0.038em] md:text-[3.75rem] lg:text-[4.05rem] xl:text-[clamp(3.65rem,4.8vw,4.45rem)] [text-rendering:optimizeLegibility] md:tracking-[-0.042em]">
                <span className="text-foreground/[0.93]">{heroHeadline}</span>{" "}
                <span
                  className={cn(
                    "inline-block bg-gradient-to-br from-primary via-[#ff8029] to-[#ffc48a] bg-clip-text text-transparent",
                    "[-webkit-background-clip:text] [-webkit-text-fill-color:transparent]",
                    "[transform:translateZ(0)]",
                    "drop-shadow-[0_2px_42px_rgba(255,106,0,0.28)]"
                  )}
                >
                  {highlightFirstWord}
                  {highlightRest.length > 0 ? ` ${highlightRest.join(" ")}` : ""}
                </span>
                <br />
                <span className="text-foreground/[0.93]">{heroTail}</span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.26} distance={32} className="relative z-50 w-full" revealOnMount>
              <motion.div
                className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4"
                initial={false}
              >
                <motion.div className="w-full sm:w-auto" whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                  <Link
                    href="#contact"
                    className="group inline-flex h-[3.15rem] w-full min-w-[220px] items-center justify-center rounded-2xl border border-[#e35500]/90 bg-[#ff6a00] px-9 text-[15px] font-semibold text-white shadow-[0_1px_0_0_rgba(255,255,255,0.22)_inset,0_10px_28px_-6px_rgba(255,106,0,0.55),0_0_0_1px_rgba(0,0,0,0.06)] transition-[box-shadow,background-color,border-color] hover:bg-[#e86100] hover:shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_14px_36px_-8px_rgba(255,106,0,0.58),0_0_0_1px_rgba(0,0,0,0.08)] sm:w-auto dark:border-[#ff8533]/80 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_10px_28px_-6px_rgba(255,106,0,0.45)]"
                  >
                    {t("startProject")}
                    <ArrowRight className="ml-2 size-[1.08rem] transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.25} />
                  </Link>
                </motion.div>
                <motion.div className="w-full sm:w-auto" whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                  <Link
                    href="#products"
                    className="inline-flex h-[3.15rem] w-full min-w-[220px] items-center justify-center rounded-2xl border-2 border-foreground/18 bg-background px-9 text-[15px] font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-sm transition-colors hover:border-primary/55 hover:bg-orange-50/90 hover:text-foreground dark:border-white/22 dark:bg-card/90 dark:text-foreground dark:shadow-none dark:hover:border-primary/50 dark:hover:bg-white/[0.1] sm:w-auto"
                  >
                    <Play className="mr-2 size-[1.08rem] shrink-0 fill-current text-primary" />
                    {t("navProducts")}
                  </Link>
                </motion.div>
              </motion.div>
            </FadeIn>
          </motion.div>

          {/* Visual — illustration only (carousel rotates; no frame or chrome) */}
          <motion.div
            style={{ y: yImage, opacity }}
            className="relative flex items-start justify-center lg:items-start lg:justify-end"
          >
            <FadeIn delay={0.18} distance={52} className="relative w-full max-w-lg lg:max-w-none" revealOnMount>
              <div
                ref={carouselRegionRef}
                className="relative mx-auto w-full max-w-[min(300px,72vw)] outline-none sm:max-w-[min(360px,76vw)] lg:ml-auto lg:max-w-[min(620px,46vw)]"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
                role="region"
                aria-roledescription="carousel"
                aria-label="Hero media"
              >
                <div className="relative aspect-[4/3] w-full sm:aspect-[16/11] lg:aspect-[16/10]">
                  <AnimatePresence custom={carouselDir} initial={false} mode="wait">
                    <motion.div
                      key={heroSlides[carouselIndex]?.key ?? carouselIndex}
                      custom={carouselDir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      {heroSlides[carouselIndex] && (
                        <Image
                          src={heroSlides[carouselIndex].src}
                          alt={heroSlides[carouselIndex].alt}
                          fill
                          sizes="(min-width: 1024px) min(620px,46vw), (min-width: 640px) min(360px,76vw), 72vw"
                          unoptimized={shouldUseUnoptimizedImage(heroSlides[carouselIndex].src)}
                          className="object-contain scale-95 select-none drop-shadow-[0_24px_64px_rgba(0,0,0,0.38)] sm:scale-100 lg:scale-[1.08] dark:drop-shadow-[0_28px_70px_rgba(0,0,0,0.55)]"
                          priority={carouselIndex === 0}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {heroSlides.length > 1 && (
                  <div className="mt-5 flex items-center justify-center gap-2">
                    {heroSlides.map((s, i) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => goToSlide(i)}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          i === carouselIndex
                            ? "w-10 bg-gradient-to-r from-primary to-[#ff9b52] shadow-[0_0_20px_rgba(255,106,0,0.42)]"
                            : "w-2 bg-foreground/38 ring-1 ring-foreground/20 hover:bg-foreground/52 dark:bg-white/45 dark:ring-white/30 dark:hover:bg-white/60"
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

      <motion.div
        className="pointer-events-auto absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 z-40 -translate-x-1/2 -translate-y-6 md:-translate-y-9"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <Link
          href="#systems"
          className="group flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground/38 transition hover:text-primary/90"
        >
          <span className="font-mono text-[10px] tracking-[0.28em]">Explore</span>
          <motion.span
            className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-background/80 shadow-lg backdrop-blur-md ring-1 ring-black/[0.04] dark:border-white/[0.1] dark:bg-white/[0.04]"
            animate={reduceMotion ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="size-[1.15rem] opacity-70 transition group-hover:opacity-100" />
          </motion.span>
        </Link>
      </motion.div>

      <div className="pointer-events-none absolute bottom-0 left-0 z-30 h-40 w-full bg-gradient-to-t from-background via-background/94 to-transparent md:h-48" />
    </section>
  );
}
