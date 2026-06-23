"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Calendar,
  Download,
  Layers,
  Loader2,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { ConsultantApiResponse, ProjectBrief } from "@/lib/project-consultant.shared";
import type { ConsultationSession } from "@/lib/project-consultant-engine";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string };

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function BriefCard({ brief, leadScore }: { brief: ProjectBrief; leadScore?: number }) {
  return (
    <div className="mt-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] to-card p-4 text-sm">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-primary">Project Brief</p>
      <h4 className="mt-2 font-display text-lg font-bold">{brief.projectType}</h4>
      <ul className="mt-3 space-y-1.5 text-foreground/72">
        <li>Industry: {brief.industry}</li>
        <li>Products: {brief.products}</li>
        <li>Payments: {brief.payments.join(", ") || "—"}</li>
        <li>Timeline: {brief.timeline}</li>
        <li>Budget: {brief.budget}</li>
      </ul>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-foreground/45">Recommended</p>
      <ul className="mt-2 space-y-1">
        {brief.recommendedFeatures.map((f) => (
          <li key={f} className="text-foreground/75">✅ {f}</li>
        ))}
      </ul>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-border/70 bg-background/60 p-2.5">
          <p className="text-foreground/45">Timeline</p>
          <p className="font-semibold">{brief.estimatedTimeline}</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/60 p-2.5">
          <p className="text-foreground/45">Est. cost</p>
          <p className="font-semibold">{brief.estimatedCost}</p>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-primary">
        {brief.leadLabel}
        {leadScore != null ? ` · Score ${leadScore}` : ""}
      </p>
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
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [choices, setChoices] = useState<ConsultantApiResponse["choices"]>([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [brief, setBrief] = useState<ProjectBrief | null>(null);
  const [leadScore, setLeadScore] = useState<number | null>(null);
  const [phase, setPhase] = useState<string>("welcome");

  const listRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    if (!(active ?? true)) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, choices, brief, open, active]);

  const applyResponse = useCallback((data: ConsultantApiResponse & { session?: ConsultationSession }) => {
    if (data.sessionId) setSessionId(data.sessionId);
    if (data.session) setSession(data.session);
    setPhase(data.phase);
    setChoices(data.choices ?? []);
    setMultiSelect(Boolean(data.multiSelect));
    setPicked([]);
    if (data.brief) setBrief(data.brief);
    if (data.leadScore != null) setLeadScore(data.leadScore);
    if (data.reply) {
      setMessages((prev) => [...prev, { id: uid(), role: "assistant", content: data.reply }]);
    }
  }, []);

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
    setPhase("welcome");
    setInput("");
    setError("");
    startedRef.current = true;
    void sendAction({ action: "start" });
  };

  const downloadBrief = () => {
    if (!brief) return;
    const blob = new Blob([brief.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "yafetpromedia-project-brief.md";
    a.click();
    URL.revokeObjectURL(url);
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

            {brief && (
              <div className="mt-4 grid gap-2">
                <button type="button" onClick={downloadBrief} className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium hover:border-primary/40">
                  <Download className="size-4" /> Download proposal
                </button>
                <Link href="/#contact" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                  <Calendar className="size-4" /> Book consultation
                </Link>
                <Link href="/#ecosystem" onClick={onClose} className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.08] py-2.5 text-sm font-semibold text-primary">
                  <Layers className="size-4" /> Deploy through Mr.Software
                </Link>
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-foreground/50">
                <Loader2 className="size-4 animate-spin" /> Thinking…
              </div>
            )}
          </div>

          {choices && choices.length > 0 && !brief && (
            <div className="border-t border-border/60 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {choices.map((c) => {
                  const active = picked.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleChoiceClick(c.id, active)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground/75 hover:border-primary/40"
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {multiSelect && picked.length > 0 && (
                <button
                  type="button"
                  disabled={!picked.length || loading}
                  onClick={() => void confirmSelections(picked)}
                  className="mt-3 w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {!brief && phase === "contact" && (
            <div className="border-t border-border/60 px-4 py-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => void sendAction({ action: "skip_contact" })}
                className="text-xs font-medium text-foreground/50 hover:text-primary"
              >
                Skip — show my brief
              </button>
            </div>
          )}

          {!brief && (!choices || choices.length === 0) && (
            <form onSubmit={handleSubmit} className="border-t border-border/70 p-3">
              <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-card/50 p-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={1}
                  placeholder="Type your answer…"
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
              {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
            </form>
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
