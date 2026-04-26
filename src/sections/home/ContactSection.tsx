"use client";

import { FormEvent, useState } from "react";
import FadeIn from "@/components/animations/FadeIn";
import SectionWrapper from "@/components/common/SectionWrapper";
import Link from "next/link";
import { ArrowRight, Mail, PhoneCall } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useSiteContent } from "@/components/common/SiteContentProvider";

export default function ContactSection() {
  const { t } = useLanguage();
  const { content } = useSiteContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
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
      setStatus("Thanks! Your request has been saved.");
      setFormData({ name: "", email: "", company: "", message: "" });
      return;
    }
    setStatus("Could not submit right now. Please try again.");
  };

  return (
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
              <Link
                href={`tel:${content.contactPhone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 text-foreground/80 hover:text-primary transition-colors"
              >
                <PhoneCall className="size-4" />
                {content.contactPhone}
              </Link>
              <Link
                href={`https://wa.me/${content.whatsappNumber}`}
                target="_blank"
                className="flex items-center gap-3 text-foreground/80 hover:text-primary transition-colors"
              >
                <PhoneCall className="size-4" />
                {content.contactWhatsappLabel}
              </Link>
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
              placeholder={content.contactNamePlaceholder}
              value={formData.name}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, name: event.target.value }))
              }
              className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
            <input
              type="email"
              placeholder={content.contactEmailPlaceholder}
              value={formData.email}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, email: event.target.value }))
              }
              className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
            <input
              type="text"
              placeholder={content.contactCompanyPlaceholder}
              value={formData.company}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, company: event.target.value }))
              }
              className="w-full h-12 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
            <textarea
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
              {isSubmitting ? "Submitting..." : content.contactSubmitLabel || t("send")}
              <ArrowRight className="size-4" />
            </button>
            {status && <p className="text-sm text-foreground/70">{status}</p>}
            <p className="text-xs text-foreground/45">
              {content.contactReplyNote}
            </p>
          </form>
        </FadeIn>
      </div>
    </SectionWrapper>
  );
}
