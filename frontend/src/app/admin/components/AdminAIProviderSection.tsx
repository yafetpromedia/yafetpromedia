"use client";

import Link from "next/link";
import {
  Activity,
  Bot,
  CheckCircle2,
  Cpu,
  KeyRound,
  MessageSquare,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";
import type { AIStatus } from "@/app/admin/types";
import { cn } from "@/lib/utils";

type Props = { aiStatus: AIStatus; assistantName: string };

const sectionShell =
  "rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm dark:bg-card/35 sm:p-8";

function providerAccent(provider: AIStatus["activeProvider"]) {
  switch (provider) {
    case "FreeModel":
      return "border-violet-500/35 bg-violet-500/[0.09] text-violet-950 ring-violet-500/25 dark:text-violet-300";
    case "Gemini":
      return "border-blue-500/35 bg-blue-500/[0.09] text-blue-900 ring-blue-500/25 dark:text-blue-300";
    case "OpenAI":
      return "border-emerald-500/35 bg-emerald-500/[0.09] text-emerald-950 ring-emerald-500/25 dark:text-emerald-300";
    case "Fallback":
      return "border-amber-500/40 bg-amber-500/[0.1] text-amber-950 ring-amber-500/30 dark:text-amber-200";
  }
}

const ROUTING_STEPS: Array<{ label: string; key: keyof AIStatus | "active" }> = [
  { label: "FreeModel", key: "freeModelConfigured" },
  { label: "Gemini", key: "geminiConfigured" },
  { label: "OpenAI", key: "openAIConfigured" },
  { label: "Fallback", key: "active" },
];

export default function AdminAIProviderSection({ aiStatus, assistantName }: Props) {
  const {
    activeProvider,
    freeModelConfigured,
    geminiConfigured,
    openAIConfigured,
    freeModel,
    freeModelBaseUrl,
    geminiModel,
    openAIModel,
  } = aiStatus;

  const isLive = activeProvider !== "Fallback";

  return (
    <div className="max-w-5xl space-y-8 pb-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.14] via-card/92 to-orange-500/[0.1] p-6 shadow-[0_28px_80px_-44px_rgba(139,92,246,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-violet-400/[0.12] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-orange-400/[0.1] blur-[92px]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="relative flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/18 text-violet-900 ring-1 ring-violet-500/28 dark:text-violet-300">
              <Cpu className="size-6" />
              {isLive ? (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-emerald-400" />
              ) : null}
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-900/90 dark:text-violet-300/95">
                Assistant · Runtime
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
                Live AI stack
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                The public site assistant streams real model responses when a provider key is configured.
                Visitors get quick prompts, voice input, and contextual answers grounded in your CMS content.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-4 py-2.5 font-mono text-[11px] font-semibold tracking-wide backdrop-blur-sm",
                providerAccent(activeProvider)
              )}
            >
              <Sparkles className="size-3.5 opacity-90" />
              Active: {activeProvider}
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-background/50 px-4 py-2.5 text-[11px] font-semibold text-foreground/70">
              <Radio className={cn("size-3.5", isLive ? "text-emerald-400" : "text-amber-400")} />
              {isLive ? "Live responses enabled" : "Offline fallback only"}
            </div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { icon: MessageSquare, label: "Streaming chat", value: isLive ? "Enabled" : "Disabled" },
            { icon: Bot, label: "Assistant name", value: assistantName.trim() || "—" },
            { icon: Zap, label: "Primary model", value: activeProvider === "FreeModel" ? freeModel : activeProvider === "Gemini" ? geminiModel : activeProvider === "OpenAI" ? openAIModel : "Rule-based" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.06] bg-background/45 px-4 py-3.5 dark:bg-white/[0.03]"
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
                <item.icon className="size-3.5" />
                {item.label}
              </div>
              <p className="mt-2 truncate font-display text-lg font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <section className={sectionShell}>
        <div className="mb-5 flex items-center gap-2 border-b border-border/50 pb-4">
          <Activity className="size-4 text-primary" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Request routing</h4>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {ROUTING_STEPS.map((step, index) => {
            const active =
              step.key === "active"
                ? activeProvider === "Fallback"
                : step.key === "freeModelConfigured"
                  ? activeProvider === "FreeModel"
                  : step.key === "geminiConfigured"
                    ? activeProvider === "Gemini"
                    : activeProvider === "OpenAI";
            const configured =
              step.key === "freeModelConfigured"
                ? freeModelConfigured
                : step.key === "geminiConfigured"
                  ? geminiConfigured
                  : step.key === "openAIConfigured"
                    ? openAIConfigured
                    : !isLive;
            return (
              <div key={step.label} className="flex min-w-0 flex-1 items-center gap-2">
                <div
                  className={cn(
                    "min-w-0 flex-1 rounded-2xl border px-4 py-3",
                    active
                      ? "border-primary/30 bg-primary/[0.08] ring-1 ring-primary/15"
                      : "border-white/[0.06] bg-background/40"
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
                    {index + 1}. {step.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {active ? "In use" : configured ? "Configured" : "Not configured"}
                  </p>
                </div>
                {index < ROUTING_STEPS.length - 1 ? (
                  <span className="hidden text-foreground/25 sm:inline">→</span>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <div className="rounded-2xl border border-sky-500/18 bg-sky-500/[0.05] px-4 py-3.5 text-sm leading-relaxed text-foreground/72 ring-1 ring-sky-500/12 dark:bg-sky-500/[0.08]">
        <span className="mr-1 inline-flex items-center gap-1.5 align-middle">
          <KeyRound className="size-3.5 text-sky-700 dark:text-sky-400" />
        </span>
        Configure with{" "}
        <code className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[12px]">AI_API_KEY</code>,{" "}
        <code className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[12px]">AI_BASE_URL</code>, and{" "}
        <code className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[12px]">AI_MODEL</code>. Restart the
        server after updating secrets.
      </div>

      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <Bot className="size-4 text-primary" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Public assistant</h4>
        </div>
        <div className="rounded-2xl border border-primary/18 bg-primary/[0.06] px-5 py-5 ring-1 ring-primary/12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48">Visitor experience</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/68">
            Floating chat with streaming replies, quick prompts, optional voice input, and answers grounded in your
            services, products, and contact details from the CMS.
          </p>
          <p className="mt-3 text-sm text-foreground/72">
            Display name:{" "}
            <strong className="text-foreground">{assistantName.trim() !== "" ? assistantName : "—"}</strong>
            {" · "}
            <Link href="/admin/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
              Edit in Contact & Assistant
            </Link>
          </p>
        </div>
      </section>

      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <KeyRound className="size-4 text-violet-600/85 dark:text-violet-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Providers</h4>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <ProviderCard
            name="FreeModel"
            configured={freeModelConfigured}
            active={activeProvider === "FreeModel"}
            model={freeModel}
            sub={freeModelBaseUrl}
            hint={
              freeModelConfigured
                ? "Primary OpenAI-compatible gateway for live assistant replies."
                : "Add AI_API_KEY to enable streaming responses."
            }
          />
          <ProviderCard
            name="Gemini"
            configured={geminiConfigured}
            active={activeProvider === "Gemini"}
            model={geminiModel}
            hint={geminiConfigured ? "Used when FreeModel is not configured." : "Add GEMINI_API_KEY to enable."}
          />
          <ProviderCard
            name="OpenAI"
            configured={openAIConfigured}
            active={activeProvider === "OpenAI"}
            model={openAIModel}
            hint={openAIConfigured ? "Used when higher-priority providers are unavailable." : "Add OPENAI_API_KEY to enable."}
          />
        </div>
      </section>
    </div>
  );
}

function ProviderCard({
  name,
  configured,
  active,
  model,
  sub,
  hint,
}: {
  name: string;
  configured: boolean;
  active: boolean;
  model: string;
  sub?: string;
  hint: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-4",
        active
          ? "border-primary/25 bg-primary/[0.06] ring-1 ring-primary/12"
          : "border-white/[0.06] bg-background/55 dark:bg-white/[0.03]"
      )}
    >
      <CheckCircle2
        className={cn(
          "mt-0.5 size-5 shrink-0",
          configured ? "text-emerald-500 dark:text-emerald-400" : "text-foreground/22"
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{name}</span>
          {active ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Active
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              configured
                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                : "bg-red-500/12 text-red-600 dark:text-red-400"
            )}
          >
            {configured ? "Ready" : "Missing"}
          </span>
        </div>
        <p className="font-mono text-[12px] leading-snug text-foreground/55">{model}</p>
        {sub ? <p className="truncate font-mono text-[11px] leading-snug text-foreground/45">{sub}</p> : null}
        <p className="text-xs leading-relaxed text-foreground/50">{hint}</p>
      </div>
    </div>
  );
}
