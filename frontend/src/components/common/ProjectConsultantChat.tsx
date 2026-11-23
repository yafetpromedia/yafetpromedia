"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Calendar,
  Check,
  Download,
  FileText,
  Layers,
  RotateCcw,
  SendHorizontal,
  X,
} from "lucide-react";
import {
  type ConsultantApiResponse,
  type ProjectBrief,
} from "@/lib/project-consultant.shared";
import { downloadBriefMarkdown, downloadBriefPdf } from "@/lib/download-project-brief";
import type { ConsultationSession } from "@/lib/project-consultant-engine";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function PlanTypingIndicator({ label }: { label?: string }) {
  return (
    <div className="mb-3 mr-auto flex max-w-[92%] items-center gap-2 rounded-2xl border border-border/70 bg-card/80 px-3.5 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-primary/70"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      {label ? <span className="text-xs text-foreground/50">{label}</span> : null}
    </div>
  );
}

function BriefCard({ brief, leadScore }: { brief: ProjectBrief; leadScore?: number }) {
  const facts: { label: string; value: string }[] = [
    { label: "Industry", value: brief.industry },
    { label: "Scope", value: brief.products },
    { label: "Payments", value: brief.payments.join(", ") || "—" },
    { label: "Timeline", value: brief.timeline },
    { label: "Budget", value: brief.budget },
  ].filter((row) => row.value.trim());

  return (
    <div className="mt-3 overflow-hidden rounded-[1.25rem] border border-border/80 bg-card shadow-[0_12px_40px_-28px_rgba(12,12,12,0.35)]">
      <div className="border-b border-border/60 bg-gradient-to-r from-[#0c0c0c] to-[#1a1a1a] px-4 py-3.5 text-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ff7d22]">
          Project brief
        </p>
        <h4 className="mt-1 font-display text-lg font-semibold tracking-tight">{brief.projectType}</h4>
        {brief.clientSummary ? (
          <p className="mt-2 text-[13px] leading-relaxed text-white/70">{brief.clientSummary}</p>
        ) : null}
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        <dl className="space-y-2.5">
          {facts.map((row) => (
            <div key={row.label} className="grid grid-cols-[88px_1fr] gap-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-foreground/40">
                {row.label}
              </dt>
              <dd className="text-[13px] leading-relaxed text-foreground/80">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/40">
            Recommended
          </p>
          <ul className="space-y-1.5">
            {brief.recommendedFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-foreground/80">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <Check className="size-3 stroke-[2.5]" aria-hidden />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-muted/50 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-foreground/40">Timeline</p>
            <p className="mt-1 text-sm font-semibold">{brief.estimatedTimeline}</p>
          </div>
          <div className="rounded-2xl bg-muted/50 px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-foreground/40">Est. cost</p>
            <p className="mt-1 text-sm font-semibold">{brief.estimatedCost}</p>
          </div>
        </div>

        <p className="text-xs font-medium text-[#ff6a00]">
          {brief.leadLabel}
          {leadScore != null ? ` · Score ${leadScore}` : ""}
        </p>
      </div>
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  className?: string;
  embedded?: boolean;
  active?: boolean;
};

export default function ProjectConsultantChat({ open, onClose, className, embedded, active }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mounted = useHydrated();
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [choices, setChoices] = useState<ConsultantApiResponse["choices"]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [leadScore, setLeadScore] = useState<number | null>(null);
  const [phase, setPhase] = useState<string>("welcome");
  const [downloadMenuOpen, setDownloadMenuOpen] = useState(false);
  const [briefEmailed, setBriefEmailed] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (!(active ?? true)) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, choices, brief, open, active]);

  const applyResponse = useCallback(
    (
      data: ConsultantApiResponse & {
        session?: ConsultationSession;
        clientBriefEmailed?: boolean;
      }
    ) => {
      if (data.sessionId) setSessionId(data.sessionId);
      if (data.session) setSession(data.session);
      setPhase(data.phase);
      setChoices(data.choices ?? []);
      setMultiSelect(Boolean(data.multiSelect));
      setPicked([]);
      if (data.brief) setBrief(data.brief);
      if (data.leadScore != null) setLeadScore(data.leadScore);
      if (typeof data.clientBriefEmailed === "boolean") {
        setBriefEmailed(data.clientBriefEmailed);
      }
      if (data.reply) {
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: data.reply }]);
      }
    },
    []
  );

  const sendAction = useCallback(
    async (payload: {
      action?: "start" | "message" | "select" | "skip_contact";
      message?: string;
      selections?: string[];
    }) => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/project-consultant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionId || undefined,
            session: session ?? undefined,
            ...payload,
          }),
        });
        const data = (await response.json()) as ConsultantApiResponse & { session?: ConsultationSession; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Request failed");
        applyResponse(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [applyResponse, session, sessionId]
  );

  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      return;
    }
    if (!(active ?? true)) return;
    if (startedRef.current) return;
    startedRef.current = true;
    void sendAction({ action: "start" });
  }, [open, active, sendAction]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [...prev, { id: uid(), role: "user", content: text }]);
    setInput("");
    if (phase === "contact" && text.toLowerCase() === "skip") {
      await sendAction({ action: "skip_contact" });
      return;
    }
    await sendAction({ action: "message", message: text });
  };

  const confirmSelections = async (selections: string[]) => {
    if (!selections.length || loading) return;
    setMessages((prev) => [...prev, { id: uid(), role: "user", content: selections.join(", ") }]);
    setPicked([]);
    await sendAction({ action: "select", selections });
  };

  const handleChoiceClick = (choiceId: string, active: boolean) => {
    if (multiSelect) {
      setPicked((prev) => (active ? prev.filter((x) => x !== choiceId) : [...prev, choiceId]));
      return;
    }
    void confirmSelections([choiceId]);
  };

  const reset = () => {
    startedRef.current = false;
    setMessages([]);
    setSession(null);
    setSessionId("");
    setChoices([]);
    setBrief(null);
    setLeadScore(null);
    setBriefEmailed(false);
    setDownloadMenuOpen(false);
    setPhase("welcome");
    setInput("");
    setError("");
    startedRef.current = true;
    void sendAction({ action: "start" });
  };

  if (!mounted) return null;
  if (!open && embedded) return null;

  const inner = (
    <>
      {!embedded ? (
        <header className="flex items-center justify-between border-b border-border/70 bg-gradient-to-r from-primary/[0.12] to-transparent px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
              <Bot className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">AI Project Consultant</p>
              <p className="text-[10px] text-foreground/50">Build your project brief</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={reset} className="rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-foreground" aria-label="Reset">
              <RotateCcw className="size-4" />
            </button>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-foreground/50 hover:bg-muted hover:text-foreground" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
        </header>
      ) : (
        <div className="flex shrink-0 items-center justify-end border-b border-border/60 px-3 py-1.5">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Reset"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      )}

      <div ref={listRef} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "mb-3 max-w-[92%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-gradient-to-br from-[#ff6a00] to-[#ff7d22] text-white"
                    : "mr-auto border border-border/70 bg-card/80 text-foreground"
                )}
              >
                {m.content}
              </div>
            ))}

            {brief && <BriefCard brief={brief} leadScore={leadScore ?? undefined} />}

            {brief && briefEmailed ? (
              <p className="mt-3 text-xs leading-relaxed text-foreground/55">
                We also emailed this brief to you with Awud Digitals branding. Check your inbox (and spam) shortly.
              </p>
            ) : null}

            {brief && (
              <div className="mt-4 grid gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setDownloadMenuOpen((v) => !v)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-2.5 text-sm font-medium transition hover:border-[#ff6a00]/40"
                  >
                    <Download className="size-4" /> Download proposal
                  </button>
                  {downloadMenuOpen ? (
                    <div className="absolute inset-x-0 bottom-[calc(100%+0.4rem)] z-10 overflow-hidden rounded-xl border border-border/80 bg-card shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm hover:bg-muted/60"
                        onClick={() => {
                          downloadBriefPdf(brief);
                          setDownloadMenuOpen(false);
                        }}
                      >
                        <FileText className="size-4 text-[#ff6a00]" />
                        PDF — modern proposal
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 border-t border-border/60 px-3.5 py-2.5 text-left text-sm hover:bg-muted/60"
                        onClick={() => {
                          downloadBriefMarkdown(brief);
                          setDownloadMenuOpen(false);
                        }}
                      >
                        <FileText className="size-4 text-foreground/50" />
                        Markdown (.md)
                      </button>
                    </div>
                  ) : null}
                </div>
                <Link
                  href="/#contact"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl bg-foreground py-2.5 text-sm font-semibold text-background"
                >
                  <Calendar className="size-4" /> Book consultation
                </Link>
                <Link
                  href="/#ecosystem"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 py-2.5 text-sm font-semibold text-foreground"
                >
                  <Layers className="size-4" /> Deploy through Mr.Software
                </Link>
              </div>
            )}

            {loading && (
              <PlanTypingIndicator label={phase === "contact" ? "Building your brief…" : undefined} />
            )}
          </div>

          {!brief && (
            <div className="border-t border-border/70 p-3">
              {choices && choices.length > 0 ? (
                <div className="mb-3">
                  <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/40">
                    Suggestions — or type your own
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {choices.map((c) => {
                      const activeChoice = picked.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={loading}
                          onClick={() => handleChoiceClick(c.id, activeChoice)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                            activeChoice
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground/75 hover:border-primary/40"
                          )}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                  {multiSelect && picked.length > 0 ? (
                    <button
                      type="button"
                      disabled={!picked.length || loading}
                      onClick={() => void confirmSelections(picked)}
                      className="mt-3 w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                    >
                      Continue with selected
                    </button>
                  ) : null}
                </div>
              ) : null}

              {phase === "contact" ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void sendAction({ action: "skip_contact" })}
                  className="mb-2 text-xs font-medium text-foreground/50 hover:text-primary"
                >
                  Skip — show my brief
                </button>
              ) : null}

              <form onSubmit={handleSubmit}>
                <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-card/50 p-2">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    placeholder={
                      phase === "contact"
                        ? "Name and email…"
                        : phase === "need"
                          ? "Describe the real problem or opportunity…"
                          : phase === "expectations"
                            ? "What does success look like when it’s done…"
                            : phase === "payments"
                              ? "Type payments, or tap suggestions…"
                              : "Chat with me about your project…"
                    }
                    disabled={loading}
                    className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSubmit();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40"
                  >
                    <SendHorizontal className="size-4" />
                  </button>
                </div>
                {error ? <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p> : null}
              </form>
            </div>
          )}
    </>
  );

  if (embedded) {
    return <div className="flex min-h-0 flex-1 flex-col">{inner}</div>;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          id="floating-project-consultant-panel"
          role="dialog"
          aria-label="AI Project Consultant"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "fixed z-[70] flex w-[min(100vw-1rem,420px)] flex-col overflow-hidden rounded-[1.35rem] border border-border/80 bg-background/95 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl",
            "bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] right-[max(0.75rem,env(safe-area-inset-right))] sm:bottom-[5.75rem] sm:right-6",
            "max-h-[min(78vh,640px)]",
            className
          )}
        >
          {inner}
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
