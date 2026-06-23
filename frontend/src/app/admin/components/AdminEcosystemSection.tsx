"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Building2, Layers, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import AdminListFilter from "@/app/admin/components/AdminListFilter";
import type { EcosystemProductCard, SiteContent } from "@/lib/site-content.shared";
import { matchesAdminFilter } from "@/lib/admin-filter";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
);

function emptyCard(): EcosystemProductCard {
  return {
    title: "New product",
    tagline: "Product tagline",
    description: "",
    imageSrc: "",
    href: "#contact",
    linkLabel: "Learn more",
    status: "planned",
    featured: false,
  };
}

export default function AdminEcosystemSection({ draft, setDraft }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const indexed = draft.ecosystemCards.map((card, index) => ({ card, index }));
    if (!filter.trim()) return indexed;
    return indexed.filter(({ card }) =>
      matchesAdminFilter(filter, card.title, card.tagline, card.description, card.status)
    );
  }, [draft.ecosystemCards, filter]);

  const patch = (index: number, patch: Partial<EcosystemProductCard>) =>
    setDraft((prev) => ({
      ...prev,
      ecosystemCards: prev.ecosystemCards.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }));

  const uploadImage = async (index: number, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "ecosystem");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) return;
    const data = (await res.json()) as { url?: string };
    if (data.url) patch(index, { imageSrc: data.url });
  };

  return (
    <div className="max-w-5xl space-y-8 pb-6">
      <div className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Layers className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold">Ecosystem hierarchy</h3>
            <p className="text-sm text-foreground/55">YafetPromedia parent company → product cards on homepage</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["ecosystemSectionTag", "Section tag"],
              ["ecosystemSectionTitle", "Section title"],
              ["ecosystemParentLabel", "Parent label"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block sm:col-span-2">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
                {label}
              </span>
              <input
                className={inputCls}
                value={draft[key]}
                onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))}
              />
            </label>
          ))}
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">
              Description
            </span>
            <textarea
              className={cn(inputCls, "min-h-[100px] resize-y")}
              value={draft.ecosystemSectionDescription}
              onChange={(e) => setDraft((p) => ({ ...p, ecosystemSectionDescription: e.target.value }))}
            />
          </label>
        </div>
      </div>

      <AdminListFilter value={filter} onChange={setFilter} placeholder="Filter products…" />

      <div className="space-y-4">
        {filtered.map(({ card, index }) => (
          <div key={index} className="rounded-2xl border border-border/80 bg-card/50 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span className="font-semibold">{card.title}</span>
                {card.featured && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <button type="button" className="rounded-lg border px-2 py-1 text-xs" onClick={() => patch(index, { featured: !card.featured })}>
                  {card.featured ? "Unfeature" : "Feature"}
                </button>
                <button type="button" className="rounded-lg border px-2 py-1" disabled={index === 0} onClick={() => {
                  setDraft((p) => {
                    const next = [...p.ecosystemCards];
                    [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
                    return { ...p, ecosystemCards: next };
                  });
                }}><ArrowUp className="size-4" /></button>
                <button type="button" className="rounded-lg border px-2 py-1" disabled={index >= draft.ecosystemCards.length - 1} onClick={() => {
                  setDraft((p) => {
                    const next = [...p.ecosystemCards];
                    [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
                    return { ...p, ecosystemCards: next };
                  });
                }}><ArrowDown className="size-4" /></button>
                <button type="button" className="rounded-lg border border-red-500/30 px-2 py-1 text-red-600" onClick={() =>
                  setDraft((p) => ({ ...p, ecosystemCards: p.ecosystemCards.filter((_, i) => i !== index) }))
                }><Trash2 className="size-4" /></button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className={inputCls} placeholder="Title" value={card.title} onChange={(e) => patch(index, { title: e.target.value })} />
              <input className={inputCls} placeholder="Tagline" value={card.tagline} onChange={(e) => patch(index, { tagline: e.target.value })} />
              <select className={inputCls} value={card.status} onChange={(e) => patch(index, { status: e.target.value as EcosystemProductCard["status"] })}>
                <option value="live">Live</option>
                <option value="building">Building</option>
                <option value="planned">Planned</option>
              </select>
              <input className={inputCls} placeholder="Link label" value={card.linkLabel} onChange={(e) => patch(index, { linkLabel: e.target.value })} />
              <input className={cn(inputCls, "sm:col-span-2")} placeholder="Href (#products, /blog, https://…)" value={card.href} onChange={(e) => patch(index, { href: e.target.value })} />
              <textarea className={cn(inputCls, "sm:col-span-2 min-h-[80px]")} placeholder="Description" value={card.description} onChange={(e) => patch(index, { description: e.target.value })} />
              <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                {card.imageSrc && (
                  <div className="relative size-16 overflow-hidden rounded-xl border">
                    <Image src={card.imageSrc} alt="" fill className="object-cover" unoptimized={shouldUseUnoptimizedImage(card.imageSrc)} />
                  </div>
                )}
                <label className="cursor-pointer rounded-xl border border-dashed px-4 py-2 text-sm hover:border-primary/50">
                  Upload image
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void uploadImage(index, f);
                  }} />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {draft.ecosystemCards.length < 12 && (
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary"
          onClick={() => setDraft((p) => ({ ...p, ecosystemCards: [...p.ecosystemCards, emptyCard()] }))}
        >
          <Plus className="size-4" /> Add product
        </button>
      )}
    </div>
  );
}
