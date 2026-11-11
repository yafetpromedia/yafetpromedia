"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, MessageSquareText, Plus, Trash2, Wrench } from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { ServiceCard, SiteContent } from "@/lib/site-content.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48";

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-accent/45 focus:ring-2 focus:ring-accent/15",
  ""
);

const textareaCls = cn(inputCls, "min-h-[100px] resize-y py-3 leading-relaxed");

const reorderBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-card text-foreground/80 transition",
  "hover:border-accent/35 hover:bg-accent/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const ghostBtn =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/75 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:border-accent/35 hover:bg-accent/[0.07] disabled:pointer-events-none disabled:opacity-35";

const SERVICE_CARD_MIN = 1;
const SERVICE_CARD_MAX = 8;

function emptyServiceCard(): ServiceCard {
  return { title: "", description: "", learnMore: "" };
}

export default function AdminServicesSection({ draft, setDraft }: Props) {
  const [cardFilter, setCardFilter] = useState("");
  const filteredCards = useMemo(() => {
    const indexed = draft.servicesCards.map((card, index) => ({ card, index }));
    if (!cardFilter.trim()) return indexed;
    return indexed.filter(({ card }) =>
      matchesAdminFilter(cardFilter, card.title, card.description, card.learnMore)
    );
  }, [draft.servicesCards, cardFilter]);

  const moveCard = (index: number, dir: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.servicesCards];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, servicesCards: next };
    });
  };

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-muted/35 to-card p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-primary/[0.12] blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 size-[220px] rounded-full bg-violet-500/[0.1] blur-[90px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/28">
              <Wrench className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/90">
                Homepage · Services
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Services grid & dialogs
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Controls the section label and service cards—short blurbs on the grid and long-form copy for each Learn
                more dialog (add/remove cards; max {SERVICE_CARD_MAX}).
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-border/70 bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 bg-background">
            <MessageSquareText className="size-3.5 text-primary/75" />
            {draft.servicesCards.length} cards · reorder preserved on save
          </div>
        </div>
      </div>

      {/* Section copy */}
      <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm backdrop-blur-sm sm:p-8 ">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <MessageSquareText className="size-4 text-primary/75" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Section header</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Eyebrow / tag</span>
            <input
              value={draft.servicesSectionTag}
              onChange={(e) => setDraft((prev) => ({ ...prev, servicesSectionTag: e.target.value }))}
              className={inputCls}
              placeholder="e.g. WHAT WE DO"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Main title</span>
            <input
              value={draft.servicesSectionTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, servicesSectionTitle: e.target.value }))}
              className={inputCls}
              placeholder="Headline above the grid"
            />
          </label>
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Grid cards
            </p>
            <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Service tiles</h4>
            <p className="mt-1 max-w-lg text-sm text-foreground/52">
              Short title and summary show on the homepage; the Learn more panel uses the long copy below.
            </p>
          </div>
          <button
            type="button"
            disabled={draft.servicesCards.length >= SERVICE_CARD_MAX}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                servicesCards: [...prev.servicesCards, emptyServiceCard()],
              }))
            }
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add card
          </button>
        </div>

        <AdminListFilter
          id="admin-services-card-filter"
          value={cardFilter}
          onChange={setCardFilter}
          placeholder="Filter cards by title or copy…"
          resultHint={
            cardFilter.trim()
              ? `${filteredCards.length} of ${draft.servicesCards.length} shown`
              : undefined
          }
          className="mb-2"
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredCards.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-muted/20">
              No cards match this filter.
            </p>
          ) : null}
          {filteredCards.map(({ card, index }) => (
            <div
              key={`svc-${index}`}
              className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-card to-muted/30 p-5 shadow-sm ring-1 ring-black/[0.04] transition hover:border-primary/18   sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/45 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 font-mono text-sm font-bold tabular-nums text-primary ring-1 ring-primary/22">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {card.title.trim() || `Service ${index + 1}`}
                    </p>
                    <p className="truncate font-mono text-[11px] text-foreground/42">Card · homepage grid</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={draft.servicesCards.length <= SERVICE_CARD_MIN}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        servicesCards: prev.servicesCards.filter((_, i) => i !== index),
                      }))
                    }
                    className={cn(
                      ghostBtn,
                      "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    )}
                    aria-label={`Remove service card ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCard(index, -1)}
                    className={reorderBtn}
                    aria-label="Move card up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.servicesCards.length - 1}
                    onClick={() => moveCard(index, 1)}
                    className={reorderBtn}
                    aria-label="Move card down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className={labelCls}>Title</span>
                  <input
                    value={card.title}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        servicesCards: prev.servicesCards.map((item, i) =>
                          i === index ? { ...item, title: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Card title"
                    className={inputCls}
                  />
                </label>

                <label className="block">
                  <span className={labelCls}>Short description</span>
                  <textarea
                    rows={4}
                    value={card.description}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        servicesCards: prev.servicesCards.map((item, i) =>
                          i === index ? { ...item, description: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Visible on the grid under the title"
                    className={textareaCls}
                  />
                </label>

                <div>
                  <span className={labelCls}>Learn more dialog</span>
                  <p className="mb-2 text-xs leading-relaxed text-foreground/48">
                    Paragraphs for the modal—use a blank line between paragraphs.
                  </p>
                  <textarea
                    rows={10}
                    value={card.learnMore}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        servicesCards: prev.servicesCards.map((item, i) =>
                          i === index ? { ...item, learnMore: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="Longer copy when visitors tap Learn more…"
                    spellCheck={false}
                    className={cn(
                      "w-full min-h-[11rem] resize-y rounded-2xl border border-violet-500/15 bg-muted/50 px-4 py-3 font-mono text-[12px] leading-relaxed text-foreground/90 outline-none ring-1 ring-border/50",
                      "placeholder:text-violet-950/50 focus:border-violet-500/35 focus:ring-2 focus:ring-violet-500/12",
                      ""
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
