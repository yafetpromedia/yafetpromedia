"use client";

import { FormEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-1 w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-[13px] text-foreground shadow-sm transition-[border-color,box-shadow] placeholder:text-foreground/35 focus:border-primary/45 focus:outline-none focus:ring-1 focus:ring-primary/20";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful submit, when the dialog is closing (e.g. show a toast). */
  onSubmitted?: () => void;
};

export default function TestimonialSubmitDialog({ open, onOpenChange, onSubmitted }: Props) {
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const reset = () => {
    setQuote("");
    setAuthor("");
    setRole("");
    setEmail("");
    setRating(5);
    setStatus("");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    const response = await fetch("/api/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quote, author, role, email, rating }),
    });

    setIsSubmitting(false);
    if (response.ok) {
      handleOpenChange(false);
      onSubmitted?.();
      return;
    }
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setStatus(data?.error ?? "Something went wrong. Please try again.");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        overlayClassName="bg-foreground/20 backdrop-blur-[6px] data-open:backdrop-blur-sm"
        className={cn(
          "gap-0 overflow-hidden rounded-xl border border-border/60 p-0 max-w-[calc(100%-1.25rem)] sm:max-w-[22rem]",
          "bg-card shadow-lg shadow-black/15 dark:shadow-black/40",
          "ring-1 ring-black/[0.04] dark:ring-white/[0.08]"
        )}
      >
        <DialogHeader className="space-y-1 border-b border-border/50 bg-gradient-to-b from-muted/25 to-transparent px-4 pb-3 pt-4 text-left sm:pr-11">
          <DialogTitle className="font-display text-base font-bold tracking-tight text-foreground">
            Submit a testimonial
          </DialogTitle>
          <DialogDescription className="text-xs leading-snug text-foreground/55">
            Short note + rating. We review before it may appear on the site.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-4 py-3.5">
          <div className="space-y-3">
            <label className="block text-xs font-medium text-foreground/80">
              Full name
              <input
                required
                autoComplete="name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block text-xs font-medium text-foreground/80">
              Title or organization
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Director, Company Name"
                className={fieldClass}
              />
            </label>

            <label className="block text-xs font-medium text-foreground/80">
              Email{" "}
              <span className="font-normal text-foreground/45">(optional, for follow-up only)</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className={fieldClass}
              />
            </label>

            <div>
              <span id="testimonial-rating-label" className="block text-xs font-medium text-foreground/80">
                Your rating
              </span>
              <div
                className="mt-1 flex gap-0"
                role="group"
                aria-labelledby="testimonial-rating-label"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="rounded-md p-0.5 text-foreground/30 transition hover:bg-foreground/[0.04] hover:text-primary focus:outline-none focus:ring-1 focus:ring-primary/25"
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    aria-pressed={rating === n}
                  >
                    <Star
                      className={cn(
                        "size-6",
                        n <= rating ? "fill-primary text-primary" : "fill-transparent text-foreground/25"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 border-t border-border/50 pt-3">
            <label className="block text-xs font-medium text-foreground/80">
              Your testimonial
              <textarea
                required
                rows={3}
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="What stood out about the experience?"
                className={cn(fieldClass, "min-h-[4.5rem] resize-none leading-snug")}
              />
            </label>
          </div>

          {status ? (
            <p
              role="alert"
              className={cn(
                "mt-3 rounded-lg border px-2.5 py-2 text-xs leading-snug",
                "border-red-500/25 bg-red-500/[0.06] text-red-700 dark:text-red-400"
              )}
            >
              {status}
            </p>
          ) : null}

          <div className="mt-3 flex flex-col-reverse gap-1.5 border-t border-border/50 pt-3 sm:flex-row sm:justify-end sm:gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 rounded-lg border-border/80 px-4 text-xs font-medium"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 rounded-lg bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/92 disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
