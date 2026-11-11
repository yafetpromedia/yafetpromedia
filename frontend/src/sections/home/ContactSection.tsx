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

const fieldCls =
  "w-full rounded-2xl border border-border/70 bg-muted/40 px-4 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-accent/40 focus:bg-background focus:ring-2 focus:ring-accent/10";

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
    website: "",
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
      setFormData({ name: "", email: "", company: "", phone: "", message: "", website: "" });
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

  const contactLinks = [
    {
      href: `mailto:${content.contactEmail}`,
      icon: Mail,
      label: content.contactEmail,
      external: false,
    },
    content.contactPhone.trim()
      ? {
          href: `tel:${content.contactPhone.replace(/\s+/g, "")}`,
          icon: PhoneCall,
          label: content.contactPhone,
          external: false,
        }
      : null,
    content.whatsappNumber.trim()
      ? {
          href: `https://wa.me/${content.whatsappNumber}`,
          icon: MessageCircle,
          label: content.contactWhatsappLabel,
          external: true,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    icon: typeof Mail;
    label: string;
    external: boolean;
  }[];

  return (
    <>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent
          showCloseButton
          overlayClassName="bg-foreground/20 backdrop-blur-[4px] duration-300 ease-out"
          className={cn(
            "gap-0 overflow-hidden rounded-[1.5rem] border border-border/70 p-0 sm:max-w-md",
            "bg-card shadow-[0_10px_40px_-18px_rgba(12,12,12,0.25)]",
            "duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          )}
        >
          <DialogHeader className="relative px-6 pb-2 pt-8 text-center sm:px-8">
            <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-600 ring-1 ring-emerald-500/25 dark:text-emerald-400">
              <CheckCircle2 className="size-6 stroke-[1.75]" aria-hidden />
            </span>
            <DialogTitle className="font-display text-xl font-semibold tracking-tight text-foreground">
              Message sent
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-foreground/65">
              Thanks! Your request has been saved.
            </DialogDescription>
          </DialogHeader>
          <p className="px-6 pb-6 text-center text-sm text-foreground/45 sm:px-8">
            {content.contactReplyNote}
          </p>
          <div className="border-t border-border/60 bg-muted/30 px-6 py-4">
            <Button
              type="button"
              className="h-11 w-full rounded-full font-semibold"
              onClick={() => setSuccessOpen(false)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <SectionWrapper id="contact" className="border-t border-border/60 bg-background">
        <div className="grid grid-cols-1 items-start gap-10 text-foreground lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <FadeIn className="lg:col-span-5">
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-accent">
              {content.contactSectionTag}
            </p>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl xl:text-[2.75rem]">
              {content.contactSectionTitle}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/60 md:text-lg">
              {content.contactSectionDescription}
            </p>

            <ul className="mt-8 space-y-3">
              {contactLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noreferrer noopener" : undefined}
                    className="group inline-flex max-w-full items-center gap-3 rounded-2xl border border-border/70 bg-card px-3.5 py-3 text-sm text-foreground/75 shadow-[0_8px_28px_-18px_rgba(12,12,12,0.16)] transition hover:border-accent/30 hover:text-foreground"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/65 transition group-hover:bg-accent/10 group-hover:text-accent">
                      <item.icon className="size-4" strokeWidth={1.85} />
                    </span>
                    <span className="min-w-0 truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>

          <FadeIn delay={0.08} className="w-full min-w-0 lg:col-span-7">
            <form
              className="rounded-[1.5rem] border border-border/80 bg-card p-5 shadow-[0_10px_40px_-18px_rgba(12,12,12,0.18)] sm:p-7 md:p-8 dark:shadow-[0_10px_40px_-18px_rgba(0,0,0,0.55)]"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                <label className="block sm:col-span-1">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">
                    Name
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder={content.contactNamePlaceholder}
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className={cn(fieldCls, "h-12")}
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">
                    Email
                  </span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder={content.contactEmailPlaceholder}
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className={cn(fieldCls, "h-12")}
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">
                    Company
                  </span>
                  <input
                    type="text"
                    required
                    autoComplete="organization"
                    placeholder={content.contactCompanyPlaceholder}
                    value={formData.company}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, company: event.target.value }))
                    }
                    className={cn(fieldCls, "h-12")}
                  />
                </label>
                <label className="block sm:col-span-1">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">
                    Phone
                  </span>
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
                    className={cn(fieldCls, "h-12")}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-foreground/45">
                    Project
                  </span>
                  <textarea
                    required
                    placeholder={content.contactMessagePlaceholder}
                    rows={5}
                    value={formData.message}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, message: event.target.value }))
                    }
                    className={cn(fieldCls, "min-h-[8.5rem] resize-none py-3")}
                  />
                </label>
              </div>

              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={formData.website}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, website: event.target.value }))
                }
                className="hidden"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-55"
              >
                {isSubmitting ? "Submitting..." : content.contactSubmitLabel}
                <ArrowRight className="size-4" />
              </button>
              {status ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{status}</p> : null}
              <p className="mt-3 text-center text-xs text-foreground/45 sm:text-left">
                {content.contactReplyNote}
              </p>
            </form>
          </FadeIn>
        </div>
      </SectionWrapper>
    </>
  );
}
