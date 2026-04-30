"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Bot,
  FormInput,
  Link2,
  MessageSquareText,
  PhoneForwarded,
  Plus,
  Share2,
  Trash2,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { SiteContent, SocialLink } from "@/lib/site-content.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48";

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-primary/55 focus:ring-2 focus:ring-primary/15",
  "dark:border-white/[0.09] dark:bg-white/[0.04]"
);

const textareaCls = cn(inputCls, "min-h-[92px] resize-none py-3 leading-relaxed");

const reorderBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-card/80 text-foreground/80 transition",
  "hover:border-primary/35 hover:bg-primary/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const sectionShell =
  "rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35";

/** Matches backend `sanitizeSiteContent` cap on social links */
const SOCIAL_LINKS_MAX = 8;

function newSocialLink(): SocialLink {
  return { label: "", url: "", icon: "website", enabled: true };
}

export default function AdminContactSection({ draft, setDraft }: Props) {
  const enabledSocial = draft.socialLinks.filter((s) => s.enabled).length;
  const [socialFilter, setSocialFilter] = useState("");
  const filteredSocialLinks = useMemo(() => {
    const indexed = draft.socialLinks.map((item, index) => ({ item, index }));
    if (!socialFilter.trim()) return indexed;
    return indexed.filter(({ item }) =>
      matchesAdminFilter(socialFilter, item.label, item.url, item.icon)
    );
  }, [draft.socialLinks, socialFilter]);

  const moveSocial = (index: number, dir: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.socialLinks];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, socialLinks: next };
    });
  };

  const addSocialLink = () => {
    setDraft((prev) => {
      if (prev.socialLinks.length >= SOCIAL_LINKS_MAX) return prev;
      return { ...prev, socialLinks: [...prev.socialLinks, newSocialLink()] };
    });
  };

  const removeSocialLink = (index: number) => {
    if (
      !confirm("Remove this social link from the list? You can add it again later before saving.")
    ) {
      return;
    }
    setDraft((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-violet-500/[0.11] via-card/92 to-emerald-500/[0.07] p-6 shadow-[0_28px_80px_-44px_rgba(139,92,246,0.25)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-violet-400/[0.1] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-emerald-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-800 ring-1 ring-violet-500/28 dark:text-violet-400">
              <MessageSquareText className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-800/95 dark:text-violet-400/95">
                Homepage · Footer · Widget
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Contact & Assistant
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Homepage contact section copy, footer email and phone, WhatsApp links, chat widget name, form labels, and
                social icons visitors see in the footer.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <Share2 className="size-3.5 text-violet-600/85 dark:text-violet-400/90" />
            {draft.socialLinks.length} links · {enabledSocial} visible
          </div>
        </div>
      </div>

      {/* Context */}
      <div className="rounded-2xl border border-violet-500/18 bg-violet-500/[0.05] px-4 py-3.5 text-sm leading-relaxed text-foreground/72 ring-1 ring-violet-500/12 dark:bg-violet-500/[0.08]">
        <span className="mr-1 inline-flex items-center gap-1.5 align-middle">
          <PhoneForwarded className="size-3.5 text-violet-600 dark:text-violet-400" />
        </span>
        Email, phone, and WhatsApp appear in the <strong className="font-medium text-foreground/85">#contact</strong>{" "}
        section and in the footer. Use digits only for the WhatsApp number (country code, no +).
      </div>

      {/* Homepage contact section */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <MessageSquareText className="size-4 text-violet-600/85 dark:text-violet-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Contact section (homepage)</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Section tag</span>
            <input
              value={draft.contactSectionTag}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactSectionTag: e.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Headline</span>
            <input
              value={draft.contactSectionTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactSectionTitle: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>
        <label className="mt-6 block">
          <span className={labelCls}>Intro text</span>
          <textarea
            rows={3}
            value={draft.contactSectionDescription}
            onChange={(e) => setDraft((prev) => ({ ...prev, contactSectionDescription: e.target.value }))}
            className={textareaCls}
          />
        </label>
      </section>

      {/* Details + assistant */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <Bot className="size-4 text-emerald-600/85 dark:text-emerald-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Contact details & assistant</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Email</span>
            <input
              value={draft.contactEmail}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactEmail: e.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Phone (display & click-to-call)</span>
            <input
              value={draft.contactPhone}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactPhone: e.target.value }))}
              placeholder="+251 991 185 321"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>WhatsApp number (digits only)</span>
            <input
              value={draft.whatsappNumber}
              onChange={(e) => setDraft((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
              placeholder="251991185321"
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>WhatsApp link label</span>
            <input
              value={draft.contactWhatsappLabel}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactWhatsappLabel: e.target.value }))}
              placeholder="WhatsApp Chat"
              className={inputCls}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={labelCls}>AI assistant name (chat widget)</span>
            <input
              value={draft.aiName}
              onChange={(e) => setDraft((prev) => ({ ...prev, aiName: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>
      </section>

      {/* Form placeholders */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <FormInput className="size-4 text-violet-600/85 dark:text-violet-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Contact form (homepage)</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {(
            [
              ["contactNamePlaceholder", "Name placeholder"],
              ["contactEmailPlaceholder", "Email placeholder"],
              ["contactCompanyPlaceholder", "Company placeholder"],
              ["contactLeadPhonePlaceholder", "Phone placeholder (visitor)"],
            ] as const
          ).map(([key, lbl]) => (
            <label key={key} className="block">
              <span className={labelCls}>{lbl}</span>
              <input
                value={draft[key]}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
                className={inputCls}
              />
            </label>
          ))}
          <label className="block md:col-span-2">
            <span className={labelCls}>Message placeholder</span>
            <input
              value={draft.contactMessagePlaceholder}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactMessagePlaceholder: e.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>Submit button label</span>
            <input
              value={draft.contactSubmitLabel}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactSubmitLabel: e.target.value }))}
              className={inputCls}
            />
          </label>
          <label className="block md:col-span-2">
            <span className={labelCls}>Note under button</span>
            <input
              value={draft.contactReplyNote}
              onChange={(e) => setDraft((prev) => ({ ...prev, contactReplyNote: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>
      </section>

      {/* Social links */}
      <section className={sectionShell}>
        <div className="mb-6 flex flex-col gap-3 border-b border-border/50 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-violet-600/85 dark:text-violet-400/90" />
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Social media links</h4>
            </div>
            <button
              type="button"
              onClick={addSocialLink}
              disabled={draft.socialLinks.length >= SOCIAL_LINKS_MAX}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border border-primary/35 bg-primary/[0.08] px-3 py-1.5 text-xs font-semibold text-primary transition",
                "hover:bg-primary/[0.14] disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <Plus className="size-3.5" />
              Add link
            </button>
          </div>
          <p className="text-xs text-foreground/55">
            Add, edit, reorder, or remove links (max {SOCIAL_LINKS_MAX}). Empty URLs stay hidden on the site.
          </p>
        </div>
        {draft.socialLinks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-5 py-8 text-center text-sm text-foreground/55 dark:bg-white/[0.03]">
            <p className="mb-4">No social links yet.</p>
            <button
              type="button"
              onClick={addSocialLink}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/35 bg-primary/[0.08] px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/[0.14]"
            >
              <Plus className="size-3.5" />
              Add your first link
            </button>
          </div>
        ) : (
          <>
            <AdminListFilter
              id="admin-contact-social-filter"
              value={socialFilter}
              onChange={setSocialFilter}
              placeholder="Filter by label, URL, or icon…"
              resultHint={
                socialFilter.trim()
                  ? `${filteredSocialLinks.length} of ${draft.socialLinks.length} shown`
                  : undefined
              }
              className="mb-4"
            />
            <div className="space-y-4">
              {filteredSocialLinks.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-8 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
                  No links match this filter.
                </p>
              ) : null}
              {filteredSocialLinks.map(({ item, index }) => (
            <div
              key={`social-${index}-${item.url.slice(0, 24)}`}
              className="rounded-2xl border border-border/70 bg-background/60 p-4 shadow-sm dark:bg-white/[0.03]"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/45">
                  Social link {index + 1}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveSocial(index, -1)}
                    className={reorderBtn}
                    aria-label="Move social link up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.socialLinks.length - 1}
                    onClick={() => moveSocial(index, 1)}
                    className={reorderBtn}
                    aria-label="Move social link down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className={cn(
                      reorderBtn,
                      "border-red-500/25 text-red-700 hover:border-red-500/45 hover:bg-red-500/10 dark:text-red-400"
                    )}
                    aria-label="Remove social link"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-4">
                <input
                  value={item.label}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      socialLinks: prev.socialLinks.map((social, i) =>
                        i === index ? { ...social, label: e.target.value } : social
                      ),
                    }))
                  }
                  placeholder="Label"
                  className={inputCls}
                />
                <select
                  value={item.icon}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      socialLinks: prev.socialLinks.map((social, i) =>
                        i === index
                          ? {
                              ...social,
                              icon: e.target.value as
                                | "whatsapp"
                                | "email"
                                | "linkedin"
                                | "instagram"
                                | "youtube"
                                | "github"
                                | "website",
                            }
                          : social
                      ),
                    }))
                  }
                  className={cn(inputCls, "h-[46px] cursor-pointer py-0")}
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="github">GitHub</option>
                  <option value="website">Website</option>
                </select>
                <label className="inline-flex min-h-[46px] items-center gap-3 rounded-2xl border border-border/70 bg-background/40 px-4 text-sm text-foreground/75 dark:bg-white/[0.02]">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        socialLinks: prev.socialLinks.map((social, i) =>
                          i === index ? { ...social, enabled: e.target.checked } : social
                        ),
                      }))
                    }
                    className="size-4 rounded border-border bg-background text-primary focus:ring-primary/25"
                  />
                  Visible in footer
                </label>
              </div>
              <input
                value={item.url}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    socialLinks: prev.socialLinks.map((social, i) =>
                      i === index ? { ...social, url: e.target.value } : social
                    ),
                  }))
                }
                placeholder="https://..."
                className={cn(inputCls, "mt-4")}
              />
            </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
