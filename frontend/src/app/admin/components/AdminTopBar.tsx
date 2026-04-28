"use client";

import { LogOut, Menu, PanelLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminNavItem, AdminSection } from "@/app/admin/types";

export default function AdminTopBar({
  activeSection,
  navItems,
  isSaving,
  onSave,
  onLogout,
  onOpenMobileNav,
}: {
  activeSection: AdminSection;
  navItems: AdminNavItem[];
  isSaving: boolean;
  onSave: () => void;
  onLogout: () => void;
  onOpenMobileNav: () => void;
}) {
  const label = navItems.find((item) => item.id === activeSection)?.label ?? "Admin";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 -mx-4 mb-6 border-b border-border/50 bg-background/85 px-4 py-4 backdrop-blur-md sm:-mx-5 sm:mb-8 sm:px-0 md:-mx-7 lg:-mx-8 lg:px-4",
        "supports-[backdrop-filter]:bg-background/70"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-foreground/[0.04] active:scale-[0.98] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="hidden items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-foreground/40 sm:flex">
              <PanelLeft className="size-3.5" />
              Section
            </div>
            <h2 className="text-xl font-display font-bold tracking-tight sm:text-2xl md:text-3xl">
              <span className="line-clamp-2">{label}</span>
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-foreground/55 sm:text-[0.925rem]">
              Manage your landing experience. Changes apply after you save.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-0 sm:flex-row sm:items-center sm:justify-end sm:gap-2 sm:pl-2">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60 sm:w-auto"
          >
            <Save className="size-4 shrink-0" />
            {isSaving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium transition hover:bg-foreground/[0.04] sm:w-auto"
          >
            <LogOut className="size-4 shrink-0" />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
