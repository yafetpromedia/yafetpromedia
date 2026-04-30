"use client";

import Link from "next/link";
import { Bot, CheckCircle2, Cpu, KeyRound, Sparkles } from "lucide-react";
import type { AIStatus } from "@/app/admin/types";
import { cn } from "@/lib/utils";

type Props = { aiStatus: AIStatus; assistantName: string };

const sectionShell =
  "rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm dark:bg-card/35 sm:p-8";

function providerAccent(provider: AIStatus["activeProvider"]) {
  switch (provider) {
    case "Gemini":
      return "border-blue-500/35 bg-blue-500/[0.09] text-blue-900 ring-blue-500/25 dark:text-blue-300";
    case "OpenAI":
      return "border-emerald-500/35 bg-emerald-500/[0.09] text-emerald-950 ring-emerald-500/25 dark:text-emerald-300";
    case "Fallback":
      return "border-amber-500/40 bg-amber-500/[0.1] text-amber-950 ring-amber-500/30 dark:text-amber-200";
  }
}

export default function AdminAIProviderSection({ aiStatus, assistantName }: Props) {
  const { activeProvider, geminiConfigured, openAIConfigured, geminiModel, openAIModel } = aiStatus;

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-sky-500/[0.12] via-card/92 to-violet-500/[0.08] p-6 shadow-[0_28px_80px_-44px_rgba(56,189,248,0.28)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-sky-400/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-violet-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/18 text-sky-900 ring-1 ring-sky-500/28 dark:text-sky-400">
              <Cpu className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-900/90 dark:text-sky-400/95">
                Runtime · Environment
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">AI Provider</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Which cloud model powers the public assistant depends on API keys present at deploy time. Gemini is tried
                first when configured; otherwise OpenAI; otherwise responses fall back to offline prompts.
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border px-4 py-2.5 font-mono text-[11px] font-semibold tracking-wide backdrop-blur-sm",
              providerAccent(activeProvider)
            )}
          >
            <Sparkles className="size-3.5 opacity-90" />
            Active: {activeProvider}
          </div>
        </div>
      </div>

      {/* Env hint */}
      <div className="rounded-2xl border border-sky-500/18 bg-sky-500/[0.05] px-4 py-3.5 text-sm leading-relaxed text-foreground/72 ring-1 ring-sky-500/12 dark:bg-sky-500/[0.08]">
        <span className="mr-1 inline-flex items-center gap-1.5 align-middle">
          <KeyRound className="size-3.5 text-sky-700 dark:text-sky-400" />
        </span>
        Keys are read from server environment variables (for example{" "}
        <code className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[12px] text-foreground/85 ring-1 ring-border/70">
          GEMINI_API_KEY
        </code>{" "}
        and{" "}
        <code className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[12px] text-foreground/85 ring-1 ring-border/70">
          OPENAI_API_KEY
        </code>
        ). Redeploy after changing secrets so the dashboard reflects the new configuration.
      </div>

      {/* Routing */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <Bot className="size-4 text-primary" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Routing</h4>
        </div>
        <div className="rounded-2xl border border-primary/18 bg-primary/[0.06] px-5 py-5 ring-1 ring-primary/12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">Selected provider</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-primary">{activeProvider}</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/60">
            Gemini wins when configured; otherwise OpenAI; otherwise the assistant runs on fallback prompts without live API
            calls.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-start gap-3 rounded-2xl border border-white/[0.06] bg-background/45 px-4 py-4 dark:bg-white/[0.03]">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0 text-sm leading-relaxed text-foreground/72">
            <span className="font-semibold text-foreground">Assistant display name</span> on the site:{" "}
            <strong className="text-foreground">{assistantName.trim() !== "" ? assistantName : "—"}</strong>
            . Edit it under{" "}
            <Link href="/admin/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
              Contact & Assistant
            </Link>
            .
          </div>
        </div>
      </section>

      {/* Providers & keys */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <KeyRound className="size-4 text-violet-600/85 dark:text-violet-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Models & credentials</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex gap-3 rounded-2xl border border-white/[0.06] bg-background/55 p-4 dark:bg-white/[0.03]">
            <CheckCircle2
              className={cn(
                "mt-0.5 size-5 shrink-0",
                geminiConfigured ? "text-emerald-500 dark:text-emerald-400" : "text-foreground/22"
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">Gemini</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    geminiConfigured
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-500/12 text-red-600 dark:text-red-400"
                  )}
                >
                  {geminiConfigured ? "Key detected" : "Missing"}
                </span>
              </div>
              <p className="font-mono text-[12px] leading-snug text-foreground/55">{geminiModel}</p>
              <p className="text-xs leading-relaxed text-foreground/50">
                {geminiConfigured ? "API key is present on the server." : "Add GEMINI_API_KEY to enable Gemini routing."}
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-2xl border border-white/[0.06] bg-background/55 p-4 dark:bg-white/[0.03]">
            <CheckCircle2
              className={cn(
                "mt-0.5 size-5 shrink-0",
                openAIConfigured ? "text-emerald-500 dark:text-emerald-400" : "text-foreground/22"
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">OpenAI</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    openAIConfigured
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-500/12 text-red-600 dark:text-red-400"
                  )}
                >
                  {openAIConfigured ? "Key detected" : "Missing"}
                </span>
              </div>
              <p className="font-mono text-[12px] leading-snug text-foreground/55">{openAIModel}</p>
              <p className="text-xs leading-relaxed text-foreground/50">
                {openAIConfigured ? "API key is present on the server." : "Add OPENAI_API_KEY for OpenAI routing."}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
