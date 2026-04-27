"use client";

import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
      setLineIdx(0);
      setCharIdx(0);
      setDone(false);
      return;
    }
    if (reduce) {
      setLineIdx(lines.length);
      setCharIdx(0);
      setDone(true);
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
      className="mb-6 overflow-hidden rounded-2xl border border-border/60 bg-zinc-950 text-left shadow-lg ring-1 ring-white/5 dark:bg-zinc-950"
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
        className="max-h-[9.5rem] overflow-y-auto overscroll-y-contain p-3 font-mono text-[11px] leading-relaxed [touch-action:pan-y] sm:max-h-[10.5rem] sm:text-xs"
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
  lenisRef.current = lenis;
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
    setMounted(true);
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

    lenisRef.current?.stop();

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
      lenisRef.current?.start();
    };
  }, [open, onKeyDown]);
  const stepFloat = !reduce
    ? {
        animate: { y: [0, -5, 0] },
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
      }
    : undefined;

  const renderFlowRow = (steps: readonly ExploreFlowStep[], startIndex: number) => (
    <div className="flex flex-col items-stretch justify-center gap-1 md:flex-row md:flex-wrap md:items-end md:justify-center md:gap-2">
      {steps.map((step, j) => {
        const i = startIndex + j;
        const Icon = getExploreLucideIcon(step.icon);
        return (
          <Fragment key={`${stackTrack}-${step.label}`}>
            <motion.div
              custom={i}
              initial={reduce ? false : { opacity: 0, y: 16, scale: 0.97 }}
              animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? undefined : { type: "spring", damping: 24, stiffness: 320, delay: 0.06 * i }}
              className="group/step relative w-full flex-col items-center overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card to-card/50 px-3 py-3.5 text-center shadow-sm md:w-[min(100%,112px)]"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,106,0,0.12),transparent_65%)] opacity-0 transition duration-500 group-hover/step:opacity-100"
                aria-hidden
              />
              <motion.div
                className="relative mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20"
                {...(stepFloat ?? {})}
                transition={stepFloat ? { ...stepFloat.transition, delay: i * 0.12 } : undefined}
              >
                <Icon className="size-5" />
              </motion.div>
              <p className="relative text-xs font-semibold text-foreground">{step.label}</p>
              <p className="relative mt-1 text-[10px] leading-snug text-foreground/50">{step.detail}</p>
            </motion.div>
            {j < steps.length - 1 && (
              <div className="flex items-center justify-center py-0.5 text-foreground/25 md:px-0.5 md:py-0" aria-hidden>
                <ChevronDown className="size-4 md:hidden" />
                <ArrowRight className="hidden size-4 md:block" />
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
          className="fixed inset-0 z-[200] flex h-dvh min-h-0 w-full items-end justify-center overflow-hidden p-0 sm:items-center sm:p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.15 : 0.25 }}
        >
          <motion.button
            type="button"
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md"
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
            // Lenis calls preventDefault on wheel when stopped, which blocks native overflow
            // scrolling; this opt-out must exist on a node in the event path (see lenis onVirtualScroll).
            data-lenis-prevent
            className={cn(
              "relative z-10 max-h-[min(92dvh,920px)] w-full max-w-3xl overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-t-3xl",
              "[touch-action:pan-y] [-webkit-overflow-scrolling:touch]",
              "border border-white/10 bg-background/95 shadow-[0_32px_120px_-24px_rgba(0,0,0,0.45)] backdrop-blur-2xl",
              "dark:border-border/80 dark:bg-background/90",
              "sm:max-h-[min(88dvh,920px)] sm:rounded-3xl"
            )}
            data-scrollport="explore-architecture"
            initial={reduce ? false : { y: 28, opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            animate={reduce ? undefined : { y: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={reduce ? undefined : { y: 20, opacity: 0, scale: 0.98, filter: "blur(2px)" }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", damping: 26, stiffness: 280 }}
          >
            <div
              className="pointer-events-none absolute inset-0 min-h-full bg-[radial-gradient(ellipse_90%_50%_at_0%_0%,rgba(255,106,0,0.09),transparent_50%)]"
              aria-hidden
            />

            <div className="relative z-[1]">
              <header className="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-3 border-b border-border/50 bg-background/90 px-5 py-4 backdrop-blur-md sm:px-7 sm:py-5">
                <div className="min-w-0">
                  <motion.p
                    className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary"
                    {...fadeUp(0)}
                  >
                    {explore.eyebrow}
                  </motion.p>
                  <motion.h2
                    id={titleId}
                    className="mt-1 text-xl font-display font-bold tracking-tight sm:text-2xl"
                    {...fadeUp(0.04)}
                  >
                    {explore.title}
                  </motion.h2>
                  <motion.p
                    className="mt-1 max-w-xl text-sm leading-relaxed text-foreground/55"
                    {...fadeUp(0.08)}
                  >
                    {explore.description}
                  </motion.p>
                  <motion.div
                    className="mt-3 flex flex-wrap gap-2"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={reduce ? undefined : { opacity: 1, transition: { delay: 0.12, duration: 0.4 } }}
                  >
                    {explore.serviceStrip.map((s) => {
                      const S = getExploreLucideIcon(s.icon);
                      return (
                        <span
                          key={s.label}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-foreground/[0.03] px-2.5 py-1 text-[10px] font-medium text-foreground/70"
                        >
                          <S className="size-3 text-primary" />
                          {s.label}
                        </span>
                      );
                    })}
                  </motion.div>
                </div>
                <motion.button
                  ref={closeRef}
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="shrink-0 rounded-xl border border-border/80 bg-card/80 p-2.5 text-foreground/80 transition hover:scale-105 hover:border-primary/30 hover:text-foreground"
                  aria-label="Close"
                  whileTap={reduce ? undefined : { scale: 0.95 }}
                >
                  <X className="size-5" />
                </motion.button>
              </header>

              <div className="relative px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-5 sm:px-7 sm:pt-6 sm:pb-[max(2.5rem,env(safe-area-inset-bottom))]">
                <BlueprintTerminal
                  open={open}
                  reduce={reduce}
                  lines={activeTrack.terminalLines}
                  trackKey={stackTrack}
                />

                {/* 1. Flowchart */}
              <section className="mb-10">
                <motion.div
                  className="mb-4 flex items-center gap-2"
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={reduce ? undefined : { opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, ease: contentEase }}
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                    {explore.dataFlowSectionTitle}
                  </h3>
                </motion.div>
                <div
                  key={stackTrack}
                  className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-muted/30 to-muted/5 p-4 sm:p-5"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.4]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 24V0h24' fill='none' stroke='currentColor' strokeOpacity='.06'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden
                  />
                  {renderFlowRow(flow.row1, 0)}
                  <div className="my-2 flex justify-center text-foreground/20 md:my-1" aria-hidden>
                    <ChevronDown className="size-4 md:rotate-90" />
                  </div>
                  {renderFlowRow(flow.row2, 3)}
                  <motion.p
                    className="relative mt-4 text-center text-xs text-foreground/45"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={reduce ? undefined : { opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    {flow.footer}
                  </motion.p>
                </div>
              </section>

              {/* 2. Tech + scope (per service track) */}
              <section className="mb-10">
                <div className="mb-3 flex flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Globe2 className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">
                      {explore.stackSectionTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-foreground/45 sm:max-w-[12rem] sm:text-right">
                    {activeTrack.stackTitle}
                  </p>
                </div>
                <div
                  className="mb-4 flex flex-wrap gap-1.5 rounded-2xl border border-border/50 bg-foreground/[0.02] p-1"
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
                          "min-h-[2.5rem] flex-1 rounded-xl px-2.5 py-2 text-center text-xs font-medium transition",
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"
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
                        initial={reduce ? false : { opacity: 0, y: 10 }}
                        animate={reduce ? undefined : { opacity: 1, y: 0 }}
                        transition={{ delay: 0.04 * i, duration: 0.4, ease: contentEase }}
                        whileHover={reduce ? undefined : { y: -3, scale: 1.01 }}
                        className="flex gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-sm ring-1 ring-border/20 transition-shadow hover:shadow-md hover:ring-primary/20"
                      >
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-primary">
                          <I className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-foreground/45">{t.name}</p>
                          <p className="font-semibold text-foreground">{t.value}</p>
                          <p className="mt-0.5 text-sm text-foreground/55">{t.note}</p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              </section>

              {/* 3. Before / After */}
              <section className="mb-10">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  {explore.beforeAfterSectionTitle}
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <motion.div
                    className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-4 sm:p-5"
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    animate={reduce ? undefined : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: contentEase }}
                  >
                    <p className="mb-3 text-xs font-mono uppercase tracking-widest text-red-500/90">
                      {explore.beforeLabel}
                    </p>
                    <ul className="space-y-2.5">
                      {explore.beforeAfter.before.map((line, j) => (
                        <motion.li
                          key={line}
                          className="flex gap-2 text-sm text-foreground/75"
                          initial={reduce ? false : { opacity: 0, x: -6 }}
                          animate={reduce ? undefined : { opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * j, duration: 0.3 }}
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500/50" />
                          {line}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                  <motion.div
                    className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] p-4 sm:p-5"
                    initial={reduce ? false : { opacity: 0, x: 12 }}
                    animate={reduce ? undefined : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.45, ease: contentEase, delay: 0.05 }}
                  >
                    <p className="mb-3 text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                      {explore.afterLabel}
                    </p>
                    <ul className="space-y-2.5">
                      {explore.beforeAfter.after.map((line, j) => (
                        <motion.li
                          key={line}
                          className="flex gap-2 text-sm text-foreground/85"
                          initial={reduce ? false : { opacity: 0, x: 6 }}
                          animate={reduce ? undefined : { opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * j, duration: 0.3 }}
                        >
                          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                          {line}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </section>

              <motion.div
                className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: contentEase }}
              >
                <p className="text-sm text-foreground/50">{explore.closingLine}</p>
                <motion.a
                  href="#contact"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                >
                  {explore.ctaLabel}
                </motion.a>
              </motion.div>
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
