"use client";

import { Menu, PanelLeft, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminNavItem, AdminSection } from "@/app/admin/types";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AdminTopBar({
  activeSection,
  navItems,
  canSave,
  isSaving,
  onSave,
  onOpenMobileNav,
}: {
  activeSection: AdminSection;
  navItems: AdminNavItem[];
  canSave: boolean;
  isSaving: boolean;
  onSave: () => void;
  onOpenMobileNav: () => void;
}) {
  const label = navItems.find((item) => item.id === activeSection)?.label ?? "Admin";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 mb-6 w-full min-w-0 border-b border-border/60 bg-background/95 py-4 backdrop-blur-md shadow-[0_1px_0_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)] sm:mb-8",
        "supports-[backdrop-filter]:bg-background/85"
      )}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm transition hover:bg-foreground/[0.04] active:scale-[0.98] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="hidden items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-foreground/40 sm:flex">
              <PanelLeft className="size-3.5 shrink-0" />
              Section
            </div>
            <h2 className="break-words text-xl font-display font-bold tracking-tight sm:text-2xl md:text-3xl">
              <span className="line-clamp-3 sm:line-clamp-2">{label}</span>
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-foreground/55 sm:text-[0.925rem]">
              {activeSection === "overview"
                ? "Analytics and activity at a glance."
                : activeSection === "team"
                  ? "Add collaborators and delegate inbox access."
                  : "Manage your landing experience. Changes apply after you save."}
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:max-w-full sm:flex-row sm:items-center sm:justify-end sm:gap-2">
          <ThemeToggle className="size-11 rounded-xl border-border bg-card text-foreground/65 hover:bg-foreground/[0.04] dark:hover:border-primary/40" />
          {canSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex h-11 w-full min-w-0 max-w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60 sm:w-auto sm:min-w-[11rem]"
            >
              <Save className="size-4 shrink-0" />
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
