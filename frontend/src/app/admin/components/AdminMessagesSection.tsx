"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Inbox, Mail, PhoneCall, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { Lead } from "@/app/admin/types";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

type Props = { initialLeads: Lead[] };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const actionBtn = cn(
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-border/75 bg-card/80 px-3 text-xs font-semibold text-foreground/85 transition",
  "hover:border-primary/40 hover:bg-primary/[0.07] hover:text-foreground"
);

const dangerBtn = cn(
  actionBtn,
  "border-red-500/25 text-red-600 hover:border-red-500/45 hover:bg-red-500/[0.09] hover:text-red-700",
  "dark:text-red-400 dark:hover:text-red-300"
);

export default function AdminMessagesSection({ initialLeads }: Props) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const count = leads.length;
  const [inboxFilter, setInboxFilter] = useState("");
  const filteredLeads = useMemo(() => {
    if (!inboxFilter.trim()) return leads;
    return leads.filter((lead) =>
      matchesAdminFilter(
        inboxFilter,
        lead.name,
        lead.email,
        lead.company,
        lead.phone,
        lead.message,
        String(lead.id),
        lead.handled ? "handled" : "needs reply"
      )
    );
  }, [leads, inboxFilter]);

  const setHandled = async (lead: Lead, handled: boolean) => {
    const prev = lead.handled;
    setBusyId(lead.id);
    setLeads((p) => p.map((l) => (l.id === lead.id ? { ...l, handled } : l)));
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: lead.id, handled }),
    });
    setBusyId(null);
    if (!res.ok) {
      setLeads((p) => p.map((l) => (l.id === lead.id ? { ...l, handled: prev } : l)));
      router.refresh();
      return;
    }
    router.refresh();
  };

  const remove = async (lead: Lead) => {
    if (
      !confirm(
        `Permanently delete this message from ${lead.name}? This cannot be undone.`
      )
    ) {
      return;
    }
    setBusyId(lead.id);
    const res = await fetch(`/api/admin/leads?id=${lead.id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
      router.refresh();
    }
  };

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-amber-500/[0.12] via-card/92 to-orange-500/[0.08] p-6 shadow-[0_28px_80px_-44px_rgba(245,158,11,0.28)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-amber-400/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-orange-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/18 text-amber-900 ring-1 ring-amber-500/25 dark:text-amber-400">
              <Inbox className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-900/90 dark:text-amber-400/95">
                Homepage · Contact form
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">Messages</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Every submission from the site contact form lands here. Reply by email or call when a phone number is
                included.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <Sparkles className="size-3.5 text-amber-600/90 dark:text-amber-400/90" />
            {count === 0 ? "No messages yet" : `${count} message${count === 1 ? "" : "s"}`}
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-2xl border border-amber-500/18 bg-amber-500/[0.05] px-4 py-3.5 text-sm leading-relaxed text-foreground/72 ring-1 ring-amber-500/12 dark:bg-amber-500/[0.08]">
        <span className="mr-1 inline-flex items-center gap-1.5 align-middle">
          <Mail className="size-3.5 text-amber-700 dark:text-amber-400" />
        </span>
        Copy is editable under{" "}
        <Link href="/admin/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
          Contact & Assistant
        </Link>
        . Form labels and footer details stay in sync with what visitors see on the site.{" "}
        <strong className="font-medium text-foreground/85">Needs reply</strong> /{" "}
        <strong className="font-medium text-foreground/85">Handled</strong> are your own labels—toggle them after you
        follow up.
      </div>

      {/* List */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm dark:bg-card/35 sm:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-border/50 pb-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Inbox</h4>
              <p className="mt-1 text-sm text-foreground/55">Newest submissions appear first in this list.</p>
            </div>
          </div>
          <AdminListFilter
            id="admin-messages-filter"
            value={inboxFilter}
            onChange={setInboxFilter}
            placeholder="Search name, email, company, message…"
            resultHint={
              inboxFilter.trim() ? `${filteredLeads.length} of ${count} shown` : undefined
            }
          />
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/40 py-16 text-center dark:bg-white/[0.02]">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-foreground/[0.04] text-foreground/35 ring-1 ring-border/60">
              <Inbox className="size-7" />
            </span>
            <p className="mt-4 text-base font-semibold text-foreground/80">No messages yet</p>
            <p className="mt-1 max-w-sm px-4 text-sm text-foreground/55">
              When visitors submit the homepage contact form, their messages will show up here.
            </p>
          </div>
        ) : (
          <div className="max-h-[min(70vh,560px)] space-y-4 overflow-y-auto overscroll-contain pr-1 -mr-1">
            {filteredLeads.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
                No messages match this filter.
              </p>
            ) : null}
            {filteredLeads.map((lead) => {
              const replySubject = encodeURIComponent(`Re: Your message to Yafetpromedia`);
              const replyBody = encodeURIComponent(`Hi ${lead.name},\n\nThank you for reaching out.\n\n`);
              const mailtoHref = `mailto:${lead.email}?subject=${replySubject}&body=${replyBody}`;
              const telHref = lead.phone.trim() !== "" ? `tel:${lead.phone.replace(/\s+/g, "")}` : null;

              return (
                <article
                  key={lead.id}
                  className="group relative overflow-hidden rounded-2xl border border-border/65 bg-background/70 shadow-sm transition hover:border-amber-500/22 hover:shadow-md dark:bg-white/[0.03]"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                      <div
                        className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/15 text-sm font-bold tracking-tight text-amber-950 ring-1 ring-amber-500/25 dark:text-amber-200"
                        aria-hidden
                      >
                        {initials(lead.name)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-semibold leading-snug tracking-tight text-foreground break-words">
                                {lead.name}
                              </h4>
                              <span
                                className={cn(
                                  "inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                  lead.handled
                                    ? "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/25 dark:text-emerald-400"
                                    : "bg-amber-500/15 text-amber-950 ring-1 ring-amber-500/22 dark:text-amber-400"
                                )}
                              >
                                {lead.handled ? "Handled" : "Needs reply"}
                              </span>
                            </div>
                            {lead.company.trim() !== "" ? (
                              <p className="mt-1 inline-flex rounded-full border border-border/60 bg-card/60 px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-foreground/55">
                                {lead.company}
                              </p>
                            ) : null}
                          </div>
                          <time
                            className="shrink-0 text-[11px] font-medium tabular-nums text-foreground/45 sm:text-right"
                            dateTime={lead.created_at}
                          >
                            {new Date(lead.created_at).toLocaleString()}
                          </time>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <a href={mailtoHref} className={actionBtn}>
                            <Mail className="size-3.5 shrink-0 opacity-80" />
                            Reply by email
                          </a>
                          {telHref ? (
                            <a href={telHref} className={actionBtn}>
                              <PhoneCall className="size-3.5 shrink-0 opacity-80" />
                              Call
                            </a>
                          ) : null}
                          <button
                            type="button"
                            className={cn(
                              actionBtn,
                              lead.handled
                                ? "border-border/80 text-foreground/75 hover:border-amber-500/35 hover:bg-amber-500/[0.07]"
                                : "border-emerald-500/28 text-emerald-900 hover:border-emerald-500/45 hover:bg-emerald-500/[0.09] dark:text-emerald-400 dark:hover:text-emerald-300"
                            )}
                            disabled={busyId === lead.id}
                            aria-busy={busyId === lead.id}
                            onClick={() => void setHandled(lead, !lead.handled)}
                          >
                            {lead.handled ? (
                              <>
                                <RotateCcw className="size-3.5 shrink-0 opacity-85" />
                                Needs reply
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="size-3.5 shrink-0 opacity-85" />
                                Mark handled
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className={cn(dangerBtn, "disabled:pointer-events-none disabled:opacity-45")}
                            disabled={busyId === lead.id}
                            aria-busy={busyId === lead.id}
                            onClick={() => void remove(lead)}
                          >
                            <Trash2 className="size-3.5 shrink-0 opacity-90" />
                            Delete
                          </button>
                        </div>

                        <div className="space-y-2 rounded-2xl border border-border/50 bg-muted/25 px-4 py-3 dark:bg-white/[0.03]">
                          <a
                            href={`mailto:${lead.email}`}
                            className="block text-sm font-medium text-primary underline-offset-2 hover:underline break-all"
                          >
                            {lead.email}
                          </a>
                          {lead.phone.trim() !== "" ? (
                            <p className="text-sm text-foreground/70">{lead.phone}</p>
                          ) : null}
                          <p className="text-sm leading-relaxed text-foreground/82 whitespace-pre-wrap break-words">
                            {lead.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
