"use client";

import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import FadeIn from "@/components/animations/FadeIn";
import { ArrowRight, Play, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";

function CountUp({
  from = 0,
  to,
  duration = 1.4,
  decimals = 0,
}: {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    const startTime = performance.now();
    let rafId = 0;

    const tick = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const nextValue = from + (to - from) * progress;
      setValue(nextValue);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [duration, from, isInView, to]);

  return <span ref={ref}>{value.toFixed(decimals)}</span>;
}

const CAROUSEL_INTERVAL_MS = 6500;

export default function Hero() {
  const { t, language } = useLanguage();
  const { content } = useSiteContent();
  const ref = useRef<HTMLDivElement>(null);
  const heroHeadline = language === "am" ? t("heroHeadline") : content.heroHeadline;
  const heroHighlight = language === "am" ? t("heroHighlight") : content.heroHighlight;
  const heroTail = language === "am" ? t("heroTail") : content.heroTail;
  const heroBadge = language === "am" ? t("heroBadge") : content.heroBadge;
  const [highlightFirstWord, ...highlightRest] = heroHighlight.split(" ");
  const reduceMotion = useReducedMotion();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselDir, setCarouselDir] = useState(1);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const heroSlides = useMemo(
    () =>
      content.heroCarouselSlides.map((s) => ({
        key: s.id,
        src: s.src,
        alt: s.alt,
      })),
    [content.heroCarouselSlides]
  );

  useEffect(() => {
    startTransition(() => {
      setCarouselIndex((i) => Math.min(i, Math.max(0, heroSlides.length - 1)));
    });
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

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax Values
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: reduceMotion ? 0 : direction * 44,
      opacity: 0,
      scale: reduceMotion ? 1 : 0.97,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: reduceMotion ? 0 : direction * -44,
      opacity: 0,
      scale: reduceMotion ? 1 : 0.97,
    }),
  };

  return (
    <section 
      ref={ref}
      className="relative -mt-4 sm:-mt-6 md:-mt-8 flex flex-col pt-28 sm:pt-32 md:pt-36 pb-12 md:pb-16 overflow-hidden bg-background"
    >
      {/* 1. Deep Background Layer (Slow Parallax) */}
      <motion.div 
        style={{ y: yBg, opacity }} 
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        {/* Core Glow — pushed to the right to complement the image layout */}
        <div className="absolute top-[30%] right-[10%] w-[700px] h-[600px] bg-primary/10 rounded-full blur-[160px]" />
        <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        
        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 75%)"
          }}
        />
      </motion.div>
      
      {/* 2. Main Two-Column Content — constrained to same max-width as navbar */}
      <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
        
        {/* Top Badge — Centered as requested */}
        <div className="w-full flex justify-center mb-6 md:mb-8">
          <FadeIn distance={40}>
            <div className="inline-flex items-center gap-2 px-4 py-2 text-[11px] sm:text-xs font-bold tracking-[0.25em] uppercase border border-border rounded-full bg-foreground/[0.03] text-foreground/70 backdrop-blur-md">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-primary"></span>
              </span>
              {heroBadge}
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center lg:min-h-0">
          
          {/* LEFT COLUMN: Typography & CTAs */}
          <motion.div
            style={{ y: yText, opacity }}
            className="flex flex-col items-start justify-center"
          >
            <FadeIn delay={0.1} distance={40}>
              <h1 className="text-[2.35rem] sm:text-[3.1rem] md:text-[3.7rem] lg:text-[4.1rem] xl:text-[4.5rem] font-display font-bold mb-5 md:mb-6 leading-[1.05] tracking-tighter text-left text-foreground">
                {heroHeadline}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-primary to-[#ff9b4d]">
                  {highlightFirstWord}
                  {highlightRest.length > 0 && <br className="sm:hidden" />}
                  {highlightRest.length > 0 ? ` ${highlightRest.join(" ")}` : ""}
                </span>
                <br />
                {heroTail}
              </h1>
            </FadeIn>
            
            {/* Subtext removed as requested */}
            
            <FadeIn delay={0.3} distance={40} className="relative z-50 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-start gap-4 w-full">
                <Link
                  href="#contact"
                  className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_rgba(255,106,0,0.25)] hover:shadow-[0_0_60px_rgba(255,106,0,0.4)] transition-all duration-300 group inline-flex items-center justify-center"
                >
                  {t("startProject")}
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#products"
                  className="w-full sm:w-auto h-12 px-7 text-sm sm:text-base font-bold rounded-full border border-border text-foreground hover:bg-foreground/5 backdrop-blur-md transition-colors duration-300 inline-flex items-center justify-center"
                >
                  <Play className="mr-2 size-4 fill-current" />
                  {t("navProducts")}
                </Link>
              </div>
            </FadeIn>

          </motion.div>

          {/* RIGHT COLUMN: Brand SVG with Parallax */}
          <motion.div
            style={{ y: yImage, opacity }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <FadeIn delay={0.2} distance={60} className="relative w-full max-w-lg lg:max-w-none">
              {/* Glow behind the image */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,106,0,0.2),transparent_70%)] blur-3xl scale-110 pointer-events-none" />
              
              {/* Brand carousel: slides + float + depth */}
              <div
                className="relative w-full max-w-[420px] lg:max-w-[460px] mx-auto lg:ml-auto"
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-[2rem]">
                  <AnimatePresence custom={carouselDir} initial={false} mode="wait">
                    <motion.div
                      key={heroSlides[carouselIndex]?.key ?? carouselIndex}
                      custom={carouselDir}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                    >
                      {heroSlides[carouselIndex] && (
                        <Image
                          src={heroSlides[carouselIndex].src}
                          alt={heroSlides[carouselIndex].alt}
                          fill
                          sizes="(min-width: 1024px) 460px, 85vw"
                          unoptimized={/^https?:\/\//i.test(heroSlides[carouselIndex].src)}
                          className="object-contain p-1 drop-shadow-2xl select-none dark:brightness-100 brightness-90"
                          priority={carouselIndex === 0}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  {heroSlides.map((s, i) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => goToSlide(i)}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        i === carouselIndex
                          ? "w-8 bg-primary"
                          : "w-2 bg-foreground/20 hover:bg-foreground/40"
                      )}
                      aria-label={`${i + 1} / ${heroSlides.length}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating metric badge — top left of image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={
                  reduceMotion
                    ? { opacity: 1, x: 0 }
                    : { opacity: 1, x: 0, y: [0, -6, 0] }
                }
                transition={
                  reduceMotion
                    ? { delay: 0.8, duration: 0.6 }
                    : {
                        opacity: { delay: 0.8, duration: 0.6 },
                        x: { delay: 0.8, duration: 0.6 },
                        y: { delay: 1.1, duration: 4.2, repeat: Infinity, ease: "easeInOut" },
                      }
                }
                className="absolute -left-6 top-12 rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-4 shadow-2xl hidden md:flex items-center gap-3"
              >
                <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Shield className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-foreground/40 font-mono uppercase tracking-wider">
                    {t("heroStatSystemsActive")}
                  </p>
                  <p className="text-foreground font-bold text-lg leading-none">
                    <CountUp to={99.9} decimals={1} />%{" "}
                    <span className="text-xs text-primary font-mono">{t("heroStatUptime")}</span>
                  </p>
                </div>
              </motion.div>

              {/* Floating metric badge — bottom right of image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={
                  reduceMotion
                    ? { opacity: 1, x: 0 }
                    : { opacity: 1, x: 0, y: [0, -5, 0] }
                }
                transition={
                  reduceMotion
                    ? { delay: 1.0, duration: 0.6 }
                    : {
                        opacity: { delay: 1.0, duration: 0.6 },
                        x: { delay: 1.0, duration: 0.6 },
                        y: { delay: 1.2, duration: 5, repeat: Infinity, ease: "easeInOut" },
                      }
                }
                className="absolute -right-4 bottom-16 rounded-2xl border border-border bg-card/90 backdrop-blur-xl p-4 shadow-2xl hidden md:flex items-center gap-3"
              >
                <div className="size-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Zap className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-foreground/40 font-mono uppercase tracking-wider">
                    {t("heroStatClientsDeployed")}
                  </p>
                  <p className="text-foreground font-bold text-lg leading-none">
                    <CountUp to={50} />+{" "}
                    <span className="text-xs text-primary font-mono">{t("heroStatOrgs")}</span>
                  </p>
                </div>
              </motion.div>
            </FadeIn>
          </motion.div>

        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-40" />
    </section>
  );
}
