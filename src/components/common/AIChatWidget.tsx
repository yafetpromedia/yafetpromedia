"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Mic, Send, Volume2, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";

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

export default function AIChatWidget() {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: `${content.aiName}: ${t("greeting")}` },
  ]);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

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
        body: JSON.stringify({ message: text, history: nextMessages, businessName: "Yafet Pro Media" }),
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
    <div className="fixed bottom-6 left-6 z-[65]">
      {isOpen && (
        <div className="mb-3 w-[min(92vw,380px)] h-[500px] rounded-3xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="h-14 px-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="size-4 text-primary" />
              <span>{t("aiAssistant")}</span>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X className="size-4 text-foreground/60" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
                  message.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-background border border-border text-foreground/85"
                }`}
              >
                {message.content}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t("typeMessage")}
                className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button type="button" onClick={toggleListening} className="size-10 rounded-xl border border-border grid place-items-center">
                <Mic className={`size-4 ${isListening ? "text-primary" : "text-foreground/70"}`} />
              </button>
              <button type="submit" disabled={isLoading} className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center">
                <Send className="size-4" />
              </button>
            </div>
            <div className="mt-2 text-[11px] text-foreground/45 flex items-center gap-1">
              <Volume2 className="size-3" />
              {canUseSpeech ? `${t("talk")} + voice reply enabled` : "Voice unavailable in this browser"}
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-12 px-4 rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_rgba(255,106,0,0.35)] inline-flex items-center gap-2 font-semibold"
      >
        <MessageCircle className="size-4" />
        {t("aiAssistant")}
      </button>
    </div>
  );
}
