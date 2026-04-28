"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Star, Trash2, X } from "lucide-react";
import type { TestimonialSubmission } from "@/app/admin/types";
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
      !confirm("Permanently delete this record? Use Reject to hide from the site without deleting.")
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
      <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm text-foreground/60">
        No pending or live testimonials. New submissions appear here after visitors use the homepage form.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {submissions.map((row) => (
        <li
          key={row.id}
          className="rounded-xl border border-border bg-card p-4 text-sm shadow-sm"
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
                    row.status === "approved" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                  )}
                >
                  {row.status === "pending" ? "Pending" : "Live on site"}
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
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-500/15 disabled:opacity-50 dark:text-emerald-400"
                  >
                    <Check className="size-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === row.id}
                    onClick={() => patch(row.id, "reject")}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground/75 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                  >
                    <X className="size-3.5" />
                    Reject
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => patch(row.id, "reject")}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground/75 transition hover:border-amber-500/40 hover:bg-amber-500/10 disabled:opacity-50"
                >
                  Unpublish
                </button>
              )}
              <button
                type="button"
                disabled={busyId === row.id}
                onClick={() => remove(row.id)}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-foreground/75 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
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
  );
}
