"use client";

import { Dispatch, SetStateAction } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, WalletCards } from "lucide-react";
import type { PricingPackage, SiteContent } from "@/lib/site-content.shared";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const labelCls =
 "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48";

const inputCls = cn(
 "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
 "placeholder:text-foreground/35 focus:border-accent/45 focus:ring-2 focus:ring-accent/15",
 ""
);

const textareaCls = cn(inputCls, "min-h-[88px] resize-y py-3 leading-relaxed");

const reorderBtn = cn(
 "inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/75 bg-card text-foreground/80 transition",
 "hover:border-accent/35 hover:bg-accent/[0.08] hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
);

const sectionShell =
 "rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8 ";

function emptyPackage(): PricingPackage {
 return {
 name: "New package",
 priceLabel: "From $",
 description: "",
 features: ["Feature one"],
 ctaLabel: "Get started",
 highlighted: false,
 };
}

export default function AdminPricingSection({ draft, setDraft }: Props) {
 const packages = draft.pricingPackages ?? [];

 const move = (index: number, dir: -1 | 1) => {
 setDraft((prev) => {
 const next = [...(prev.pricingPackages ?? [])];
 const j = index + dir;
 if (j < 0 || j >= next.length) return prev;
 [next[index], next[j]] = [next[j]!, next[index]!];
 return { ...prev, pricingPackages: next };
 });
 };

 const patch = (index: number, patch: Partial<PricingPackage>) =>
 setDraft((prev) => ({
 ...prev,
 pricingPackages: (prev.pricingPackages ?? []).map((item, i) =>
 i === index ? { ...item, ...patch } : item
 ),
 }));

 return (
 <div className="max-w-5xl space-y-10 pb-6">
 <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-card via-muted/35 to-card p-6 sm:p-8">
 <div className="relative flex gap-4">
 <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
 <WalletCards className="size-6" />
 </span>
 <div>
 <h2 className="font-display text-2xl font-bold tracking-tight">Pricing packages</h2>
 <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/55">
 Homepage #pricing tiers. Highlight one package. CTAs route to contact or book-a-call.
 </p>
 </div>
 </div>
 </div>

 <section className={sectionShell}>
 <div className="grid gap-4 sm:grid-cols-2">
 <label className="block sm:col-span-1">
 <span className={labelCls}>Section tag</span>
 <input
 value={draft.pricingSectionTag}
 onChange={(e) => setDraft((p) => ({ ...p, pricingSectionTag: e.target.value }))}
 className={inputCls}
 />
 </label>
 <label className="block sm:col-span-1">
 <span className={labelCls}>Section title</span>
 <input
 value={draft.pricingSectionTitle}
 onChange={(e) => setDraft((p) => ({ ...p, pricingSectionTitle: e.target.value }))}
 className={inputCls}
 />
 </label>
 <label className="block sm:col-span-2">
 <span className={labelCls}>Description</span>
 <textarea
 value={draft.pricingSectionDescription}
 onChange={(e) => setDraft((p) => ({ ...p, pricingSectionDescription: e.target.value }))}
 className={textareaCls}
 />
 </label>
 </div>
 </section>

 <div className="flex items-center justify-between gap-3">
 <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/70">Packages</h3>
 <button
 type="button"
 disabled={packages.length >= 6}
 onClick={() =>
 setDraft((prev) => ({
 ...prev,
 pricingPackages: [...(prev.pricingPackages ?? []), emptyPackage()],
 }))
 }
 className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:border-primary/40 hover:bg-primary/[0.07] disabled:opacity-40"
 >
 <Plus className="size-3.5" /> Add package
 </button>
 </div>

 <div className="space-y-6">
 {packages.map((pkg, index) => (
 <section key={index} className={sectionShell}>
 <div className="mb-5 flex items-center justify-between gap-3">
 <p className="text-sm font-semibold text-foreground/80">
 Package {index + 1}
 {pkg.highlighted ? " · highlighted" : ""}
 </p>
 <div className="flex items-center gap-2">
 <button type="button" className={reorderBtn} disabled={index === 0} onClick={() => move(index, -1)}>
 <ArrowUp className="size-4" />
 </button>
 <button
 type="button"
 className={reorderBtn}
 disabled={index === packages.length - 1}
 onClick={() => move(index, 1)}
 >
 <ArrowDown className="size-4" />
 </button>
 <button
 type="button"
 className={cn(reorderBtn, "text-red-600 hover:border-red-500/40")}
 onClick={() =>
 setDraft((prev) => ({
 ...prev,
 pricingPackages: (prev.pricingPackages ?? []).filter((_, i) => i !== index),
 }))
 }
 >
 <Trash2 className="size-4" />
 </button>
 </div>
 </div>
 <div className="grid gap-4 sm:grid-cols-2">
 <label className="block">
 <span className={labelCls}>Name</span>
 <input value={pkg.name} onChange={(e) => patch(index, { name: e.target.value })} className={inputCls} />
 </label>
 <label className="block">
 <span className={labelCls}>Price label</span>
 <input
 value={pkg.priceLabel}
 onChange={(e) => patch(index, { priceLabel: e.target.value })}
 className={inputCls}
 />
 </label>
 <label className="block sm:col-span-2">
 <span className={labelCls}>Description</span>
 <textarea
 value={pkg.description}
 onChange={(e) => patch(index, { description: e.target.value })}
 className={textareaCls}
 />
 </label>
 <label className="block sm:col-span-2">
 <span className={labelCls}>Features (one per line)</span>
 <textarea
 value={pkg.features.join("\n")}
 onChange={(e) =>
 patch(index, {
 features: e.target.value
 .split("\n")
 .map((line) => line.trim())
 .filter(Boolean),
 })
 }
 className={textareaCls}
 />
 </label>
 <label className="block">
 <span className={labelCls}>CTA label</span>
 <input
 value={pkg.ctaLabel}
 onChange={(e) => patch(index, { ctaLabel: e.target.value })}
 className={inputCls}
 />
 </label>
 <label className="flex items-center gap-3 pt-7 text-sm text-foreground/75">
 <input
 type="checkbox"
 checked={pkg.highlighted}
 onChange={(e) => {
 const checked = e.target.checked;
 setDraft((prev) => ({
 ...prev,
 pricingPackages: (prev.pricingPackages ?? []).map((item, i) => ({
 ...item,
 highlighted: i === index ? checked : checked ? false : item.highlighted,
 })),
 }));
 }}
 className="size-4 rounded border-border"
 />
 Highlight this package
 </label>
 </div>
 </section>
 ))}
 </div>
 </div>
 );
}
