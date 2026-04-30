"use client";

/* eslint-disable @next/next/no-img-element -- admin previews: arbitrary upload URLs */

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  ImageOff,
  LayoutGrid,
  Package,
  Plus,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { ProductCard, SiteContent } from "@/lib/site-content.shared";
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

const textareaCls = cn(inputCls, "min-h-[96px] resize-y py-3 leading-relaxed");

const reorderBtn = cn(
  "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-card/80 text-foreground/80 transition",
  "hover:border-primary/35 hover:bg-primary/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const ghostBtn =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-border/75 px-3 py-2 text-xs font-semibold text-foreground/85 transition hover:border-primary/35 hover:bg-primary/[0.07] disabled:pointer-events-none disabled:opacity-35";

const PRODUCT_CARD_MIN = 1;
const PRODUCT_CARD_MAX = 16;

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

export default function AdminProductsSection({ draft, setDraft }: Props) {
  const [cardFilter, setCardFilter] = useState("");
  const filteredProducts = useMemo(() => {
    const indexed = draft.productsCards.map((card, index) => ({ card, index }));
    if (!cardFilter.trim()) return indexed;
    return indexed.filter(({ card }) =>
      matchesAdminFilter(
        cardFilter,
        card.title,
        card.description,
        card.label,
        card.imageSrc,
        card.href,
        card.linkLabel,
        card.learnMore
      )
    );
  }, [draft.productsCards, cardFilter]);

  const moveCard = (index: number, dir: -1 | 1) => {
    setDraft((prev) => {
      const next = [...prev.productsCards];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return { ...prev, productsCards: next };
    });
  };

  const setFeatured = (index: number, on: boolean) => {
    setDraft((prev) => ({
      ...prev,
      productsCards: prev.productsCards.map((item, i) =>
        on ? { ...item, featured: i === index } : { ...item, featured: i === index ? false : Boolean(item.featured) }
      ),
    }));
  };

  return (
    <div className="max-w-5xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-emerald-500/[0.07] via-card/92 to-primary/[0.08] p-6 shadow-[0_28px_80px_-44px_rgba(16,185,129,0.28)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-emerald-500/[0.11] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-primary/[0.11] blur-[95px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-400">
              <Package className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-700/95 dark:text-emerald-400/95">
                Homepage · Products
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                Product catalog & spotlight
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Flagship grid, thumbnails, CTAs, and Learn more modals. One card can be marked featured for the hero row;
                up to {PRODUCT_CARD_MAX} products.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <LayoutGrid className="size-3.5 text-emerald-600/80 dark:text-emerald-400/90" />
            {draft.productsCards.length} products
          </div>
        </div>
      </div>

      {/* Section header */}
      <section className="rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/35">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <Sparkles className="size-4 text-emerald-600/85 dark:text-emerald-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Section header</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Eyebrow / tag</span>
            <input
              value={draft.productsSectionTag}
              onChange={(e) => setDraft((prev) => ({ ...prev, productsSectionTag: e.target.value }))}
              className={inputCls}
              placeholder="e.g. FLAGSHIP SYSTEMS"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Main title</span>
            <input
              value={draft.productsSectionTitle}
              onChange={(e) => setDraft((prev) => ({ ...prev, productsSectionTitle: e.target.value }))}
              className={inputCls}
            />
          </label>
        </div>
        <label className="mt-6 block">
          <span className={labelCls}>Intro (under title)</span>
          <textarea
            rows={3}
            value={draft.productsSectionDescription ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, productsSectionDescription: e.target.value }))}
            className={textareaCls}
            placeholder="Supporting line under the headline."
          />
        </label>
        <label className="mt-6 block max-w-xl">
          <span className={labelCls}>Explore all CTA</span>
          <p className="mb-2 text-xs text-foreground/48">
            Uppercase label that opens the full product list modal (e.g. EXPLORE ALL PRODUCTS).
          </p>
          <input
            value={draft.productsCatalogCtaLabel ?? ""}
            onChange={(e) => setDraft((prev) => ({ ...prev, productsCatalogCtaLabel: e.target.value }))}
            placeholder="EXPLORE ALL PRODUCTS"
            className={inputCls}
          />
        </label>
      </section>

      {/* Cards */}
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Product cards
            </p>
            <h4 className="font-display text-lg font-bold tracking-tight text-foreground">Tiles & links</h4>
            <p className="mt-1 max-w-lg text-sm text-foreground/52">
              Thumbnail, badge, short description, and modal body. Featured picks one spotlight tile for the layout.
            </p>
          </div>
          <button
            type="button"
            disabled={draft.productsCards.length >= PRODUCT_CARD_MAX}
            onClick={() =>
              setDraft((prev) => ({
                ...prev,
                productsCards: [...prev.productsCards, emptyProductCard()],
              }))
            }
            className={cn(ghostBtn, "text-primary")}
          >
            <Plus className="size-3.5" />
            Add product
          </button>
        </div>

        <AdminListFilter
          id="admin-products-filter"
          value={cardFilter}
          onChange={setCardFilter}
          placeholder="Filter products by title, badge, link…"
          resultHint={
            cardFilter.trim()
              ? `${filteredProducts.length} of ${draft.productsCards.length} shown`
              : undefined
          }
          className="mb-2"
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredProducts.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
              No products match this filter.
            </p>
          ) : null}
          {filteredProducts.map(({ card, index }) => (
            <div
              key={`prod-${index}`}
              className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-card/95 to-card/72 p-5 shadow-[0_22px_68px_-36px_rgba(0,0,0,0.62)] ring-1 ring-black/[0.04] transition hover:border-emerald-500/15 dark:from-card/[0.93] dark:to-card/56 dark:shadow-[0_28px_80px_-40px_rgba(0,0,0,0.82)] sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/45 pb-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/12 font-mono text-sm font-bold tabular-nums text-emerald-800 ring-1 ring-emerald-500/22 dark:text-emerald-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {card.title.trim() || `Product ${index + 1}`}
                    </p>
                    <p className="truncate font-mono text-[11px] text-foreground/42">
                      {(card.label ?? "").trim() || "Badge"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                      card.featured
                        ? "border-amber-500/45 bg-amber-500/12 text-amber-950 dark:text-amber-100"
                        : "border-border/70 bg-background/60 text-foreground/65 hover:border-foreground/20"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={card.featured === true}
                      onChange={(e) => setFeatured(index, e.target.checked)}
                      className="sr-only"
                    />
                    <Star className={cn("size-3.5", card.featured ? "fill-amber-400 text-amber-600" : "")} />
                    Featured
                  </label>
                  <button
                    type="button"
                    disabled={draft.productsCards.length <= PRODUCT_CARD_MIN}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        productsCards: prev.productsCards.filter((_, i) => i !== index),
                      }))
                    }
                    className={cn(
                      ghostBtn,
                      "border-red-500/25 px-2 py-1.5 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                    )}
                    aria-label={`Remove product ${index + 1}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveCard(index, -1)}
                    className={reorderBtn}
                    aria-label="Move product up"
                  >
                    <ArrowUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === draft.productsCards.length - 1}
                    onClick={() => moveCard(index, 1)}
                    className={reorderBtn}
                    aria-label="Move product down"
                  >
                    <ArrowDown className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
                <div className="shrink-0 lg:w-[148px]">
                  <span className={labelCls}>Thumbnail</span>
                  <div className="relative mt-1 aspect-square w-full max-w-[148px] overflow-hidden rounded-2xl border border-white/[0.08] bg-background/80 ring-1 ring-black/[0.05] dark:bg-white/[0.03]">
                    {card.imageSrc ? (
                      <img src={card.imageSrc} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center">
                        <ImageIcon className="size-8 text-foreground/22" />
                        <span className="text-[11px] font-medium text-foreground/38">No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="mt-3 w-full min-w-0 text-[11px] text-foreground/65 file:mr-2 file:rounded-lg file:border file:border-border file:bg-background file:px-2 file:py-1.5 file:text-xs file:font-medium"
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
                  <input
                    value={card.imageSrc ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        productsCards: prev.productsCards.map((item, i) =>
                          i === index ? { ...item, imageSrc: e.target.value } : item
                        ),
                      }))
                    }
                    placeholder="/uploads/products/… or URL"
                    className={cn(inputCls, "mt-2 text-sm")}
                  />
                  {(card.imageSrc ?? "").trim() !== "" && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({
                          ...prev,
                          productsCards: prev.productsCards.map((item, i) =>
                            i === index ? { ...item, imageSrc: "" } : item
                          ),
                        }))
                      }
                      className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-border/80 text-xs font-semibold text-foreground/75 transition hover:border-red-500/45 hover:bg-red-500/[0.08] hover:text-red-600 dark:hover:text-red-400"
                    >
                      <ImageOff className="size-3.5" />
                      Clear image
                    </button>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <label className="block">
                    <span className={labelCls}>Title</span>
                    <input
                      value={card.title ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          productsCards: prev.productsCards.map((item, i) =>
                            i === index ? { ...item, title: e.target.value } : item
                          ),
                        }))
                      }
                      placeholder="Product name"
                      className={inputCls}
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelCls}>Badge label</span>
                      <input
                        value={card.label ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            productsCards: prev.productsCards.map((item, i) =>
                              i === index ? { ...item, label: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="e.g. FLAGSHIP"
                        className={inputCls}
                      />
                    </label>
                    <label className="block">
                      <span className={labelCls}>Button label</span>
                      <input
                        value={card.linkLabel ?? ""}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            productsCards: prev.productsCards.map((item, i) =>
                              i === index ? { ...item, linkLabel: e.target.value } : item
                            ),
                          }))
                        }
                        placeholder="Learn more"
                        className={inputCls}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className={labelCls}>Link target</span>
                    <input
                      value={card.href ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          productsCards: prev.productsCards.map((item, i) =>
                            i === index ? { ...item, href: e.target.value } : item
                          ),
                        }))
                      }
                      placeholder="#contact, /path, or https://…"
                      className={inputCls}
                    />
                  </label>

                  <label className="block">
                    <span className={labelCls}>Short description</span>
                    <textarea
                      rows={4}
                      value={card.description ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          productsCards: prev.productsCards.map((item, i) =>
                            i === index ? { ...item, description: e.target.value } : item
                          ),
                        }))
                      }
                      placeholder="Visible on the card"
                      className={textareaCls}
                    />
                  </label>

                  <div>
                    <span className={labelCls}>Learn more modal</span>
                    <p className="mb-2 text-xs leading-relaxed text-foreground/48">
                      Long copy for the popup—blank line between paragraphs.
                    </p>
                    <textarea
                      rows={8}
                      value={card.learnMore ?? ""}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          productsCards: prev.productsCards.map((item, i) =>
                            i === index ? { ...item, learnMore: e.target.value } : item
                          ),
                        }))
                      }
                      placeholder="Extended detail…"
                      spellCheck={false}
                      className={cn(
                        "w-full min-h-[10rem] resize-y rounded-2xl border border-emerald-500/15 bg-[#0a1218] px-4 py-3 font-mono text-[12px] leading-relaxed text-emerald-50/95 outline-none ring-1 ring-white/[0.06]",
                        "placeholder:text-emerald-950/45 focus:border-emerald-500/35 focus:ring-2 focus:ring-emerald-500/12",
                        "dark:bg-[#070d12]"
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
