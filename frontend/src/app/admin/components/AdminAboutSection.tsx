"use client";

import { Dispatch, SetStateAction } from "react";
import { Plus, Trash2, User } from "lucide-react";
import Image from "next/image";
import type { SiteContent } from "@/lib/site-content.shared";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { cn } from "@/lib/utils";

type Props = { draft: SiteContent; setDraft: Dispatch<SetStateAction<SiteContent>> };

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "focus:border-primary/55 focus:ring-2 focus:ring-primary/15"
);

export default function AdminAboutSection({ draft, setDraft }: Props) {
  const about = draft.aboutYafet;

  const patch = (patch: Partial<typeof about>) =>
    setDraft((p) => ({ ...p, aboutYafet: { ...p.aboutYafet, ...patch } }));

  const uploadHero = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "about");
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) return;
    const data = (await res.json()) as { url?: string };
    if (data.url) patch({ heroImageSrc: data.url });
  };

  return (
    <div className="max-w-5xl space-y-8 pb-6">
      <div className="rounded-3xl border border-border/70 bg-card/60 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <User className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-xl font-bold">Founder page — /about/yafet</h3>
            <p className="text-sm text-foreground/55">Journey, mission, vision, and achievements. Leave hero image empty to use your site logo.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <input className={inputCls} placeholder="Page title" value={about.pageTitle} onChange={(e) => patch({ pageTitle: e.target.value })} />
          <input className={inputCls} placeholder="Subtitle" value={about.pageSubtitle} onChange={(e) => patch({ pageSubtitle: e.target.value })} />
          {about.heroImageSrc && (
            <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-2xl border">
              <Image src={about.heroImageSrc} alt="" fill className="object-cover" unoptimized={shouldUseUnoptimizedImage(about.heroImageSrc)} />
            </div>
          )}
          <label className="w-fit cursor-pointer rounded-xl border border-dashed px-4 py-2 text-sm">Upload hero image
            <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadHero(f); }} />
          </label>
          {(
            [
              ["journey", "Journey (blank lines = paragraphs)"],
              ["mission", "Mission"],
              ["vision", "Vision for African software"],
              ["projectsHighlight", "Projects & ecosystem highlight"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">{label}</span>
              <textarea className={cn(inputCls, "min-h-[120px] resize-y")} value={about[key]} onChange={(e) => patch({ [key]: e.target.value })} />
            </label>
          ))}

          <div>
            <span className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-foreground/45">Achievements</span>
            <div className="space-y-2">
              {about.achievements.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input className={inputCls} value={item} onChange={(e) => {
                    const next = [...about.achievements];
                    next[i] = e.target.value;
                    patch({ achievements: next });
                  }} />
                  <button type="button" className="shrink-0 rounded-xl border border-red-500/30 px-3 text-red-600" onClick={() =>
                    patch({ achievements: about.achievements.filter((_, j) => j !== i) })
                  }><Trash2 className="size-4" /></button>
                </div>
              ))}
              <button type="button" className="inline-flex items-center gap-2 text-sm font-semibold text-primary" onClick={() =>
                patch({ achievements: [...about.achievements, "New achievement"] })
              }><Plus className="size-4" /> Add achievement</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
