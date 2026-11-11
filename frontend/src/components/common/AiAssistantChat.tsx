"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ClipboardList,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  SendHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { stripPlanActionMarker } from "@/lib/ai-hub.shared";
import { cn } from "@/lib/utils";

type Message = { id: string; role: "user" | "assistant"; content: string; suggestPlan?: boolean };

type SpeechRecognitionInstance = {
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    SpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

const QUICK_PROMPT_KEYS = [
  "aiPromptServices",
  "aiPromptPricing",
  "aiPromptTimeline",
  "aiPromptPlan",
  "aiPromptMrSoftware",
] as const;

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatMessageContent(content: string) {
  return content.split(/\n{2,}|\n/).filter(Boolean);
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-accent/80"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  className?: string;
  embedded?: boolean;
  active?: boolean;
  onOpenPlan?: () => void;
};

export default function AiAssistantChat({ open, onClose, className, embedded, active, onOpenPlan }: Props) {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const assistantName = content.aiName.trim() || "Awud AI";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceReply, setVoiceReply] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottomRef = useRef(true);

  const canUseSpeech = useMemo(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  const quickPrompts = useMemo(
    () => QUICK_PROMPT_KEYS.map((key) => ({ key, label: t(key) })),
    [t]
  );

  const seedGreeting = useCallback(() => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: t("greeting").replace("{name}", assistantName),
        suggestPlan: Boolean(onOpenPlan),
      },
    ]);
    setError("");
    setInput("");
  }, [assistantName, onOpenPlan, t]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open && (active ?? true) && messages.length === 0) seedGreeting();
  }, [open, active, messages.length, seedGreeting]);

  useEffect(() => {
    if (!open || !(active ?? true) || !stickToBottomRef.current) return;
    const node = listRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isStreaming, open, active]);

  const handleMessagesScroll = () => {
    const node = listRef.current;
    if (!node) return;
    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    stickToBottomRef.current = distance < 72;
  };

  useEffect(() => {
    if (open && (active ?? true)) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, active]);

  const speak = useCallback((text: string) => {
    if (!voiceReply || typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    window.speechSynthesis?.speak(utterance);
  }, [voiceReply]);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || isStreaming) return;

      setError("");
      const userMessage: Message = { id: uid(), role: "user", content: text };
      const assistantId = uid();
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [
        ...prev,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      stickToBottomRef.current = true;
      setInput("");
      setIsStreaming(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      let accumulated = "";
      let suggestPlan = false;

      const updateAssistant = (content: string, planAction?: boolean) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content, suggestPlan: planAction ?? m.suggestPlan }
              : m
          )
        );
      };

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            message: text,
            history,
            businessName: "Awud Digitals",
            stream: true,
          }),
        });

        const contentType = response.headers.get("content-type") ?? "";

        if (contentType.includes("text/event-stream") && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split("\n\n");
            buffer = chunks.pop() ?? "";

            for (const chunk of chunks) {
              const line = chunk.trim();
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload) continue;
              const data = JSON.parse(payload) as {
                delta?: string;
                done?: boolean;
                error?: string;
              };
              if (data.error) throw new Error(data.error);
              if (data.delta) {
                accumulated += data.delta;
                const parsed = stripPlanActionMarker(accumulated);
                if (parsed.suggestPlan) suggestPlan = true;
                updateAssistant(parsed.content, suggestPlan);
              }
            }
          }

          if (!accumulated.trim()) {
            throw new Error("Empty response");
          }
          const parsed = stripPlanActionMarker(accumulated);
          accumulated = parsed.content;
          suggestPlan = parsed.suggestPlan;
          updateAssistant(parsed.content, suggestPlan);
          speak(parsed.content);
        } else {
          const data = (await response.json()) as { reply?: string; error?: string };
          if (!response.ok) throw new Error(data.error ?? "Request failed");
          const reply =
            data.reply ??
            "I can help with services, timelines, and the right setup for your business. What are you building?";
          const parsed = stripPlanActionMarker(reply);
          accumulated = parsed.content;
          suggestPlan = parsed.suggestPlan;
          updateAssistant(parsed.content, suggestPlan);
          speak(parsed.content);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const fallback =
          "I could not reach the assistant right now. Please try again or book a call with our team.";
        setError(fallback);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: accumulated.trim() || fallback } : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, speak]
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const toggleListening = () => {
    if (!canUseSpeech) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const RecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!RecognitionCtor) return;
    const recognition = new RecognitionCtor();
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      setInput(transcript.trim());
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  if (!mounted || !open) return null;

  const panel = (
    <motion.div
      id={embedded ? undefined : "floating-ai-chat-panel"}
      role={embedded ? undefined : "dialog"}
      aria-label={embedded ? undefined : t("aiAssistant")}
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      initial={embedded ? false : { opacity: 0, y: 16, scale: 0.98 }}
      animate={embedded ? undefined : { opacity: 1, y: 0, scale: 1 }}
      exit={embedded ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
      transition={embedded ? undefined : { type: "spring", stiffness: 420, damping: 34 }}
      className={cn(
        embedded
          ? "flex min-h-0 flex-1 flex-col"
          : [
              "fixed z-[80] flex flex-col overflow-hidden bg-card",
              "border border-border/70 shadow-lg",
              "inset-x-0 bottom-0 top-[max(0.75rem,env(safe-area-inset-top))] rounded-t-[1.5rem]",
              "sm:inset-auto sm:right-6 sm:bottom-6 sm:top-auto sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[min(420px,calc(100vw-3rem))] sm:rounded-[1.5rem]",
            ],
        className
      )}
    >
      {!embedded ? (
      <div className="relative shrink-0 border-b border-border/60 px-4 py-3.5">
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <Bot className="size-4" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-semibold leading-tight tracking-tight text-foreground">
                {assistantName}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-none text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {t("aiOnline")}
                </span>
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="size-3 shrink-0 text-accent" />
                  {t("aiPowered")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={seedGreeting}
              className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label={t("aiReset")}
            >
              <RotateCcw className="size-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between gap-2 px-3 pt-2 sm:px-4">
          <p className="text-[11px] text-muted-foreground">Ask anything about Awud Digitals</p>
          <button
            type="button"
            onClick={seedGreeting}
            className="inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={t("aiReset")}
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      )}

      <div
        ref={listRef}
        data-lenis-prevent
        onScroll={handleMessagesScroll}
        onWheel={(e) => e.stopPropagation()}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3 py-3 sm:px-4 sm:py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/15"
      >
        <AnimatePresence initial={false}>
          <div className="flex flex-col gap-3.5">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const paragraphs = formatMessageContent(message.content);
              const isTyping = !isUser && isStreaming && !message.content;
              const showPlanAction = !isUser && Boolean(onOpenPlan && message.suggestPlan);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
                >
                  {!isUser ? (
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/20">
                      <Bot className="size-3.5" />
                    </span>
                  ) : null}
                  <div className={cn("flex max-w-[min(92%,22rem)] flex-col gap-2 sm:max-w-[85%]", isUser ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed sm:text-sm",
                        isUser
                          ? "rounded-br-md bg-foreground text-background"
                          : "rounded-bl-md border border-border/70 bg-muted/50 text-foreground/90"
                      )}
                    >
                      {isTyping ? (
                        <TypingIndicator />
                      ) : (
                        paragraphs.map((paragraph, index) => (
                          <p key={index} className={index > 0 ? "mt-2" : undefined}>
                            {paragraph}
                          </p>
                        ))
                      )}
                    </div>
                    {showPlanAction && !isTyping ? (
                      <button
                        type="button"
                        onClick={onOpenPlan}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-2 text-[11px] font-semibold text-accent transition hover:bg-accent/15"
                      >
                        <ClipboardList className="size-3.5" />
                        {t("aiOpenPlan")}
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-center text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}
      </div>

      <div className="shrink-0 border-t border-border/60 bg-background/80 px-3 pt-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] sm:px-4">
        <div
          className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          data-lenis-prevent
          onWheel={(e) => e.stopPropagation()}
        >
          {quickPrompts.map((prompt) => (
            <button
              key={prompt.key}
              type="button"
              disabled={isStreaming}
              onClick={() => {
                if (prompt.key === "aiPromptPlan" && onOpenPlan) {
                  onOpenPlan();
                  return;
                }
                void sendMessage(prompt.label);
              }}
              className="shrink-0 rounded-full border border-border/70 bg-card px-3 py-2 text-[11px] font-medium leading-none text-foreground/70 transition hover:border-accent/35 hover:text-foreground disabled:opacity-40"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative min-w-0 flex-1 rounded-2xl border border-border/70 bg-muted/40 focus-within:border-accent/40">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("typeMessage")}
              disabled={isStreaming}
              className="max-h-28 min-h-[48px] w-full resize-none bg-transparent px-3.5 py-3 pr-11 text-sm leading-normal text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-60"
            />
            <button
              type="button"
              onClick={toggleListening}
              disabled={!canUseSpeech || isStreaming}
              className="absolute bottom-2 right-2 inline-flex size-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
              aria-label={isListening ? t("stop") : t("talk")}
            >
              {isListening ? <MicOff className="size-4 text-accent" /> : <Mic className="size-4" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground transition hover:opacity-90 disabled:opacity-45"
            aria-label={t("send")}
          >
            {isStreaming ? <Loader2 className="size-4 animate-spin" /> : <SendHorizontal className="size-4" />}
          </button>
        </form>

        <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] leading-none text-muted-foreground">
          <button
            type="button"
            onClick={() => setVoiceReply((v) => !v)}
            className="inline-flex min-h-8 items-center gap-1.5 transition hover:text-foreground"
          >
            {voiceReply ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
            {voiceReply ? t("aiVoiceOn") : t("aiVoiceOff")}
          </button>
          <Link
            href="#book-call"
            onClick={onClose}
            className="inline-flex min-h-8 items-center font-medium text-accent hover:opacity-80"
          >
            {t("bookCall")} →
          </Link>
        </div>
      </div>
    </motion.div>
  );

  if (embedded) return panel;
  return createPortal(panel, document.body);
}
