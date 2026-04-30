"use client";

import { FormEvent, useState } from "react";
import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MessageCircle, PhoneCall } from "lucide-react";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ContactSection() {
  const { content } = useSiteContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    setIsSubmitting(false);
    if (response.ok) {
      setFormData({ name: "", email: "", company: "", phone: "", message: "" });
      setSuccessOpen(true);
      return;
    }
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) {
        setStatus(data.error);
        return;
      }
    } catch {
      /* ignore */
    }
    setStatus("Could not submit right now. Please try again.");
  };

  return (
    <>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent
          showCloseButton
          overlayClassName={cn(
            "bg-foreground/25 backdrop-blur-[8px]",
            "duration-300 ease-out"
          )}
          className={cn(
            "gap-0 overflow-hidden rounded-2xl border border-border/60 p-0 sm:max-w-md",
            "bg-card shadow-2xl shadow-black/25 ring-1 ring-black/[0.04] dark:ring-white/[0.08]",
            "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-open:slide-in-from-bottom-4"
          )}
        >
          <DialogHeader className="relative px-6 pb-2 pt-8 text-center sm:px-8">
            <span
              className={cn(
                "mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl",
                "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/35",
                "dark:bg-emerald-500/12 dark:text-emerald-400 dark:ring-emerald-400/25",
                "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-50 motion-safe:duration-500 motion-safe:[animation-delay:75ms]"
              )}
            >
              <CheckCircle2 className="size-8 stroke-[1.75]" aria-hidden />
            </span>
            <DialogTitle className="font-display text-xl font-bold tracking-tight text-foreground">
              Message sent
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-foreground/70">
              Thanks! Your request has been saved.
            </DialogDescription>
          </DialogHeader>
          <p className="px-6 pb-6 text-center text-sm text-foreground/50 sm:px-8">{content.contactReplyNote}</p>
          <div className="border-t border-border/60 bg-muted/30 px-6 py-4">
            <Button
              type="button"
              className="w-full rounded-xl font-semibold"
              onClick={() => setSuccessOpen(false)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SectionWrapper id="contact" className="bg-background border-t border-border pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 text-foreground">
          <FadeIn>
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="h-[1px] w-8 bg-primary" />
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-primary">
                  {content.contactSectionTag}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight mb-6">
                {content.contactSectionTitle}
              </h2>
              <p className="text-foreground/65 text-lg leading-relaxed mb-10 max-w-xl">
                {content.contactSectionDescription}
              </p>

              <div className="space-y-4">
                <Link
                  href={`mailto:${content.contactEmail}`}
                  className="flex items-center gap-3 text-foreground/80 hover:text-primary transition-colors"
                >
                  <Mail className="size-4" />
                  {content.contactEmail}
                </Link>
                {content.contactPhone.trim() !== "" && (
                  <Link
                    href={`tel:${content.contactPhone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-3 text-foreground/80 hover:text-primary transition-colors"
                  >
                    <PhoneCall className="size-4" />
                    {content.contactPhone}
                  </Link>
                )}
                {content.whatsappNumber.trim() !== "" && (
                  <Link
                    href={`https://wa.me/${content.whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-3 text-foreground/80 hover:text-primary transition-colors"
                  >
                    <MessageCircle className="size-4" />
                    {content.contactWhatsappLabel}
                  </Link>
                )}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form
              className="rounded-[2rem] border border-border bg-card p-8 md:p-10 space-y-5"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                required
                autoComplete="name"
                placeholder={content.contactNamePlaceholder}
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder={content.contactEmailPlaceholder}
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
              <input
                type="text"
                required
                autoComplete="organization"
                placeholder={content.contactCompanyPlaceholder}
                value={formData.company}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, company: event.target.value }))
                }
                className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder={content.contactLeadPhonePlaceholder}
                value={formData.phone}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, phone: event.target.value }))
                }
                autoComplete="tel"
                className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
              <textarea
                required
                placeholder={content.contactMessagePlaceholder}
                rows={5}
                value={formData.message}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, message: event.target.value }))
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? "Submitting..." : content.contactSubmitLabel}
                <ArrowRight className="size-4" />
              </button>
              {status ? <p className="text-sm text-red-600 dark:text-red-400">{status}</p> : null}
              <p className="text-xs text-foreground/45">{content.contactReplyNote}</p>
            </form>
          </FadeIn>
        </div>
      </SectionWrapper>
    </>
  );
}
