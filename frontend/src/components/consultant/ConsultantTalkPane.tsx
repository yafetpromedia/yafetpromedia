"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, SendHorizontal } from "lucide-react";
import { useConsultantSession } from "@/components/consultant/ConsultantSessionContext";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
  onOpenPlan?: () => void;
};

function TypingDots() {
  return (
    <div className="mb-3 mr-auto flex max-w-[88%] items-center gap-1.5 rounded-2xl rounded-bl-md border border-border/70 bg-muted/40 px-3.5 py-2.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-primary/70"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function ConsultantTalkPane({ active, onOpenPlan }: Props) {
  const {
    messages,
    loading,
    error,
    choices,
    multiSelect,
    providerError,
    ensureStarted,
    send,
    reset,
  } = useConsultantSession();
  const [input, setInput] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (active) void ensureStarted();
  }, [active, ensureStarted]);

  useEffect(() => {
    if (!active) return;
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loading, choices, active]);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading || sendingRef.current) return;
    sendingRef.current = true;
    setInput("");
    try {
      await send({ action: "message", message: text });
    } finally {
      sendingRef.current = false;
    }
  };

  const confirmSelections = async () => {
    if (!picked.length || loading) return;
    const sels = [...picked];
    setPicked([]);
    await send({ action: "select", selections: sels });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-end border-b border-border/50 px-3 py-1.5">
        <button
          type="button"
          onClick={() => void reset()}
          className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Reset conversation"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>

      <div
        ref={listRef}
        data-lenis-prevent
        role="log"
        aria-live="polite"
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
              m.role === "user"
                ? "ml-auto rounded-br-md bg-foreground text-background"
                : "mr-auto rounded-bl-md border border-border/70 bg-card text-foreground"
            )}
          >
            {m.content}
          </div>
        ))}
        {loading ? <TypingDots /> : null}
        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-300">
            {error}
            {providerError ? (
              <span className="ml-1 text-foreground/60">Edit your message and send again.</span>
            ) : null}
          </div>
        ) : null}
      </div>

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
                    onClick={() => {
                      if (multiSelect) {
                        setPicked((prev) =>
                          activeChoice ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                        );
                        return;
                      }
                      void send({ action: "select", selections: [c.id] });
                    }}
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
                disabled={loading}
                onClick={() => void confirmSelections()}
                className="mt-3 w-full rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                Continue with selected
              </button>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)}>
          <div className="flex items-end gap-2 rounded-2xl border border-border/80 bg-card/50 p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="Chat about your project…"
              disabled={loading}
              className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted-foreground"
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
              aria-label="Send"
            >
              <SendHorizontal className="size-4" />
            </button>
          </div>
        </form>

        {onOpenPlan ? (
          <button
            type="button"
            onClick={onOpenPlan}
            className="mt-2 w-full text-center text-[11px] font-medium text-muted-foreground hover:text-primary"
          >
            Open Plan workspace →
          </button>
        ) : null}
      </div>
    </div>
  );
}
