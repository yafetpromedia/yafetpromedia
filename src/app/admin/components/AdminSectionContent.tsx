"use client";

import { Dispatch, SetStateAction } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { SiteContent } from "@/lib/site-content.shared";
import { AIStatus, AdminSection, Lead } from "@/app/admin/types";

export default function AdminSectionContent({
  activeSection,
  draft,
  setDraft,
  initialLeads,
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-foreground/60">Leads captured</p>
          <p className="text-3xl font-bold mt-2">{initialLeads.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-foreground/60">Current AI Provider</p>
          <p className="text-3xl font-bold mt-2 text-primary">{aiStatus.activeProvider}</p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="text-sm text-foreground/60">Assistant Name</p>
          <p className="text-3xl font-bold mt-2">{draft.aiName}</p>
        </div>
      </div>
    );
  }

  if (activeSection === "hero") {
    return (
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSection === "products") {
    return (
      <div className="space-y-5">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.productsCards.map((card, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <p className="text-sm font-semibold">Product Card {index + 1}</p>
              <input
                value={card.title}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    productsCards: prev.productsCards.map((item, i) =>
                      i === index ? { ...item, title: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Card title"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <input
                value={card.label}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    productsCards: prev.productsCards.map((item, i) =>
                      i === index ? { ...item, label: event.target.value } : item
                    ),
                  }))
                }
                placeholder="Card label"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <textarea
                rows={4}
                value={card.description}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    productsCards: prev.productsCards.map((item, i) =>
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
          <span className="text-sm text-foreground/70 block mb-2">Case Studies CTA Label</span>
          <input
            value={draft.caseStudiesSectionCtaLabel}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, caseStudiesSectionCtaLabel: event.target.value }))
            }
            className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
          />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.caseStudiesCards.map((card, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <p className="text-sm font-semibold">Case Study {index + 1}</p>
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
      </div>
    );
  }

  if (activeSection === "trust") {
    return (
      <div className="space-y-5">
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

        <div className="rounded-xl border border-border bg-background p-4 space-y-3">
          <p className="text-sm font-semibold">Trusted By Logo Items</p>
          {draft.trustLogoItems.map((logo, index) => (
            <input
              key={index}
              value={logo}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  trustLogoItems: prev.trustLogoItems.map((item, i) =>
                    i === index ? event.target.value : item
                  ),
                }))
              }
              placeholder={`Logo item ${index + 1}`}
              className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {draft.trustTestimonials.map((item, index) => (
            <div key={index} className="rounded-xl border border-border bg-background p-4 space-y-3">
              <p className="text-sm font-semibold">Testimonial {index + 1}</p>
              <textarea
                rows={4}
                value={item.quote}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    trustTestimonials: prev.trustTestimonials.map((t, i) =>
                      i === index ? { ...t, quote: event.target.value } : t
                    ),
                  }))
                }
                placeholder="Quote"
                className="w-full rounded-lg border border-border bg-card px-3 py-2 outline-none focus:border-primary resize-none"
              />
              <input
                value={item.author}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    trustTestimonials: prev.trustTestimonials.map((t, i) =>
                      i === index ? { ...t, author: event.target.value } : t
                    ),
                  }))
                }
                placeholder="Author"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
              <input
                value={item.role}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    trustTestimonials: prev.trustTestimonials.map((t, i) =>
                      i === index ? { ...t, role: event.target.value } : t
                    ),
                  }))
                }
                placeholder="Role"
                className="w-full h-10 rounded-lg border border-border bg-card px-3 outline-none focus:border-primary"
              />
            </div>
          ))}
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
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <p className="text-sm font-semibold">Process Steps</p>
            {draft.processSteps.map((step, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
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
          </div>
          <div className="rounded-xl border border-border bg-background p-4 space-y-3">
            <p className="text-sm font-semibold">FAQ Items</p>
            {draft.faqItems.map((faq, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
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
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === "contact") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(
            [
              ["contactEmail", "Contact Email"],
              ["contactPhone", "Contact Phone"],
              ["aiName", "AI Assistant Name"],
              ["whatsappNumber", "WhatsApp Number"],
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
      <div className="rounded-2xl border border-border bg-background p-4">
        <h3 className="text-lg font-semibold mb-3">Recent Leads</h3>
        {initialLeads.length === 0 ? (
          <p className="text-foreground/60 text-sm">No leads submitted yet.</p>
        ) : (
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {initialLeads.map((lead) => (
              <article key={lead.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex justify-between gap-3 items-start">
                  <h4 className="font-semibold">{lead.name}</h4>
                  <span className="text-xs text-foreground/45">
                    {new Date(lead.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/65">{lead.company}</p>
                <p className="text-sm text-primary mt-1">{lead.email}</p>
                <p className="text-sm text-foreground/70 mt-3">{lead.message}</p>
              </article>
            ))}
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
