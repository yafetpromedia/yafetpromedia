"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Bot, MessageCircle, Mic, PhoneCall, Send, Volume2, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; content: string };

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

const shellCls =
  "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[65] sm:bottom-6 sm:right-6";

export default function FloatingActionCluster() {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `${content.aiName}: ${t("greeting")}` },
  ]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { stiffness: 140, damping: 24 });
  const y = useTransform(smoothY, [0, 180], [80, 0]);
  const opacity = useTransform(smoothY, [0, 120], [0, 1]);

  const clusterHover = reduceMotion ? {} : { y: -6 };
  const clusterSpring = reduceMotion
    ? { duration: 0.15 }
    : { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.55 };

  const canUseSpeech = useMemo(
    () => typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    const nextMessages = [...messages, { role: "user" as const, content: text }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages, businessName: "Yafetpromedia" }),
      });
      const data = (await response.json()) as { reply?: string };
      const reply = data.reply ?? "I can help with services, timeline, and next steps. Please share your project goals.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(reply));
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I could not connect right now. Please try again in a moment." },
      ]);
    } finally {
      setIsLoading(false);
    }
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
      setInput((prev) => `${prev} ${transcript}`.trim());
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  return (
    <motion.div style={{ y, opacity }} className={shellCls}>
      <div className="relative">
      {/* Glow behind the FAB pair */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 blur-3xl opacity-[0.55] dark:opacity-[0.65]"
        style={{
          background:
            "radial-gradient(ellipse 85% 75% at 90% 88%, rgba(255,106,0,0.42), transparent 52%), radial-gradient(circle at 40% 35%, rgba(251,191,36,0.1), transparent 45%)",
        }}
      />

      <motion.div
        initial={false}
        whileHover={clusterHover}
        transition={clusterSpring}
        className="relative flex flex-col items-end gap-2"
      >
        {chatOpen && (
          <div
            id="floating-ai-chat-panel"
            role="dialog"
            aria-label={t("aiAssistant")}
            className="absolute bottom-[calc(100%+14px)] right-0 z-[70] flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/95 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 dark:border-white/[0.08] dark:bg-[#0f172a]/96 dark:shadow-[0_28px_70px_-20px_rgba(0,0,0,0.55)]"
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/80 px-4 dark:border-white/[0.06]">
              <div className="flex items-center gap-2.5 text-sm font-semibold">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                  <Bot className="size-[1.1rem]" />
                </span>
                <span>{t("aiAssistant")}</span>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="rounded-full p-2 text-foreground/50 transition hover:bg-foreground/10 hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[min(52vh,420px)] flex-1 space-y-3 overflow-y-auto p-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "ml-auto w-fit max-w-[88%] break-words bg-primary text-primary-foreground"
                      : "max-w-[88%] border border-border bg-background text-foreground/85"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-border p-3 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={t("typeMessage")}
                  className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={toggleListening}
                  className="grid size-10 shrink-0 place-items-center rounded-xl border border-border"
                >
                  <Mic className={`size-4 ${isListening ? "text-primary" : "text-foreground/70"}`} />
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"
                >
                  <Send className="size-4" />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-foreground/45">
                <Volume2 className="size-3" />
                {canUseSpeech ? `${t("talk")} + voice reply enabled` : "Voice unavailable in this browser"}
              </div>
            </form>
          </div>
        )}

        {/* AI — flex-row-reverse: icon stays right; max-width expands snugly with label */}
        <button
          type="button"
          aria-expanded={chatOpen}
          aria-controls="floating-ai-chat-panel"
          aria-label={t("aiAssistant")}
          onClick={() => setChatOpen((prev) => !prev)}
          className={cn(
            "group/ai relative inline-flex h-10 min-h-10 max-w-10 cursor-pointer flex-row-reverse items-center gap-2 overflow-hidden rounded-full px-0 shadow-md backdrop-blur-md transition-[max-width,padding,transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[max-width] motion-reduce:duration-300 motion-reduce:will-change-auto",
            "hover:max-w-[min(calc(100vw-2rem),14rem)] hover:px-2 hover:-translate-x-px hover:shadow-[0_8px_32px_-8px_rgba(255,106,0,0.28)] focus-visible:max-w-[min(calc(100vw-2rem),14rem)] focus-visible:px-2 focus-visible:-translate-x-px focus-visible:shadow-[0_8px_32px_-8px_rgba(255,106,0,0.28)] active:translate-x-0",
            "motion-reduce:hover:-translate-x-0 motion-reduce:focus-visible:-translate-x-0",
            chatOpen &&
              "max-w-[min(calc(100vw-2rem),14rem)] -translate-x-px px-2 shadow-[0_10px_36px_-10px_rgba(255,106,0,0.35)] sm:max-w-[15rem]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            chatOpen
              ? "bg-gradient-to-br from-[#ff6a00] via-[#ff7d22] to-[#ff9139] text-white ring-1 ring-orange-400/35"
              : "border border-[#ff6a00]/75 bg-background/90 text-[#ff6a00] hover:border-orange-400 hover:bg-[#ff6a00]/[0.07] dark:border-orange-400/65 dark:bg-[#0f172a]/92 dark:text-orange-300 dark:hover:bg-orange-500/14"
          )}
        >
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 group-hover/ai:scale-[1.03] group-focus-visible/ai:scale-[1.03] motion-reduce:group-hover:scale-100">
            <MessageCircle className="size-[17px] shrink-0 stroke-[2.35]" aria-hidden />
          </span>
          <span
            className={cn(
              "max-w-0 shrink-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold tracking-wide transition-[max-width,opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 motion-reduce:blur-none",
              "translate-x-1 opacity-0 blur-[1px] group-hover/ai:max-w-[11rem] group-hover/ai:translate-x-0 group-hover/ai:opacity-100 group-hover/ai:blur-none group-focus-visible/ai:max-w-[11rem] group-focus-visible/ai:translate-x-0 group-focus-visible/ai:opacity-100 group-focus-visible/ai:blur-none",
              chatOpen && "max-w-[11rem] translate-x-0 opacity-100 blur-none",
              chatOpen ? "text-white" : "text-foreground dark:text-orange-50"
            )}
          >
            {t("aiAssistant")}
          </span>
        </button>

        {/* Book call — same row-reverse + smooth expand */}
        <Link
          href="#contact"
          aria-label={t("bookCall")}
          className={cn(
            "group/call relative inline-flex h-10 min-h-10 max-w-10 flex-row-reverse items-center gap-2 overflow-hidden rounded-full px-0 transition-[max-width,padding,transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[max-width] motion-reduce:duration-300 motion-reduce:will-change-auto",
            "bg-gradient-to-br from-[#ff6a00] via-[#ff7316] to-[#ffa033] text-white shadow-[0_10px_36px_-12px_rgba(255,106,0,0.52)] ring-1 ring-white/15",
            "hover:max-w-[min(calc(100vw-2rem),12rem)] hover:px-2 hover:-translate-x-px hover:brightness-[1.03] hover:shadow-[0_14px_44px_-14px_rgba(255,106,0,0.68)] focus-visible:max-w-[min(calc(100vw-2rem),12rem)] focus-visible:px-2 focus-visible:-translate-x-px active:translate-x-0",
            "motion-reduce:hover:-translate-x-0 motion-reduce:focus-visible:-translate-x-0",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:shadow-[0_12px_40px_-14px_rgba(255,106,0,0.48)] dark:ring-white/10"
          )}
        >
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 group-hover/call:scale-[1.03] group-focus-visible/call:scale-[1.03] motion-reduce:group-hover:scale-100">
            <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_26%,rgba(255,255,255,0.42),transparent_52%)] opacity-90" />
            <PhoneCall className="relative size-[17px] shrink-0 stroke-[2.35]" aria-hidden />
          </span>
          <span className="max-w-0 shrink-0 overflow-hidden whitespace-nowrap text-[11px] font-semibold tracking-wide text-white/95 opacity-0 blur-[1px] transition-[max-width,opacity,transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:duration-300 motion-reduce:blur-none translate-x-1 group-hover/call:max-w-[9rem] group-hover/call:translate-x-0 group-hover/call:opacity-100 group-hover/call:blur-none group-focus-visible/call:max-w-[9rem] group-focus-visible/call:translate-x-0 group-focus-visible/call:opacity-100 group-focus-visible/call:blur-none">
            {t("bookCall")}
          </span>
        </Link>
      </motion.div>
      </div>
    </motion.div>
  );
}
