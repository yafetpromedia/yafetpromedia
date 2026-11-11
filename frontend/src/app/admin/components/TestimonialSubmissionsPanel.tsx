"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Trash2, X } from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { TestimonialSubmission } from "@/app/admin/types";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

function StarRow({ rating }: { rating: number }) {
  const r = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <div className="mt-2 flex gap-0.5" aria-label={`${r} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn("size-3.5", i <= r ? "fill-primary text-primary" : "text-foreground/20")}
        />
      ))}
    </div>
  );
}

export default function TestimonialSubmissionsPanel({ submissions }: { submissions: TestimonialSubmission[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [submissionFilter, setSubmissionFilter] = useState("");
  const filteredSubmissions = useMemo(() => {
    if (!submissionFilter.trim()) return submissions;
    return submissions.filter((row) =>
      matchesAdminFilter(
        submissionFilter,
        row.quote,
        row.author,
        row.role,
        row.email,
        row.status,
        String(row.id),
        String(row.rating)
      )
    );
  }, [submissions, submissionFilter]);

  const patch = async (id: number, action: "approve" | "reject") => {
    setBusyId(id);
    const res = await fetch("/api/admin/testimonial-submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  };

  const remove = async (id: number) => {
    if (
      !confirm(
        "Permanently delete this testimonial? Unpublish keeps it in this list until you delete it."
      )
    ) {
      return;
    }
    setBusyId(id);
    const res = await fetch(`/api/admin/testimonial-submissions?id=${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
  };

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-5 py-8 text-center text-sm text-foreground/55 ">
        <p className="mx-auto max-w-md leading-relaxed">
          No pending or live testimonials yet. New submissions appear here after visitors use the homepage form.
        </p>
      </div>
    );
  }

  return (
    <>
      <AdminListFilter
        id="admin-testimonial-submissions-filter"
        value={submissionFilter}
        onChange={setSubmissionFilter}
        placeholder="Filter by quote, author, email, status…"
        resultHint={
          submissionFilter.trim()
            ? `${filteredSubmissions.length} of ${submissions.length} shown`
            : undefined
        }
        className="mb-4"
      />
      <ul className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-muted/20">
            No submissions match this filter.
          </li>
        ) : null}
        {filteredSubmissions.map((row) => (
        <li
          key={row.id}
          className="rounded-3xl border border-border/70 bg-gradient-to-b from-card to-muted/30 p-5 text-sm shadow-sm ring-1 ring-black/[0.04] "
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <time
                  dateTime={row.created_at}
                  className="text-[11px] font-mono uppercase tracking-wider text-foreground/45"
                >
                  {new Date(row.created_at).toLocaleString()}
                </time>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider",
                    row.status === "pending" && "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                    row.status === "approved" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                    row.status === "rejected" &&
                      "bg-slate-500/15 text-slate-800 dark:text-slate-300"
                  )}
                >
                  {row.status === "pending"
                    ? "Pending"
                    : row.status === "approved"
                      ? "Live on site"
                      : "Unpublished"}
                </span>
              </div>
              <StarRow rating={row.rating} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {row.status === "pending" ? (
                <>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => patch(row.id, "approve")}
                    className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-500/18 disabled:opacity-50 dark:text-emerald-300"
                  >
                    <Check className="size-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => patch(row.id, "reject")}
                    className="inline-flex items-center gap-1 rounded-xl border border-border/90 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground/80 transition hover:border-red-500/45 hover:bg-red-500/10 hover:text-red-700 disabled:opacity-50 dark:hover:text-red-400"
                  >
                    <X className="size-3.5" />
                    Reject
                  </button>
                </>
              ) : row.status === "approved" ? (
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => patch(row.id, "reject")}
                  className="inline-flex items-center gap-1 rounded-xl border border-border/90 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground/75 transition hover:border-amber-500/45 hover:bg-amber-500/12 disabled:opacity-50"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => patch(row.id, "approve")}
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-500/18 disabled:opacity-50 dark:text-emerald-300"
                >
                  <Check className="size-3.5" />
                  Publish again
                </button>
              )}
              <button
                type="button"
                disabled={busyId === row.id}
                onClick={() => remove(row.id)}
                className="inline-flex items-center gap-1 rounded-xl border border-border/90 bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground/75 transition hover:border-red-500/45 hover:bg-red-500/10 hover:text-red-700 disabled:opacity-50 dark:hover:text-red-400"
              >
                <Trash2 className="size-3.5" />
                Delete
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-foreground/85">&quot;{row.quote}&quot;</p>
          <p className="mt-3 font-semibold text-foreground">{row.author}</p>
          {row.role ? (
            <p className="mt-0.5 text-[11px] font-mono uppercase tracking-wider text-primary">{row.role}</p>
          ) : null}
          {row.email ? (
            <p className="mt-2 break-all text-xs text-primary">{row.email}</p>
          ) : null}
        </li>
      ))}
    </ul>
    </>
  );
}
