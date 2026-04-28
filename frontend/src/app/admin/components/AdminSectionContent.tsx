"use client";

/* eslint-disable @next/next/no-img-element -- admin previews: arbitrary image URLs from content */

import Link from "next/link";
import { Dispatch, SetStateAction } from "react";
import { ArrowDown, ArrowUp, ImageOff, Mail, PhoneCall, Plus, Trash2 } from "lucide-react";
import { AIStatus, AdminSection, Lead, TestimonialSubmission } from "@/app/admin/types";
import {
  defaultSiteContent,
  CaseStudyCard,
  HeroCarouselSlide,
  ProductCard,
  PublicationCard,
  SiteContent,
  TrustLogoItem,
} from "@/lib/site-content.shared";
import AdminExploreArchitectureEditor from "@/app/admin/components/AdminExploreArchitectureEditor";
import TestimonialSubmissionsPanel from "@/app/admin/components/TestimonialSubmissionsPanel";

function defaultSlideSrc(slides: HeroCarouselSlide[]): string {
  return (
    slides[0]?.src ??
    defaultSiteContent.heroCarouselSlides[0]?.src ??
    "/images/hero/hero image.svg"
  );
}

function patchHeroSlide(
  setDraft: Dispatch<SetStateAction<SiteContent>>,
  index: number,
  patch: Partial<HeroCarouselSlide>
) {
  setDraft((prev) => ({
    ...prev,
    heroCarouselSlides: prev.heroCarouselSlides.map((s, i) =>
      i === index ? { ...s, ...patch } : s
    ),
  }));
}

function emptyProductCard(): ProductCard {
  return {
    title: "New product",
    description: "",
    label: "PRODUCT",
    imageSrc: "",
    href: "",
    linkLabel: "Learn more",
    featured: false,
    learnMore: "",
  };
}

function emptyTrustLogoItem(): TrustLogoItem {
  return { name: "", imageSrc: "" };
}

function emptyProcessStep() {
  return { text: "" };
}

function emptyFaqItem() {
  return { question: "", answer: "" };
}

function emptyCaseStudyCard(): CaseStudyCard {
  return {
    title: "New case study",
    category: "Category",
    problem: "",
    solution: "",
    result: "",
    stat: "",
    statLabel: "",
  };
}

function emptyPublicationCard(): PublicationCard {
  return {
    title: "",
    category: "",
    dateLabel: "",
    readTime: "",
    imageSrc: "",
    articleBody: "",
    href: "",
  };
}

function moveHeroSlide(
  setDraft: Dispatch<SetStateAction<SiteContent>>,
  index: number,
  dir: "up" | "down"
) {
  setDraft((prev) => {
    const next = dir === "up" ? index - 1 : index + 1;
    if (next < 0 || next >= prev.heroCarouselSlides.length) return prev;
    const slides = [...prev.heroCarouselSlides];
    [slides[index], slides[next]] = [slides[next], slides[index]];
    return { ...prev, heroCarouselSlides: slides };
  });
}

export default function AdminSectionContent({
  activeSection,
  draft,
  setDraft,
  initialLeads,
  initialTestimonialSubmissions,
  aiStatus,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  passwordStatus,
  isChangingPassword,
  onUpdatePassword,
}: {
  activeSection: AdminSection;
  draft: SiteContent;
  setDraft: Dispatch<SetStateAction<SiteContent>>;
  initialLeads: Lead[];
  initialTestimonialSubmissions: TestimonialSubmission[];
  aiStatus: AIStatus;
  currentPassword: string;
  setCurrentPassword: Dispatch<SetStateAction<string>>;
  newPassword: string;
  setNewPassword: Dispatch<SetStateAction<string>>;
  passwordStatus: string;
  isChangingPassword: boolean;
  onUpdatePassword: () => void;
}) {
  if (activeSection === "overview") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Contact messages", value: String(initialLeads.length), highlight: false },
          {
            label: "Testimonials pending review",
            value: String(initialTestimonialSubmissions.filter((s) => s.status === "pending").length),
            highlight: false,
          },
          { label: "Current AI provider", value: aiStatus.activeProvider, highlight: true },
          { label: "Assistant name", value: draft.aiName, highlight: false },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/80 bg-card/60 p-5 shadow-sm backdrop-blur-sm transition hover:border-border"
          >
            <p className="text-xs font-mono uppercase tracking-wider text-foreground/50">{stat.label}</p>
            <p
              className={`mt-2 text-2xl font-bold tracking-tight sm:text-3xl ${
                stat.highlight ? "text-primary" : "text-foreground"
              } break-words`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (activeSection === "hero") {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              ["heroHeadline", "Hero Headline"],
              ["heroHighlight", "Hero Highlight"],
              ["heroTail", "Hero Tail"],
              ["heroBadge", "Hero Badge"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="text-sm text-foreground/70 block mb-2">{label}</span>
              <input
                value={draft[key]}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    [key]: event.target.value,
                  }))
                }
                className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Hero image carousel</p>
              <p className="text-xs text-foreground/55 mt-1 max-w-xl">
                Up to 8 slides. Use paths like /images/hero/hero image.svg, upload a file, or paste an https image URL. Save when done.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setDraft((prev) => {
                  const next: HeroCarouselSlide = {
                    id: `slide-${Date.now()}`,
                    src: defaultSlideSrc(prev.heroCarouselSlides),
                    alt: "Carousel slide",
                  };
                  if (prev.heroCarouselSlides.length >= 8) return prev;
                  return { ...prev, heroCarouselSlides: [...prev.heroCarouselSlides, next] };
                })
              }
              disabled={draft.heroCarouselSlides.length >= 8}
              className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-foreground/5 disabled:opacity-40"
            >
              Add slide
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {draft.heroCarouselSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="rounded-xl border border-border bg-card p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Slide {index + 1}</p>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveHeroSlide(setDraft, index, "up")}
                      disabled={index === 0}
                      className="p-1.5 rounded-md border border-border text-xs disabled:opacity-40"
                      aria-label="Move slide up"
                    >
                      <ArrowUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveHeroSlide(setDraft, index, "down")}
                      disabled={index === draft.heroCarouselSlides.length - 1}
                      className="p-1.5 rounded-md border border-border text-xs disabled:opacity-40"
                      aria-label="Move slide down"
                    >
                      <ArrowDown className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => {
                          if (prev.heroCarouselSlides.length <= 1) return prev;
                          return {
                            ...prev,
                            heroCarouselSlides: prev.heroCarouselSlides.filter((_, i) => i !== index),
                          };
                        })
                      }
                      disabled={draft.heroCarouselSlides.length <= 1}
                      className="ml-1 h-8 px-2 rounded-md text-xs text-red-600 hover:bg-red-500/10 disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="shrink-0 w-full sm:w-36 aspect-square rounded-lg border border-border bg-background overflow-hidden flex items-center justify-center">
                    <img
                      src={slide.src}
                      alt=""
                      className="max-w-full max-h-full object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <label className="block text-xs text-foreground/60">
                      Image URL or path
                      <input
                        value={slide.src}
                        onChange={(event) =>
                          patchHeroSlide(setDraft, index, { src: event.target.value })
                        }
                        className="mt-1 w-full h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                        placeholder="/images/hero/hero image.svg"
                      />
                    </label>
                    <label className="block text-xs text-foreground/60">
                      Alt text (accessibility)
                      <input
                        value={slide.alt}
                        onChange={(event) =>
                          patchHeroSlide(setDraft, index, { alt: event.target.value })
                        }
                        className="mt-1 w-full h-9 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:border-primary"
                      />
                    </label>
                    <div className="pt-1">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                        className="text-xs text-foreground/70 file:mr-2 file:rounded-md file:border file:border-border file:bg-background file:px-2 file:py-1"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          const form = new FormData();
                          form.append("file", file);
                          const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                          if (!res.ok) return;
                          const data = (await res.json()) as { url?: string };
                          if (data.url) {
                            patchHeroSlide(setDraft, index, { src: data.url });
                          }
                          event.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "systems") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Systems Section Tag</span>
            <input
              value={draft.systemsSectionTag}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, systemsSectionTag: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Systems Section Title</span>
            <input
              value={draft.systemsSectionTitle}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, systemsSectionTitle: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-foreground/70 block mb-2">Systems Section Description</span>
          <textarea
            rows={3}
            value={draft.systemsSectionDescription}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, systemsSectionDescription: event.target.value }))
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-foreground/70 block mb-2">Systems CTA Label</span>
          <input
            value={draft.systemsExploreCtaLabel}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, systemsExploreCtaLabel: event.target.value }))
            }
            className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.systemsCards.map((card, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <p className="text-sm font-semibold">System Card {index + 1}</p>
              <div className="flex gap-3">
                <div className="shrink-0 w-24 h-24 rounded-lg border border-border bg-card overflow-hidden flex items-center justify-center">
                  {card.imageSrc ? (
                    <img
                      src={card.imageSrc}
                      alt=""
                      className="max-w-full max-h-full object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-[10px] text-foreground/40 text-center px-1">No image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <label className="block text-xs text-foreground/60">
                    Image URL or /path
                    <input
                      value={card.imageSrc}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          systemsCards: prev.systemsCards.map((item, i) =>
                            i === index ? { ...item, imageSrc: event.target.value } : item
                          ),
                        }))
                      }
                      placeholder="/uploads/systems/..."
                      className="mt-0.5 w-full h-8 rounded-md border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="min-w-0 flex-1 text-[11px] text-foreground/70 file:mr-1 file:rounded file:border file:border-border file:bg-background file:px-1.5 file:py-0.5"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append("file", file);
                        form.append("folder", "systems");
                        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                        if (!res.ok) return;
                        const data = (await res.json()) as { url?: string };
                        if (data.url) {
                          setDraft((prev) => ({
                            ...prev,
                            systemsCards: prev.systemsCards.map((item, i) =>
                              i === index ? { ...item, imageSrc: data.url! } : item
                            ),
                          }));
                        }
                        event.target.value = "";
                      }}
                    />
                    {card.imageSrc.trim() !== "" && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            systemsCards: prev.systemsCards.map((item, i) =>
                              i === index ? { ...item, imageSrc: "" } : item
                            ),
                          }))
                        }
                        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground/80 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <ImageOff className="size-3.5" />
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <input
                value={card.title}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    systemsCards: prev.systemsCards.map((item, i) =>
                      i === index ? { ...item, title: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Card title"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <input
                value={card.tag}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    systemsCards: prev.systemsCards.map((item, i) =>
                      i === index ? { ...item, tag: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Card tag"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <textarea
                rows={3}
                value={card.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    systemsCards: prev.systemsCards.map((item, i) =>
                      i === index ? { ...item, description: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Card description"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-none"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === "explore") {
    return <AdminExploreArchitectureEditor draft={draft} setDraft={setDraft} />;
  }

  if (activeSection === "services") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Services Section Tag</span>
            <input
              value={draft.servicesSectionTag}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, servicesSectionTag: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Services Section Title</span>
            <input
              value={draft.servicesSectionTitle}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, servicesSectionTitle: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.servicesCards.map((card, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Service Card {index + 1}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() =>
                      setDraft((prev) => {
                        const nextCards = [...prev.servicesCards];
                        [nextCards[index - 1], nextCards[index]] = [nextCards[index], nextCards[index - 1]];
                        return { ...prev, servicesCards: nextCards };
                      })
                    }
                    className="size-8 rounded-lg border border-border bg-card grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Move service card up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.servicesCards.length - 1}
                    onClick={() =>
                      setDraft((prev) => {
                        const nextCards = [...prev.servicesCards];
                        [nextCards[index], nextCards[index + 1]] = [nextCards[index + 1], nextCards[index]];
                        return { ...prev, servicesCards: nextCards };
                      })
                    }
                    className="size-8 rounded-lg border border-border bg-card grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Move service card down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>
              <input
                value={card.title}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    servicesCards: prev.servicesCards.map((item, i) =>
                      i === index ? { ...item, title: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Card title"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <textarea
                rows={4}
                value={card.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    servicesCards: prev.servicesCards.map((item, i) =>
                      i === index ? { ...item, description: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Card description"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-none"
              />
              <label className="block text-xs text-foreground/70">
                Learn more dialog (paragraphs; blank line between)
                <textarea
                  rows={8}
                  value={card.learnMore}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      servicesCards: prev.servicesCards.map((item, i) =>
                        i === index ? { ...item, learnMore: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Longer copy for the Learn more popup…"
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-y text-sm min-h-[8rem]"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === "products") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Products Section Tag</span>
              <input
                value={draft.productsSectionTag}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, productsSectionTag: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Products Section Title</span>
              <input
                value={draft.productsSectionTitle}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, productsSectionTitle: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Section intro (under title)</span>
            <textarea
              rows={2}
              value={draft.productsSectionDescription ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, productsSectionDescription: event.target.value }))
              }
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-y text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">
              {'"Explore all" link (uppercase; opens full product list in a popup)'}
            </span>
            <input
              value={draft.productsCatalogCtaLabel ?? ""}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, productsCatalogCtaLabel: event.target.value }))
              }
              placeholder="EXPLORE ALL PRODUCTS"
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.productsCards.map((card, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">Product {index + 1}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-foreground/70">
                    <input
                      type="checkbox"
                      checked={card.featured === true}
                      onChange={(event) => {
                        const on = event.target.checked;
                        setDraft((prev) => ({
                          ...prev,
                          productsCards: prev.productsCards.map((item, i) =>
                            on
                              ? { ...item, featured: i === index }
                              : { ...item, featured: i === index ? false : Boolean(item.featured) }
                          ),
                        }));
                      }}
                      className="rounded border-border"
                    />
                    Featured (spotlight)
                  </label>
                  <button
                    type="button"
                    disabled={draft.productsCards.length <= 1}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        productsCards: prev.productsCards.filter((_, i) => i !== index),
                      }))
                    }
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground/70 transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remove product ${index + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                  {card.imageSrc ? (
                    <img src={card.imageSrc} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full place-content-center text-center text-[9px] text-foreground/35">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5 text-xs text-foreground/60">
                  <div className="flex flex-wrap gap-1.5">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="max-w-full text-[11px] file:mr-1 file:rounded file:border"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append("file", file);
                        form.append("folder", "products");
                        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                        if (!res.ok) return;
                        const data = (await res.json()) as { url?: string };
                        if (data.url) {
                          setDraft((prev) => ({
                            ...prev,
                            productsCards: prev.productsCards.map((item, i) =>
                              i === index ? { ...item, imageSrc: data.url! } : item
                            ),
                          }));
                        }
                        event.target.value = "";
                      }}
                    />
                  </div>
                  <input
                    value={card.imageSrc ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        productsCards: prev.productsCards.map((item, i) =>
                          i === index ? { ...item, imageSrc: event.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Image path or URL"
                    className="w-full h-8 rounded border border-border bg-card px-2 text-sm"
                  />
                </div>
              </div>
              <input
                value={card.title ?? ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    productsCards: prev.productsCards.map((item, i) =>
                      i === index ? { ...item, title: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Title"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={card.label ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      productsCards: prev.productsCards.map((item, i) =>
                        i === index ? { ...item, label: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Badge label (e.g. OPERATIONS)"
                  className="w-full h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={card.linkLabel ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      productsCards: prev.productsCards.map((item, i) =>
                        i === index ? { ...item, linkLabel: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="CTA text"
                  className="w-full h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <input
                value={card.href ?? ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    productsCards: prev.productsCards.map((item, i) =>
                      i === index ? { ...item, href: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Link (#contact, /path, or https://...)"
                className="w-full h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
              />
              <textarea
                rows={4}
                value={card.description ?? ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    productsCards: prev.productsCards.map((item, i) =>
                      i === index ? { ...item, description: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Description"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-y text-sm min-h-[5rem]"
              />
              <label className="block text-xs text-foreground/70">
                Learn more dialog (paragraphs; blank line between)
                <textarea
                  rows={6}
                  value={card.learnMore ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      productsCards: prev.productsCards.map((item, i) =>
                        i === index ? { ...item, learnMore: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Longer copy for the product Learn more modal…"
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-y text-sm min-h-[7rem]"
                />
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={draft.productsCards.length >= 16}
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              productsCards: [...prev.productsCards, emptyProductCard()],
            }))
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background text-sm font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
        >
          <Plus className="size-4" />
          Add product (max 16)
        </button>
      </div>
    );
  }

  if (activeSection === "caseStudies") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Case Studies Section Tag</span>
            <input
              value={draft.caseStudiesSectionTag}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, caseStudiesSectionTag: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Case Studies Section Title</span>
            <input
              value={draft.caseStudiesSectionTitle}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, caseStudiesSectionTitle: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-foreground/70 block mb-2">Case Studies Description</span>
          <textarea
            rows={3}
            value={draft.caseStudiesSectionDescription}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, caseStudiesSectionDescription: event.target.value }))
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-foreground/70 block mb-2">
            {'"View all" link (if you have more than 2 case studies, this opens the full catalog)'}
          </span>
          <input
            value={draft.caseStudiesSectionCtaLabel}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, caseStudiesSectionCtaLabel: event.target.value }))
            }
            placeholder="View all cases"
            className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.caseStudiesCards.map((card, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Case Study {index + 1}</p>
                <button
                  type="button"
                  disabled={draft.caseStudiesCards.length <= 1}
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      caseStudiesCards: prev.caseStudiesCards.filter((_, i) => i !== index),
                    }))
                  }
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground/70 transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Remove case study ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <input
                value={card.title}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    caseStudiesCards: prev.caseStudiesCards.map((item, i) =>
                      i === index ? { ...item, title: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Case title"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <input
                value={card.category}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    caseStudiesCards: prev.caseStudiesCards.map((item, i) =>
                      i === index ? { ...item, category: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Category"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <textarea
                rows={3}
                value={card.problem}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    caseStudiesCards: prev.caseStudiesCards.map((item, i) =>
                      i === index ? { ...item, problem: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Problem"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-none"
              />
              <textarea
                rows={3}
                value={card.solution}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    caseStudiesCards: prev.caseStudiesCards.map((item, i) =>
                      i === index ? { ...item, solution: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Solution"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-none"
              />
              <textarea
                rows={2}
                value={card.result}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    caseStudiesCards: prev.caseStudiesCards.map((item, i) =>
                      i === index ? { ...item, result: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Result"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={card.stat}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      caseStudiesCards: prev.caseStudiesCards.map((item, i) =>
                        i === index ? { ...item, stat: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Stat"
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
                />
                <input
                  value={card.statLabel}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      caseStudiesCards: prev.caseStudiesCards.map((item, i) =>
                        i === index ? { ...item, statLabel: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Stat label"
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={draft.caseStudiesCards.length >= 16}
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              caseStudiesCards: [...prev.caseStudiesCards, emptyCaseStudyCard()],
            }))
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background text-sm font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
        >
          <Plus className="size-4" />
          Add case study (max 16)
        </button>
      </div>
    );
  }

  if (activeSection === "publications") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Section tag (overline)</span>
            <input
              value={draft.publicationsSectionTag}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, publicationsSectionTag: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Section title</span>
            <input
              value={draft.publicationsSectionTitle}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, publicationsSectionTitle: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-foreground/70 block mb-2">Section description</span>
          <textarea
            rows={3}
            value={draft.publicationsSectionDescription}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, publicationsSectionDescription: event.target.value }))
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none"
          />
        </label>
        <label className="block">
          <span className="text-sm text-foreground/70 block mb-2">
            {'"View all" label (shown only when there are more than 3 publications)'}
          </span>
          <input
            value={draft.publicationsCatalogCtaLabel}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, publicationsCatalogCtaLabel: event.target.value }))
            }
            placeholder="VIEW ALL PUBLICATIONS"
            className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
          />
        </label>
        <p className="text-xs text-foreground/55">
          The home page shows the first three publications in order. Add a fourth to reveal the catalog CTA.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.publicationsCards.map((card, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Publication {index + 1}</p>
                <button
                  type="button"
                  disabled={draft.publicationsCards.length <= 1}
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      publicationsCards: prev.publicationsCards.filter((_, i) => i !== index),
                    }))
                  }
                  className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card text-foreground/70 transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Remove publication ${index + 1}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-card">
                  {card.imageSrc ? (
                    <img src={card.imageSrc} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full place-content-center text-center text-[9px] text-foreground/35">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5 text-xs text-foreground/60">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="max-w-full text-[11px] file:mr-1 file:rounded file:border"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const form = new FormData();
                      form.append("file", file);
                      form.append("folder", "publications");
                      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                      if (!res.ok) return;
                      const data = (await res.json()) as { url?: string };
                      if (data.url) {
                        setDraft((prev) => ({
                          ...prev,
                          publicationsCards: prev.publicationsCards.map((item, i) =>
                            i === index ? { ...item, imageSrc: data.url! } : item
                          ),
                        }));
                      }
                      event.target.value = "";
                    }}
                  />
                  <input
                    value={card.imageSrc ?? ""}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        publicationsCards: prev.publicationsCards.map((item, i) =>
                          i === index ? { ...item, imageSrc: event.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Image path or URL"
                    className="w-full h-8 rounded border border-border bg-card px-2 text-sm"
                  />
                </div>
              </div>
              <input
                value={card.title}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    publicationsCards: prev.publicationsCards.map((item, i) =>
                      i === index ? { ...item, title: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Title"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={card.category}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      publicationsCards: prev.publicationsCards.map((item, i) =>
                        i === index ? { ...item, category: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Category badge"
                  className="w-full h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={card.readTime ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      publicationsCards: prev.publicationsCards.map((item, i) =>
                        i === index ? { ...item, readTime: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Read time (e.g. 5 min read)"
                  className="w-full h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <input
                value={card.dateLabel ?? ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    publicationsCards: prev.publicationsCards.map((item, i) =>
                      i === index ? { ...item, dateLabel: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Date line (e.g. April 15, 2026)"
                className="w-full h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
              />
              <label className="block text-xs text-foreground/70">
                Full article (popup) — blank line between paragraphs
                <textarea
                  rows={10}
                  value={card.articleBody ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      publicationsCards: prev.publicationsCards.map((item, i) =>
                        i === index ? { ...item, articleBody: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Write what readers see when they open this piece…"
                  className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary resize-y min-h-[10rem]"
                />
              </label>
              <input
                value={card.href ?? ""}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    publicationsCards: prev.publicationsCards.map((item, i) =>
                      i === index ? { ...item, href: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Optional original URL (button in popup footer)"
                className="w-full h-9 rounded-lg border border-border bg-card px-2 text-sm outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          disabled={draft.publicationsCards.length >= 16}
          onClick={() =>
            setDraft((prev) => ({
              ...prev,
              publicationsCards: [...prev.publicationsCards, emptyPublicationCard()],
            }))
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background text-sm font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
        >
          <Plus className="size-4" />
          Add publication (max 16)
        </button>
      </div>
    );
  }

  if (activeSection === "testimonials") {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-foreground">How approvals work</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">
            <strong className="font-medium text-foreground/85">Approve</strong> sends a testimonial to the homepage Trust
            section (with the star rating the visitor chose). <strong className="font-medium text-foreground/85">Reject</strong>{" "}
            or <strong className="font-medium text-foreground/85">Unpublish</strong> removes it from the site.{" "}
            <strong className="font-medium text-foreground/85">Delete</strong> erases the record. Edit the Trust section
            heading and logo strip under{" "}
            <Link href="/admin/trust" className="font-medium text-primary underline-offset-4 hover:underline">
              Trust
            </Link>
            .
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Inbox &amp; live</h3>
          <TestimonialSubmissionsPanel submissions={initialTestimonialSubmissions} />
        </div>
      </div>
    );
  }

  if (activeSection === "trust") {
    return (
      <div className="space-y-5">
        <p className="text-xs text-foreground/50">
          Visitor testimonials are approved under{" "}
          <Link href="/admin/testimonials" className="font-medium text-primary underline-offset-2 hover:underline">
            Testimonials
          </Link>
          . This page sets the section title, partner logos, and marquee only.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Trust Section Tag</span>
            <input
              value={draft.trustSectionTag}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, trustSectionTag: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Trust Section Title</span>
            <input
              value={draft.trustSectionTitle}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, trustSectionTitle: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 space-y-4">
          <p className="text-sm font-semibold">Trusted by — partner logos</p>
          <p className="text-xs text-foreground/60">
            Upload PNG/SVG/WebP or paste a URL. Logos are shown in the marquee; the partner name is used for accessibility (and as a text fallback if no image is set).
          </p>
          {draft.trustLogoItems.map((logo, index) => (
            <div key={index} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex flex-wrap items-start gap-3">
                <div className="flex h-14 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background px-2">
                  {logo.imageSrc.trim() ? (
                    <img src={logo.imageSrc} alt="" className="max-h-10 w-auto max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-foreground/40">No logo</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block text-xs text-foreground/60">
                    Partner name
                    <input
                      value={logo.name}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          trustLogoItems: prev.trustLogoItems.map((item, i) =>
                            i === index ? { ...item, name: event.target.value } : item
                          ),
                        }))
                      }
                      placeholder="e.g. Acme Corp"
                      className="mt-0.5 w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <label className="block text-xs text-foreground/60">
                    Logo URL or /path
                    <input
                      value={logo.imageSrc}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          trustLogoItems: prev.trustLogoItems.map((item, i) =>
                            i === index ? { ...item, imageSrc: event.target.value } : item
                          ),
                        }))
                      }
                      placeholder="/uploads/trust/..."
                      className="mt-0.5 w-full h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="min-w-0 flex-1 text-[11px] text-foreground/70 file:mr-1 file:rounded file:border file:border-border file:bg-background file:px-1.5 file:py-0.5"
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const form = new FormData();
                        form.append("file", file);
                        form.append("folder", "trust");
                        const res = await fetch("/api/admin/upload", { method: "POST", body: form });
                        if (!res.ok) return;
                        const data = (await res.json()) as { url?: string };
                        if (data.url) {
                          setDraft((prev) => ({
                            ...prev,
                            trustLogoItems: prev.trustLogoItems.map((item, i) =>
                              i === index ? { ...item, imageSrc: data.url! } : item
                            ),
                          }));
                        }
                        event.target.value = "";
                      }}
                    />
                    {draft.trustLogoItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            trustLogoItems: prev.trustLogoItems.filter((_, i) => i !== index),
                          }))
                        }
                        className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground/80 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </button>
                    )}
                    {logo.imageSrc.trim() !== "" && (
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            trustLogoItems: prev.trustLogoItems.map((item, i) =>
                              i === index ? { ...item, imageSrc: "" } : item
                            ),
                          }))
                        }
                        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-foreground/80 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <ImageOff className="size-3.5" />
                        Clear image
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={draft.trustLogoItems.length >= 12}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                trustLogoItems: [...prev.trustLogoItems, emptyTrustLogoItem()],
              }))
            }
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background text-sm font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
          >
            <Plus className="size-4" />
            Add partner logo (max 12)
          </button>
        </div>
      </div>
    );
  }

  if (activeSection === "processFaq") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Section Tag</span>
            <input
              value={draft.processFaqSectionTag}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, processFaqSectionTag: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Section Title</span>
            <input
              value={draft.processFaqSectionTitle}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, processFaqSectionTitle: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-foreground/70 block mb-2">Section Description</span>
          <textarea
            rows={3}
            value={draft.processFaqSectionDescription}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, processFaqSectionDescription: event.target.value }))
            }
            className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Process card label</span>
            <input
              value={draft.processFaqProcessCardLabel}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, processFaqProcessCardLabel: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">FAQ card label</span>
            <input
              value={draft.processFaqFaqCardLabel}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, processFaqFaqCardLabel: event.target.value }))
              }
              className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <p className="text-sm font-semibold">Process Steps</p>
            {draft.processSteps.map((step, index) => (
              <div key={`process-step-${index}`} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground/55">Step {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        setDraft((prev) => {
                          const next = [...prev.processSteps];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return { ...prev, processSteps: next };
                        })
                      }
                      className="size-7 rounded-md border border-border bg-card grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move process step up"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === draft.processSteps.length - 1}
                      onClick={() =>
                        setDraft((prev) => {
                          const next = [...prev.processSteps];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return { ...prev, processSteps: next };
                        })
                      }
                      className="size-7 rounded-md border border-border bg-card grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move process step down"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          processSteps: prev.processSteps.filter((_, i) => i !== index),
                        }))
                      }
                      className="size-7 rounded-md border border-border bg-card grid place-items-center text-foreground/70 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Remove process step"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  value={step.text}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      processSteps: prev.processSteps.map((item, i) =>
                        i === index ? { text: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder={`Step ${index + 1}`}
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
                />
              </div>
            ))}
            <button
              type="button"
              disabled={draft.processSteps.length >= 12}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  processSteps: [...prev.processSteps, emptyProcessStep()],
                }))
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background text-sm font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
            >
              <Plus className="size-4" />
              Add step (max 12)
            </button>
          </div>
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <p className="text-sm font-semibold">FAQ Items</p>
            {draft.faqItems.map((faq, index) => (
              <div key={`faq-item-${index}`} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-foreground/55">FAQ {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        setDraft((prev) => {
                          const next = [...prev.faqItems];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return { ...prev, faqItems: next };
                        })
                      }
                      className="size-7 rounded-md border border-border bg-card grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move FAQ up"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === draft.faqItems.length - 1}
                      onClick={() =>
                        setDraft((prev) => {
                          const next = [...prev.faqItems];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return { ...prev, faqItems: next };
                        })
                      }
                      className="size-7 rounded-md border border-border bg-card grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move FAQ down"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          faqItems: prev.faqItems.filter((_, i) => i !== index),
                        }))
                      }
                      className="size-7 rounded-md border border-border bg-card grid place-items-center text-foreground/70 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
                      aria-label="Remove FAQ"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  value={faq.question}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      faqItems: prev.faqItems.map((item, i) =>
                        i === index ? { ...item, question: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder={`Question ${index + 1}`}
                  className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
                />
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      faqItems: prev.faqItems.map((item, i) =>
                        i === index ? { ...item, answer: event.target.value } : item
                      ),
                    }))
                  }
                  placeholder="Answer"
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-none"
                />
              </div>
            ))}
            <button
              type="button"
              disabled={draft.faqItems.length >= 12}
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  faqItems: [...prev.faqItems, emptyFaqItem()],
                }))
              }
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background text-sm font-medium text-foreground/80 transition hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-6"
            >
              <Plus className="size-4" />
              Add FAQ (max 12)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "contact") {
    return (
      <div className="space-y-5">
        <p className="text-sm text-foreground/65">
          Email, phone, and WhatsApp appear in the <strong className="font-medium text-foreground/80">#contact</strong>{" "}
          section and in the footer. Digits only for WhatsApp number (country code, no +).
        </p>

        <div className="rounded-2xl border border-border bg-background p-4 space-y-4">
          <h3 className="text-sm font-semibold">Contact section (homepage)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Section tag</span>
              <input
                value={draft.contactSectionTag}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactSectionTag: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Headline</span>
              <input
                value={draft.contactSectionTitle}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactSectionTitle: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Intro text</span>
            <textarea
              rows={3}
              value={draft.contactSectionDescription}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, contactSectionDescription: event.target.value }))
              }
              className="w-full rounded-xl border border-border bg-card px-4 py-3 outline-none focus:border-primary resize-none"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 space-y-4">
          <h3 className="text-sm font-semibold">Contact details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Email</span>
              <input
                value={draft.contactEmail}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactEmail: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Phone (display and click-to-call)</span>
              <input
                value={draft.contactPhone}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactPhone: event.target.value }))
                }
                placeholder="+251 991 185 321"
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">WhatsApp number (digits only)</span>
              <input
                value={draft.whatsappNumber}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, whatsappNumber: event.target.value }))
                }
                placeholder="251991185321"
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">WhatsApp link label</span>
              <input
                value={draft.contactWhatsappLabel}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactWhatsappLabel: event.target.value }))
                }
                placeholder="WhatsApp Chat"
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm text-foreground/70 block mb-2">AI assistant name (chat widget)</span>
              <input
                value={draft.aiName}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, aiName: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 space-y-4">
          <h3 className="text-sm font-semibold">Contact form (homepage)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                ["contactNamePlaceholder", "Name placeholder"],
                ["contactEmailPlaceholder", "Email placeholder"],
                ["contactCompanyPlaceholder", "Company placeholder"],
                ["contactLeadPhonePlaceholder", "Phone placeholder (visitor)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-sm text-foreground/70 block mb-2">{label}</span>
                <input
                  value={draft[key]}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      [key]: event.target.value,
                    }))
                  }
                  className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
                />
              </label>
            ))}
            <label className="block md:col-span-2">
              <span className="text-sm text-foreground/70 block mb-2">Message placeholder</span>
              <input
                value={draft.contactMessagePlaceholder}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactMessagePlaceholder: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Submit button label</span>
              <input
                value={draft.contactSubmitLabel}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactSubmitLabel: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm text-foreground/70 block mb-2">Note under button</span>
              <input
                value={draft.contactReplyNote}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, contactReplyNote: event.target.value }))
                }
                className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Social Media Links</h3>
            <p className="text-xs text-foreground/55">Edit label, URL, icon, order and visibility.</p>
          </div>
          <div className="space-y-3">
            {draft.socialLinks.map((item, index) => (
              <div key={`${item.label}-${index}`} className="rounded-xl border border-border bg-card p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground/65">Social Link {index + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        setDraft((prev) => {
                          const next = [...prev.socialLinks];
                          [next[index - 1], next[index]] = [next[index], next[index - 1]];
                          return { ...prev, socialLinks: next };
                        })
                      }
                      className="size-7 rounded-md border border-border bg-background grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move social link up"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === draft.socialLinks.length - 1}
                      onClick={() =>
                        setDraft((prev) => {
                          const next = [...prev.socialLinks];
                          [next[index], next[index + 1]] = [next[index + 1], next[index]];
                          return { ...prev, socialLinks: next };
                        })
                      }
                      className="size-7 rounded-md border border-border bg-background grid place-items-center disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Move social link down"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    value={item.label}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        socialLinks: prev.socialLinks.map((social, i) =>
                          i === index ? { ...social, label: event.target.value } : social
                        ),
                      }))
                    }
                    placeholder="Label"
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 outline-none focus:border-primary"
                  />
                  <select
                    value={item.icon}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        socialLinks: prev.socialLinks.map((social, i) =>
                          i === index
                            ? {
                                ...social,
                                icon: event.target.value as
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
                    className="w-full h-10 rounded-lg border border-border bg-background px-3 outline-none focus:border-primary"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="github">GitHub</option>
                    <option value="website">Website</option>
                  </select>
                  <label className="inline-flex h-10 items-center gap-2 text-sm text-foreground/70">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          socialLinks: prev.socialLinks.map((social, i) =>
                            i === index ? { ...social, enabled: event.target.checked } : social
                          ),
                        }))
                      }
                      className="size-4 rounded border-border bg-background"
                    />
                    Visible in footer
                  </label>
                </div>
                <input
                  value={item.url}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      socialLinks: prev.socialLinks.map((social, i) =>
                        i === index ? { ...social, url: event.target.value } : social
                      ),
                    }))
                  }
                  placeholder="https://..."
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "leads") {
    return (
      <div className="rounded-2xl border border-border/80 bg-card/40 p-4 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold sm:text-xl">Contact messages</h3>
        <p className="mt-1 text-sm text-foreground/55">
          Submissions from the homepage contact form. Reply by email or call when a phone number is provided.
        </p>
        {initialLeads.length === 0 ? (
          <p className="mt-6 text-sm text-foreground/60">No messages yet.</p>
        ) : (
          <div className="mt-4 space-y-3 max-h-[min(70vh,520px)] overflow-y-auto overscroll-contain pr-1 -mr-1">
            {initialLeads.map((lead) => {
              const replySubject = encodeURIComponent(`Re: Your message to Yafetpromedia`);
              const replyBody = encodeURIComponent(
                `Hi ${lead.name},\n\nThank you for reaching out.\n\n`
              );
              const mailtoHref = `mailto:${lead.email}?subject=${replySubject}&body=${replyBody}`;
              const telHref =
                lead.phone.trim() !== "" ? `tel:${lead.phone.replace(/\s+/g, "")}` : null;
              return (
                <article
                  key={lead.id}
                  className="rounded-xl border border-border/70 bg-background/80 p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <h4 className="font-semibold break-words">{lead.name}</h4>
                    <time
                      className="shrink-0 text-xs text-foreground/45 tabular-nums"
                      dateTime={lead.created_at}
                    >
                      {new Date(lead.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-foreground/65 break-words">{lead.company}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={mailtoHref}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground/85 transition hover:border-primary/50 hover:text-primary"
                    >
                      <Mail className="size-3.5" />
                      Reply by email
                    </a>
                    {telHref ? (
                      <a
                        href={telHref}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-foreground/85 transition hover:border-primary/50 hover:text-primary"
                      >
                        <PhoneCall className="size-3.5" />
                        Call
                      </a>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm break-all text-primary">{lead.email}</p>
                  {lead.phone.trim() !== "" && (
                    <p className="mt-1 text-sm text-foreground/70">{lead.phone}</p>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-foreground/75 break-words whitespace-pre-wrap">
                    {lead.message}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  if (activeSection === "security") {
    return (
      <div className="rounded-2xl border border-border bg-background p-5 max-w-2xl">
        <h3 className="text-xl font-semibold mb-2">Change Admin Password</h3>
        <p className="text-sm text-foreground/60 mb-4">Use a strong password and store it safely.</p>
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">Current Password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-sm text-foreground/70 block mb-2">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full h-11 rounded-xl border border-border bg-card px-4 outline-none focus:border-primary"
            />
          </label>
          <button
            onClick={onUpdatePassword}
            className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </button>
          {passwordStatus && <p className="text-sm text-foreground/70">{passwordStatus}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="rounded-xl border border-border bg-background p-4 flex items-center justify-between">
        <span className="text-foreground/70">Active provider</span>
        <span className="font-semibold text-primary">{aiStatus.activeProvider}</span>
      </div>
      <div className="rounded-xl border border-border bg-background p-4 flex items-center justify-between">
        <span className="text-foreground/70">Gemini key</span>
        <span className={aiStatus.geminiConfigured ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
          {aiStatus.geminiConfigured ? "Detected" : "Missing"}
        </span>
      </div>
      <div className="rounded-xl border border-border bg-background p-4 flex items-center justify-between">
        <span className="text-foreground/70">OpenAI key</span>
        <span className={aiStatus.openAIConfigured ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
          {aiStatus.openAIConfigured ? "Detected" : "Missing"}
        </span>
      </div>
      <p className="text-foreground/55">
        Gemini model: <span className="text-foreground/85">{aiStatus.geminiModel}</span>
      </p>
      <p className="text-foreground/55">
        OpenAI model: <span className="text-foreground/85">{aiStatus.openAIModel}</span>
      </p>
    </div>
  );
}
