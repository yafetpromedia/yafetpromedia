"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  startTransition,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowRight, Check, ChevronDown, Globe2, Sparkles, X } from "lucide-react";
import type { ExploreArchitectureContent, ExploreFlowStep, ExploreTrackId } from "@/lib/explore-architecture.shared";
import { getExploreLucideIcon } from "@/lib/explore-architecture-icons";
import { cn } from "@/lib/utils";

type ExploreArchitectureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  explore: ExploreArchitectureContent;
};

const contentEase = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: contentEase, delay } },
});

function BlueprintTerminal({
  open,
  reduce,
  lines,
  trackKey,
}: {
  open: boolean;
  reduce: boolean;
  lines: readonly string[];
  trackKey: ExploreTrackId;
}) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef({ line: 0, char: 0 });

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    posRef.current = { line: 0, char: 0 };
    if (!open) {
      startTransition(() => {
        setLineIdx(0);
        setCharIdx(0);
        setDone(false);
      });
      return;
    }
    if (reduce) {
      startTransition(() => {
        setLineIdx(lines.length);
        setCharIdx(0);
        setDone(true);
      });
      return;
    }

    let cancelled = false;

    const step = () => {
      if (cancelled) return;
      const { line, char } = posRef.current;
      if (line >= lines.length) {
        setDone(true);
        return;
      }
      const full = lines[line] ?? "";
      if (char < full.length) {
        const next = char + 1;
        posRef.current = { line, char: next };
        setLineIdx(line);
        setCharIdx(next);
        const ch = full[char] ?? "";
        const delay = ch === " " ? 10 : 14 + (char % 5) * 2;
        timerRef.current = setTimeout(step, delay);
        return;
      }
      const nextLine = line + 1;
      posRef.current = { line: nextLine, char: 0 };
      setLineIdx(nextLine);
      setCharIdx(0);
      if (nextLine >= lines.length) {
        setDone(true);
        return;
      }
      timerRef.current = setTimeout(step, 85);
    };

    timerRef.current = setTimeout(step, 140);
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, reduce, trackKey, lines]);

  if (!open) return null;

  return (
    <motion.div
      className="mb-5 overflow-hidden rounded-2xl border border-border/70 bg-zinc-950 text-left shadow-[0_10px_40px_-18px_rgba(12,12,12,0.35)] dark:bg-zinc-950"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: contentEase }}
      role="region"
      aria-label="TypeScript-style blueprint summary"
    >
      <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-900/80 px-3 py-2">
        <span className="size-2.5 rounded-full bg-red-500/90" />
        <span className="size-2.5 rounded-full bg-amber-400/90" />
        <span className="size-2.5 rounded-full bg-emerald-500/90" />
        <span className="ml-2 font-mono text-[10px] text-zinc-500">tsc — blueprint</span>
      </div>
      <pre
        className="max-h-[8.5rem] overflow-y-auto overscroll-y-contain p-3 font-mono text-[11px] leading-relaxed [touch-action:pan-y] sm:max-h-[9.5rem] sm:text-xs"
        tabIndex={0}
      >
        {lines.slice(0, lineIdx).map((line) => (
          <span key={line} className="block text-emerald-300/95">
            {line}
            {"\n"}
          </span>
        ))}
        {lineIdx < lines.length && (
          <span className="text-sky-100/90">
            {(lines[lineIdx] ?? "").slice(0, charIdx)}
            {!done && <span className="ml-0.5 inline-block h-3.5 w-2 align-[-2px] animate-pulse bg-sky-400/90" aria-hidden />}
          </span>
        )}
      </pre>
    </motion.div>
  );
}

export default function ExploreArchitectureDialog({
  open,
  onOpenChange,
  explore,
}: ExploreArchitectureDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [stackTrack, setStackTrack] = useState<ExploreTrackId>("web");
  const reduce = useReducedMotion() === true;
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useLayoutEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogScrollRef = useRef<HTMLDivElement | null>(null);

  const stackTabs = explore.tracks.map((t) => ({ id: t.id, label: t.tabLabel }));
  const activeTrack = explore.tracks.find((t) => t.id === stackTrack) ?? explore.tracks[0]!;
  const flow = {
    row1: activeTrack.flowRow1,
    row2: activeTrack.flowRow2,
    footer: activeTrack.flowFooter,
  };
  const stackCards = activeTrack.stackCards;

  useLayoutEffect(() => {
    if (!open) return;
    const el = dialogScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [stackTrack, open]);

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const prevHtml = { overflow: html.style.overflow };
    const prevBody = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      html.style.overflow = prevHtml.overflow;
      body.style.overflow = prevBody.overflow;
      body.style.position = prevBody.position;
      body.style.top = prevBody.top;
      body.style.left = prevBody.left;
      body.style.right = prevBody.right;
      body.style.width = prevBody.width;
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => {
        lenisRef.current?.resize();
        lenisRef.current?.start();
      });
    };
  }, [open, onKeyDown]);

  useEffect(() => {
    if (open) return;
    const body = document.body;
    if (body.style.position !== "fixed") return;

    const scrollY = Math.abs(parseInt(body.style.top || "0", 10));
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.overflow = "";
    document.documentElement.style.overflow = "";
    window.scrollTo(0, scrollY);
    requestAnimationFrame(() => {
      lenisRef.current?.resize();
      lenisRef.current?.start();
    });
  }, [open]);
  const renderFlowRow = (steps: readonly ExploreFlowStep[], startIndex: number) => (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-stretch sm:justify-center sm:gap-2.5">
      {steps.map((step, j) => {
        const i = startIndex + j;
        const Icon = getExploreLucideIcon(step.icon);
        return (
          <Fragment key={`${stackTrack}-${startIndex}-${j}-${step.label}`}>
            <motion.div
              custom={i}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={reduce ? undefined : { duration: 0.35, ease: contentEase, delay: 0.04 * i }}
              className="flex w-full gap-3 rounded-2xl border border-border/70 bg-card p-3.5 shadow-[0_8px_28px_-16px_rgba(12,12,12,0.18)] sm:w-[calc(50%-0.35rem)] sm:flex-col sm:items-center sm:gap-2 sm:p-3 sm:text-center md:w-[min(100%,7.5rem)] dark:shadow-[0_8px_28px_-16px_rgba(0,0,0,0.5)]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-accent sm:mb-0.5">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1 sm:flex-none">
                <p className="text-sm font-semibold text-foreground sm:text-xs">{step.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-foreground/50 sm:text-[10px]">{step.detail}</p>
              </div>
            </motion.div>
            {j < steps.length - 1 && (
              <div className="flex items-center justify-center py-0.5 text-foreground/25 sm:px-0 sm:py-0 md:self-center" aria-hidden>
                <ChevronDown className="size-4 sm:hidden" />
                <ArrowRight className="hidden size-3.5 sm:block" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );

  const dialog = (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex h-dvh min-h-0 w-full items-end justify-center overflow-hidden p-0 sm:items-center sm:p-3 md:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.25 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 cursor-default bg-foreground/30 backdrop-blur-[3px]"
            aria-label="Close architecture view"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={dialogScrollRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            className={cn(
              "relative z-10 flex max-h-[min(94dvh,860px)] w-full max-w-3xl flex-col overflow-hidden rounded-t-[1.5rem]",
              "border border-border/70 bg-card shadow-[0_12px_48px_-20px_rgba(12,12,12,0.35)]",
              "sm:max-h-[min(90dvh,860px)] sm:rounded-[1.5rem]"
            )}
            data-scrollport="explore-architecture"
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={reduce ? undefined : { y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 16, opacity: 0 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", damping: 28, stiffness: 320 }}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-foreground/15 sm:hidden" aria-hidden />

            <header className="sticky top-0 z-20 shrink-0 border-b border-border/60 bg-card/95 px-4 py-3.5 backdrop-blur-md sm:px-6 sm:py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <motion.p
                    className="text-[10px] font-medium uppercase tracking-[0.18em] text-accent"
                    {...fadeUp(0)}
                  >
                    {explore.eyebrow}
                  </motion.p>
                  <motion.h2
                    id={titleId}
                    className="mt-1 font-display text-lg font-semibold tracking-tight sm:text-xl md:text-2xl"
                    {...fadeUp(0.04)}
                  >
                    {explore.title}
                  </motion.h2>
                  <motion.p
                    className="mt-1.5 max-w-xl text-sm leading-relaxed text-foreground/55"
                    {...fadeUp(0.08)}
                  >
                    {explore.description}
                  </motion.p>
                  <motion.div
                    className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={reduce ? undefined : { opacity: 1, transition: { delay: 0.1, duration: 0.35 } }}
                  >
                    {explore.serviceStrip.map((s, si) => {
                      const S = getExploreLucideIcon(s.icon);
                      return (
                        <span
                          key={`${s.label}-${si}`}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/70 bg-muted/50 px-2.5 py-1.5 text-[10px] font-medium text-foreground/70"
                        >
                          <S className="size-3 text-accent" />
                          {s.label}
                        </span>
                      );
                    })}
                  </motion.div>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-foreground/70 transition hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            <div
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [touch-action:pan-y] [-webkit-overflow-scrolling:touch]"
              data-lenis-prevent
            >
              <div className="relative px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-5 sm:pb-[max(2rem,env(safe-area-inset-bottom))]">
                <BlueprintTerminal
                  open={open}
                  reduce={reduce}
                  lines={activeTrack.terminalLines}
                  trackKey={stackTrack}
                />

                <section className="mb-8">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Sparkles className="size-3.5" />
                    </span>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                      {explore.dataFlowSectionTitle}
                    </h3>
                  </div>
                  <div
                    key={stackTrack}
                    className="relative overflow-hidden rounded-2xl border border-border/70 bg-muted/30 p-3 sm:p-4"
                  >
                    {renderFlowRow(flow.row1, 0)}
                    <div className="my-2.5 flex justify-center text-foreground/20" aria-hidden>
                      <ChevronDown className="size-4 sm:rotate-90" />
                    </div>
                    {renderFlowRow(flow.row2, flow.row1.length)}
                    <p className="relative mt-3 text-center text-xs text-foreground/45">{flow.footer}</p>
                  </div>
                </section>

                <section className="mb-8">
                  <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Globe2 className="size-4 text-accent" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                        {explore.stackSectionTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-foreground/45">{activeTrack.stackTitle}</p>
                  </div>
                  <div
                    className="mb-3 flex gap-1 overflow-x-auto rounded-full border border-border/60 bg-muted/40 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    role="tablist"
                    aria-label="Choose stack by service"
                  >
                    {stackTabs.map((tab) => {
                      const active = tab.id === stackTrack;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          onClick={() => setStackTrack(tab.id as ExploreTrackId)}
                          className={cn(
                            "min-h-10 shrink-0 flex-1 rounded-full px-3 py-2 text-center text-xs font-semibold transition sm:px-4",
                            active
                              ? "bg-foreground text-background shadow-sm"
                              : "text-foreground/55 hover:text-foreground"
                          )}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                  <ul key={stackTrack} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {stackCards.map((t, i) => {
                      const I = getExploreLucideIcon(t.icon);
                      return (
                        <motion.li
                          key={`${stackTrack}-${t.name}`}
                          initial={reduce ? false : { opacity: 0, y: 8 }}
                          animate={reduce ? undefined : { opacity: 1, y: 0 }}
                          transition={{ delay: 0.03 * i, duration: 0.35, ease: contentEase }}
                          className="flex gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-[0_8px_28px_-16px_rgba(12,12,12,0.18)] dark:shadow-[0_8px_28px_-16px_rgba(0,0,0,0.5)]"
                        >
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-accent">
                            <I className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-foreground/45">
                              {t.name}
                            </p>
                            <p className="mt-0.5 font-semibold text-foreground">{t.value}</p>
                            <p className="mt-0.5 text-sm leading-relaxed text-foreground/55">{t.note}</p>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </section>

                <section className="mb-8">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/70">
                    {explore.beforeAfterSectionTitle}
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                    <motion.div
                      className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4 shadow-[0_8px_28px_-18px_rgba(12,12,12,0.12)] sm:p-5"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: contentEase }}
                    >
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-red-500/90">
                        {explore.beforeLabel}
                      </p>
                      <ul className="space-y-2.5">
                        {explore.beforeAfter.before.map((line) => (
                          <li key={line} className="flex gap-2 text-sm text-foreground/75">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500/50" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                    <motion.div
                      className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 shadow-[0_8px_28px_-18px_rgba(12,12,12,0.12)] sm:p-5"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={reduce ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: contentEase, delay: 0.04 }}
                    >
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-400">
                        {explore.afterLabel}
                      </p>
                      <ul className="space-y-2.5">
                        {explore.beforeAfter.after.map((line) => (
                          <li key={line} className="flex gap-2 text-sm text-foreground/85">
                            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                </section>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-foreground/50">{explore.closingLine}</p>
                  <a
                    href="#contact"
                    onClick={() => onOpenChange(false)}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90"
                  >
                    {explore.ctaLabel}
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) {
    return null;
  }

  return createPortal(dialog, document.body);
}
