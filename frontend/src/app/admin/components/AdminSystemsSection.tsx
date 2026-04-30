"use client";

/* eslint-disable @next/next/no-img-element -- admin arbitrary image URLs */

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  ImageIcon,
  ImageOff,
  LayoutGrid,
  Sparkles,
  TextCursorInput,
} from "lucide-react";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { SiteContent } from "@/lib/site-content.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { cn } from "@/lib/utils";

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/48";

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/38 focus:border-primary/55 focus:ring-2 focus:ring-primary/15",
  "dark:border-white/[0.09] dark:bg-white/[0.04]"
);

const textareaCls = cn(inputCls, "min-h-[96px] resize-y py-3 leading-relaxed");

export default function AdminSystemsSection({
  draft,
  setDraft,
}: {
  draft: SiteContent;
  setDraft: Dispatch<SetStateAction<SiteContent>>;
}) {
  const [tileFilter, setTileFilter] = useState("");
  const filteredTiles = useMemo(() => {
    const indexed = draft.systemsCards.map((card, index) => ({ card, index }));
    if (!tileFilter.trim()) return indexed;
    return indexed.filter(({ card }) =>
      matchesAdminFilter(tileFilter, card.title, card.tag, card.description, card.imageSrc)
    );
  }, [draft.systemsCards, tileFilter]);

  return (
    <div className="space-y-10 pb-4">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-primary/[0.08] via-card/90 to-card/80 p-6 shadow-[0_24px_70px_-40px_rgba(255,106,0,0.35)] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-28 size-[280px] rounded-full bg-primary/[0.12] blur-[90px]" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/90">
                Homepage · Systems
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">Section header</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Controls the tagline, title, description, and &quot;Explore&quot; CTA label above the four system tiles on the
                landing page.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.08] bg-background/60 px-4 py-2 font-mono text-[11px] text-foreground/55 backdrop-blur-sm">
            <LayoutGrid className="size-4 text-primary/80" />
            {draft.systemsCards.length} tiles
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/[0.06] bg-card/60 p-6 shadow-sm backdrop-blur-sm sm:p-8 dark:bg-card/40">
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <TextCursorInput className="size-4 text-primary/80" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Copy</h4>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <label className="block">
            <span className={labelCls}>Section tag</span>
            <input
              value={draft.systemsSectionTag}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, systemsSectionTag: event.target.value }))
              }
              className={inputCls}
              placeholder="e.g. SYSTEMS"
            />
          </label>
          <label className="block">
            <span className={labelCls}>Section title</span>
            <input
              value={draft.systemsSectionTitle}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, systemsSectionTitle: event.target.value }))
              }
              className={inputCls}
              placeholder="Main heading"
            />
          </label>
        </div>
        <label className="mt-6 block">
          <span className={labelCls}>Description</span>
          <textarea
            rows={4}
            value={draft.systemsSectionDescription}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, systemsSectionDescription: event.target.value }))
            }
            className={textareaCls}
            placeholder="Supporting paragraph under the title."
          />
        </label>
        <label className="mt-6 block max-w-xl">
          <span className={labelCls}>Explore CTA label</span>
          <input
            value={draft.systemsExploreCtaLabel}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, systemsExploreCtaLabel: event.target.value }))
            }
            className={inputCls}
            placeholder="Button text opening the architecture dialog"
          />
        </label>
      </div>

      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/45">
              Tiles
            </p>
            <h4 className="font-display text-lg font-bold tracking-tight text-foreground">System cards</h4>
            <p className="mt-1 max-w-lg text-sm text-foreground/52">
              Four grid cells — image, tag chip, title, and short description each.
            </p>
          </div>
        </div>

        <AdminListFilter
          id="admin-systems-tile-filter"
          value={tileFilter}
          onChange={setTileFilter}
          placeholder="Filter tiles by title, tag, description…"
          resultHint={
            tileFilter.trim()
              ? `${filteredTiles.length} of ${draft.systemsCards.length} shown`
              : undefined
          }
          className="mb-6"
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {filteredTiles.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border/70 bg-muted/15 px-4 py-10 text-center text-sm text-foreground/55 dark:bg-white/[0.02]">
              No tiles match this filter.
            </p>
          ) : null}
          {filteredTiles.map(({ card, index }) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-card/95 to-card/70 p-5 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.65)] ring-1 ring-black/[0.04] transition hover:border-primary/20 dark:from-card/[0.92] dark:to-card/55 dark:shadow-[0_24px_72px_-36px_rgba(0,0,0,0.85)] sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/45 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/12 font-mono text-sm font-bold tabular-nums text-primary ring-1 ring-primary/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{card.title || `Card ${index + 1}`}</p>
                    <p className="truncate font-mono text-[11px] text-foreground/40">{card.tag || "Tag"}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                <div className="shrink-0 md:w-[148px]">
                  <span className={cn(labelCls, "mb-2")}>Preview</span>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-background/80 ring-1 ring-black/[0.05] dark:bg-white/[0.03]">
                    {card.imageSrc ? (
                      <img src={card.imageSrc} alt="" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-2 p-3 text-center">
                        <ImageIcon className="size-8 text-foreground/22" />
                        <span className="text-[11px] font-medium text-foreground/38">No image</span>
                      </div>
                    )}
                  </div>
                  <label className="mt-3 block">
                    <span className="sr-only">Image URL</span>
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
                      className={cn(inputCls, "text-sm")}
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                      className="min-w-0 flex-1 text-[11px] text-foreground/65 file:mr-2 file:rounded-lg file:border file:border-border file:bg-background file:px-2 file:py-1.5 file:text-xs file:font-medium"
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
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border/80 px-3 text-xs font-semibold text-foreground/75 transition hover:border-red-500/45 hover:bg-red-500/[0.08] hover:text-red-600 dark:hover:text-red-400"
                      >
                        <ImageOff className="size-3.5" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <label className="block">
                    <span className={labelCls}>Title</span>
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
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Tag</span>
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
                      placeholder="Short label / category"
                      className={inputCls}
                    />
                  </label>
                  <label className="block">
                    <span className={labelCls}>Description</span>
                    <textarea
                      rows={4}
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
                      className={textareaCls}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
