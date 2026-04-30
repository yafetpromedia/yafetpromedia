"use client";

import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Cpu,
  Database,
  Inbox,
  MessageSquareQuote,
  MessageSquareText,
  Minus,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AIStatus, DashboardAnalytics } from "@/app/admin/types";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

function fmtChartDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fmtAbsolute(iso: string) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(t);
}

function fmtRelative(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return fmtAbsolute(iso);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function trendParts(currentSum: number, previousSum: number): {
  label: string;
  tone: "up" | "down" | "flat";
} {
  if (previousSum === 0 && currentSum === 0) return { label: "No change vs prior week", tone: "flat" };
  if (previousSum === 0) return { label: "First activity in window", tone: "up" };
  const raw = ((currentSum - previousSum) / previousSum) * 100;
  const rounded = Math.round(raw);
  if (rounded === 0) return { label: "Flat vs prior week", tone: "flat" };
  return {
    label: `${rounded > 0 ? "+" : ""}${rounded}% vs prior week`,
    tone: rounded > 0 ? "up" : "down",
  };
}

function SparkLine({ values, accent }: { values: number[]; accent: "primary" | "sky" }) {
  const w = 96;
  const h = 28;
  const pad = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i / Math.max(values.length - 1, 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  });
  const stroke = accent === "primary" ? "#ff6a00" : "#38bdf8";
  return (
    <svg width={w} height={h} className="overflow-visible" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
        points={pts.join(" ")}
      />
    </svg>
  );
}

type KpiProps = {
  label: string;
  value: string | number;
  sub?: string;
  trend?: { label: string; tone: "up" | "down" | "flat" };
  spark?: number[];
  icon: ComponentType<{ className?: string }>;
  accent?: "primary" | "muted";
};

function KpiCard({ label, value, sub, trend, spark, icon: Icon, accent = "muted" }: KpiProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card/80 p-5 shadow-sm backdrop-blur-md transition",
        "border-white/[0.06] ring-1 ring-white/[0.04]",
        "hover:border-primary/25 hover:shadow-[0_12px_40px_-24px_rgba(255,106,0,0.45)]"
      )}
    >
      <div className="pointer-events-none absolute inset-px rounded-[15px] bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/45">{label}</p>
          <p
            className={cn(
              "mt-2 font-display text-3xl font-bold tabular-nums tracking-tight",
              accent === "primary" ? "text-primary" : "text-foreground"
            )}
          >
            {value}
          </p>
          {sub && <p className="mt-1.5 text-[13px] leading-snug text-foreground/50">{sub}</p>}
          {trend && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-2.5 py-1 text-[11px] font-medium text-foreground/70 ring-1 ring-border/50">
              {trend.tone === "up" && <ArrowUpRight className="size-3.5 text-emerald-400" />}
              {trend.tone === "down" && <ArrowDownRight className="size-3.5 text-rose-400" />}
              {trend.tone === "flat" && <Minus className="size-3.5 text-foreground/35" />}
              {trend.label}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-transparent text-primary ring-1 ring-primary/20 transition group-hover:ring-primary/35">
            <Icon className="size-5" aria-hidden />
          </span>
          {spark && spark.length > 1 && <SparkLine values={spark} accent={accent === "primary" ? "primary" : "sky"} />}
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminOverviewDashboard({
  analytics,
  aiStatus,
  assistantName,
}: {
  analytics: DashboardAnalytics;
  aiStatus: AIStatus;
  assistantName: string;
}) {
  const [liveClock, setLiveClock] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setLiveClock(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const chartRows = analytics.series.map((row) => ({
    ...row,
    label: fmtChartDay(row.date),
  }));

  const leadSum30 = analytics.series.reduce((s, r) => s + r.leads, 0);
  const chatSum30 = analytics.series.reduce((s, r) => s + r.chats, 0);

  const trendLead = useMemo(() => {
    const s = analytics.series;
    if (s.length < 2) return trendParts(0, 0);
    const last7 = s.slice(-7);
    const prev7 = s.length >= 14 ? s.slice(-14, -7) : [];
    const cur = last7.reduce((a, r) => a + r.leads, 0);
    const prev = prev7.reduce((a, r) => a + r.leads, 0);
    return trendParts(cur, prev);
  }, [analytics.series]);

  const trendChat = useMemo(() => {
    const s = analytics.series;
    if (s.length < 2) return trendParts(0, 0);
    const last7 = s.slice(-7);
    const prev7 = s.length >= 14 ? s.slice(-14, -7) : [];
    const cur = last7.reduce((a, r) => a + r.chats, 0);
    const prev = prev7.reduce((a, r) => a + r.chats, 0);
    return trendParts(cur, prev);
  }, [analytics.series]);

  const sparkLeads = useMemo(() => analytics.series.slice(-14).map((r) => r.leads), [analytics.series]);
  const sparkChats = useMemo(() => analytics.series.slice(-14).map((r) => r.chats), [analytics.series]);

  const avgDailyLeads =
    analytics.series.length > 0 ? +(leadSum30 / analytics.series.length).toFixed(1) : 0;

  const [leadInboxFilter, setLeadInboxFilter] = useState("");
  const [chatInboxFilter, setChatInboxFilter] = useState("");
  const filteredOverviewLeads = useMemo(() => {
    if (!leadInboxFilter.trim()) return analytics.recentLeads;
    return analytics.recentLeads.filter((row) =>
      matchesAdminFilter(
        leadInboxFilter,
        row.name,
        row.email,
        row.company,
        String(row.id),
        row.handled ? "handled" : "needs"
      )
    );
  }, [analytics.recentLeads, leadInboxFilter]);

  const filteredOverviewChats = useMemo(() => {
    if (!chatInboxFilter.trim()) return analytics.recentChats;
    return analytics.recentChats.filter((row) =>
      matchesAdminFilter(chatInboxFilter, row.preview, String(row.id))
    );
  }, [analytics.recentChats, chatInboxFilter]);

  return (
    <div className="space-y-8 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.07] bg-gradient-to-br from-card via-card to-[#0b1220] px-6 py-8 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] sm:rounded-3xl sm:px-10 sm:py-10"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.12)_1px,transparent_0)] [background-size:22px_22px]" />
        <div className="pointer-events-none absolute -right-24 -top-40 size-[420px] rounded-full bg-primary/[0.14] blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-36 left-10 size-[320px] rounded-full bg-sky-500/[0.09] blur-[90px]" />

        <div className="relative flex flex-col gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70 opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Live data
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1 font-mono text-[11px] text-foreground/55">
                <Database className="size-3.5 opacity-70" />
                PostgreSQL
              </span>
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Operations overview
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-foreground/60">
                Real metrics from your database — leads, assistant usage, and testimonials — with week-over-week motion on
                the chart window when history allows.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-5 font-mono text-[11px] text-foreground/45">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-3.5 opacity-70" />
                {liveClock.toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
              <span className="hidden sm:inline text-foreground/25">|</span>
              <span>30-day chart · daily buckets</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/[0.06] pt-5">
            <Link
              href="/admin/leads"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[0_14px_44px_-18px_rgba(255,106,0,0.75)] transition hover:bg-primary/92 active:scale-[0.99]"
            >
              Inbox
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/admin/testimonials"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-background/60 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition hover:border-primary/35 hover:bg-background/80"
            >
              Testimonials
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={Inbox}
          label="Total leads"
          value={analytics.totals.leads}
          sub="Lifetime contact rows stored in your database."
          trend={trendLead}
          spark={sparkLeads}
          accent="primary"
        />
        <KpiCard
          icon={MessageSquareQuote}
          label="Testimonials queue"
          value={analytics.totals.testimonialsPending}
          sub={`${analytics.totals.testimonialsApproved} approved · ${analytics.totals.testimonialsRejected} rejected`}
        />
        <KpiCard
          icon={Activity}
          label="Assistant turns (30d)"
          value={chatSum30}
          sub={`${analytics.totals.chatTurns} total rows in chat_logs.`}
          trend={trendChat}
          spark={sparkChats}
        />
        <KpiCard
          icon={Users}
          label="Admin seats"
          value={analytics.totals.adminUsers}
          sub="Operators with dashboard access."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45 }}
          className="xl:col-span-3 overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-card/85 shadow-xl backdrop-blur-md sm:rounded-3xl"
        >
          <div className="border-b border-white/[0.06] bg-gradient-to-r from-white/[0.03] to-transparent px-5 py-5 sm:px-7 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-foreground/45">Engagement</p>
                <h3 className="font-display text-xl font-bold tracking-tight">Leads vs assistant volume</h3>
                <p className="mt-2 max-w-lg text-sm text-foreground/55">
                  Orange = contact form leads · Sky = AI widget transcripts · Average{" "}
                  <strong className="font-semibold text-foreground/80">{avgDailyLeads}</strong> leads/day in window.
                </p>
              </div>
              <div className="flex gap-6 rounded-xl border border-white/[0.06] bg-background/40 px-4 py-3 font-mono text-[11px] text-foreground/60">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/35">30d leads</p>
                  <p className="text-lg font-semibold tabular-nums text-primary">{leadSum30}</p>
                </div>
                <div className="w-px bg-border/60" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-foreground/35">30d chats</p>
                  <p className="text-lg font-semibold tabular-nums text-sky-400">{chatSum30}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="h-[300px] w-full min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartRows} margin={{ top: 12, right: 16, left: 6, bottom: 8 }}>
                  <defs>
                    <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6a00" stopOpacity={0.42} />
                      <stop offset="100%" stopColor="#ff6a00" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillChats" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.38} />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 8" stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 11 }} tickMargin={10} />
                  <YAxis
                    tick={{ fill: "rgba(148,163,184,0.75)", fontSize: 11 }}
                    width={34}
                    allowDecimals={false}
                    tickMargin={8}
                  />
                  <ReferenceLine
                    y={avgDailyLeads}
                    stroke="rgba(148,163,184,0.25)"
                    strokeDasharray="6 6"
                    label={{
                      value: "Avg / day",
                      position: "insideTopRight",
                      fill: "rgba(148,163,184,0.55)",
                      fontSize: 10,
                    }}
                  />
                  <Tooltip
                    cursor={{ stroke: "rgba(255,106,0,0.25)", strokeWidth: 1 }}
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid rgba(148,163,184,0.15)",
                      backgroundColor: "rgba(15, 23, 42, 0.96)",
                      color: "#f8fafc",
                      padding: "12px 14px",
                      boxShadow: "0 24px 60px -24px rgba(0,0,0,0.8)",
                    }}
                    formatter={(value: number, name: string) => [
                      value,
                      name === "leads" ? "Leads" : name === "chats" ? "Chat turns" : name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="leads"
                    stroke="#ff6a00"
                    strokeWidth={2.25}
                    fill="url(#fillLeads)"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="chats"
                    name="chats"
                    stroke="#38bdf8"
                    strokeWidth={2.25}
                    fill="url(#fillChats)"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <div className="xl:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="rounded-[1.25rem] border border-white/[0.07] bg-card/85 p-6 shadow-lg backdrop-blur-md sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">Runtime</p>
                <h3 className="font-display text-lg font-bold tracking-tight">AI stack</h3>
              </div>
              <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-transparent text-primary ring-1 ring-primary/25">
                <Bot className="size-5" />
              </span>
            </div>
            <div className="mt-5 rounded-2xl border border-white/[0.06] bg-background/50 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-foreground/45">Routing</p>
              <p className="mt-1 font-display text-xl font-bold text-primary">{aiStatus.activeProvider}</p>
              <p className="mt-1 text-xs text-foreground/55">Gemini wins when configured; else OpenAI; else offline prompts.</p>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-background/45 px-3.5 py-3">
                <CheckCircle2
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    aiStatus.openAIConfigured ? "text-emerald-400" : "text-foreground/25"
                  )}
                />
                <div className="min-w-0 text-[13px] leading-snug">
                  <span className="font-semibold text-foreground">OpenAI</span>{" "}
                  <span className="font-mono text-[11px] text-foreground/55">{aiStatus.openAIModel}</span>
                  <span className="block text-foreground/50">
                    {aiStatus.openAIConfigured ? "API key present." : "Not configured."}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-background/45 px-3.5 py-3">
                <CheckCircle2
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    aiStatus.geminiConfigured ? "text-emerald-400" : "text-foreground/25"
                  )}
                />
                <div className="min-w-0 text-[13px] leading-snug">
                  <span className="font-semibold text-foreground">Gemini</span>{" "}
                  <span className="font-mono text-[11px] text-foreground/55">{aiStatus.geminiModel}</span>
                  <span className="block text-foreground/50">
                    {aiStatus.geminiConfigured ? "API key present." : "Not configured."}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/[0.06] px-3.5 py-3">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                <div className="text-[13px] leading-snug">
                  Public assistant name:{" "}
                  <strong className="font-semibold text-foreground">{assistantName}</strong>
                </div>
              </div>
            </div>
            <Link
              href="/admin/ai"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.08] bg-background/60 py-3 text-sm font-semibold transition hover:border-primary/35"
            >
              Configure providers
              <ArrowRight className="size-4 opacity-80" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.45 }}
            className="rounded-[1.25rem] border border-white/[0.07] bg-card/85 p-6 shadow-lg backdrop-blur-md sm:rounded-3xl"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-transparent text-sky-400 ring-1 ring-sky-500/25">
                <Cpu className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">CMS</p>
                <h3 className="font-display text-lg font-bold tracking-tight">Landing content</h3>
                <p className="mt-2 text-sm text-foreground/55">
                  Last persisted{" "}
                  <span className="font-mono text-foreground/85">
                    {analytics.siteContentUpdatedAt ? fmtAbsolute(analytics.siteContentUpdatedAt) : "—"}
                  </span>
                </p>
              </div>
            </div>
            <Link
              href="/admin/hero"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/12 py-3 text-sm font-semibold text-primary ring-1 ring-primary/25 transition hover:bg-primary/18"
            >
              <Zap className="size-4" />
              Edit sections
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-card/85 shadow-lg backdrop-blur-md sm:rounded-3xl"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent px-5 py-4">
            <div className="flex items-center gap-2">
              <Inbox className="size-4 text-primary" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/75">Latest leads</h3>
            </div>
            <Link href="/admin/leads" className="text-xs font-semibold text-primary hover:underline">
              Open inbox
            </Link>
          </div>
          <AdminListFilter
            id="admin-overview-leads-filter"
            value={leadInboxFilter}
            onChange={setLeadInboxFilter}
            placeholder="Filter leads…"
            className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-3"
          />
          <ul className="divide-y divide-white/[0.05]">
            {analytics.recentLeads.length === 0 ? (
              <li className="px-6 py-14 text-center">
                <p className="text-sm font-medium text-foreground/65">No leads recorded yet.</p>
                <p className="mt-2 text-xs text-foreground/45">Submissions appear here as soon as visitors use your contact form.</p>
                <Link href="/#contact" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">
                  Preview contact section
                </Link>
              </li>
            ) : filteredOverviewLeads.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <p className="text-sm text-foreground/55">No leads match this filter.</p>
              </li>
            ) : (
              filteredOverviewLeads.map((row) => (
                <li
                  key={row.id}
                  className="flex gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 font-display text-sm font-bold text-primary ring-1 ring-primary/20">
                    {initials(row.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="truncate font-semibold text-foreground">{row.name}</p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          row.handled
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-900 dark:text-amber-400"
                        )}
                      >
                        {row.handled ? "Handled" : "Needs reply"}
                      </span>
                      <span className="font-mono text-[10px] text-foreground/35">#{row.id}</span>
                    </div>
                    <p className="truncate font-mono text-[12px] text-foreground/50">{row.email}</p>
                    {row.company ? (
                      <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-wider text-foreground/38">{row.company}</p>
                    ) : null}
                  </div>
                  <div className="hidden shrink-0 text-right text-[11px] text-foreground/45 sm:block">
                    <p title={fmtAbsolute(row.created_at)}>{fmtRelative(row.created_at)}</p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.45 }}
          className="overflow-hidden rounded-[1.25rem] border border-white/[0.07] bg-card/85 shadow-lg backdrop-blur-md sm:rounded-3xl"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent px-5 py-4">
            <div className="flex items-center gap-2">
              <MessageSquareText className="size-4 text-sky-400" />
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/75">Assistant transcripts</h3>
            </div>
            <span className="font-mono text-[11px] text-foreground/45">{analytics.totals.chatTurns} stored</span>
          </div>
          <AdminListFilter
            id="admin-overview-chats-filter"
            value={chatInboxFilter}
            onChange={setChatInboxFilter}
            placeholder="Filter transcripts…"
            className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-3"
          />
          <ul className="divide-y divide-white/[0.05]">
            {analytics.recentChats.length === 0 ? (
              <li className="px-6 py-14 text-center">
                <p className="text-sm font-medium text-foreground/65">No conversations logged.</p>
                <p className="mt-2 text-xs text-foreground/45">Visitor messages to the site assistant show up here automatically.</p>
              </li>
            ) : filteredOverviewChats.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <p className="text-sm text-foreground/55">No transcripts match this filter.</p>
              </li>
            ) : (
              filteredOverviewChats.map((row) => (
                <li key={row.id} className="border-l-2 border-sky-500/35 px-5 py-4 transition hover:bg-white/[0.03]">
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-foreground/88">{row.preview}</p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-mono text-[10px] text-foreground/35">#{row.id}</span>
                    <span className="text-[11px] text-foreground/45" title={fmtAbsolute(row.created_at)}>
                      {fmtRelative(row.created_at)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </motion.div>
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-[0.35em] text-foreground/35">
        Analytics snapshot · sourced from your deployment database
      </p>
    </div>
  );
}
