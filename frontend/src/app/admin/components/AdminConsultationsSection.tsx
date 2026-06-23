"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Loader2, Trash2, User } from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { ConsultationRecord } from "@/lib/project-consultant.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

function budgetTier(budget: string): string {
  if (budget === "Enterprise") return "Enterprise";
  if (budget === "$2,000–$10,000") return "High";
  if (budget === "$500–$2,000") return "Medium";
  if (budget === "Under $500") return "Low";
  return budget || "—";
}

function scoreTone(score: number): string {
  if (score >= 90) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 75) return "text-amber-600 dark:text-amber-400";
  return "text-foreground/55";
}

const dangerBtn = cn(
  "inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-red-500/25 bg-card/80 px-2.5 text-[11px] font-semibold text-red-600 transition",
  "hover:border-red-500/45 hover:bg-red-500/[0.09] dark:text-red-400"
);

export default function AdminConsultationsSection() {
  const [rows, setRows] = useState<ConsultationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/consultations");
      const data = (await res.json()) as { consultations?: ConsultationRecord[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to load consultations");
      setRows(data.consultations ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!filter.trim()) return rows;
    return rows.filter((r) =>
      matchesAdminFilter(
        filter,
        r.project_type,
        r.industry,
        r.budget,
        r.timeline,
        r.client_name,
        r.client_email,
        String(r.lead_score),
        r.complexity
      )
    );
  }, [rows, filter]);

  const remove = async (row: ConsultationRecord) => {
    if (!window.confirm(`Delete consultation for "${row.project_type}"?`)) return;
    setBusyId(row.id);
    const res = await fetch("/api/admin/consultations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id }),
    });
    setBusyId(null);
    if (!res.ok) return;
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    if (expandedId === row.id) setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <ClipboardList className="size-4" aria-hidden />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">AI Consultations</p>
          </div>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">Project consultant leads</h2>
          <p className="mt-1 max-w-xl text-sm text-foreground/55">
            Qualified briefs from the AI Project Consultant — sorted by lead score so you can prioritize outreach.
          </p>
        </div>
        <AdminListFilter
          id="admin-consultations-filter"
          value={filter}
          onChange={setFilter}
          placeholder="Filter consultations…"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-card/50 px-4 py-8 text-sm text-foreground/55">
          <Loader2 className="size-4 animate-spin" /> Loading consultations…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/[0.06] px-4 py-6 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-card/40 px-4 py-12 text-center">
          <ClipboardList className="mx-auto size-8 text-foreground/25" />
          <p className="mt-3 text-sm font-medium text-foreground/65">
            {rows.length === 0 ? "No consultations yet." : "No consultations match this filter."}
          </p>
          <p className="mt-1 text-xs text-foreground/45">
            Completed briefs appear here when visitors use Plan a project on the site.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/75 bg-card/50 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/70 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Timeline</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      className="cursor-pointer border-b border-border/50 transition hover:bg-primary/[0.04]"
                      onClick={() => setExpandedId((id) => (id === row.id ? null : row.id))}
                    >
                      <td className="px-4 py-3 font-medium">{row.project_type || "—"}</td>
                      <td className="px-4 py-3 text-foreground/75">{budgetTier(row.budget)}</td>
                      <td className="px-4 py-3 text-foreground/75">{row.timeline || "—"}</td>
                      <td className={cn("px-4 py-3 font-semibold tabular-nums", scoreTone(row.lead_score))}>
                        {row.lead_score}
                      </td>
                      <td className="px-4 py-3 text-foreground/65">
                        {row.client_name ? (
                          <span className="inline-flex items-center gap-1.5">
                            <User className="size-3.5 opacity-50" />
                            {row.client_name}
                          </span>
                        ) : (
                          <span className="text-foreground/35">Anonymous</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={busyId === row.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            void remove(row);
                          }}
                          className={dangerBtn}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                    {expandedId === row.id ? (
                      <tr className="border-b border-border/50 bg-muted/20">
                        <td colSpan={6} className="px-4 py-4">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="text-xs text-foreground/55">
                              <p>
                                <span className="font-semibold text-foreground/70">Industry:</span> {row.industry || "—"}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold text-foreground/70">Est. cost:</span>{" "}
                                {row.estimated_cost || "—"}
                              </p>
                              <p className="mt-1">
                                <span className="font-semibold text-foreground/70">Est. timeline:</span>{" "}
                                {row.estimated_timeline || "—"}
                              </p>
                              {row.client_email ? (
                                <p className="mt-1">
                                  <span className="font-semibold text-foreground/70">Email:</span> {row.client_email}
                                </p>
                              ) : null}
                            </div>
                            {row.generated_brief ? (
                              <pre className="max-h-48 overflow-auto rounded-xl border border-border/60 bg-background/80 p-3 text-[11px] leading-relaxed text-foreground/70 whitespace-pre-wrap">
                                {row.generated_brief}
                              </pre>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
