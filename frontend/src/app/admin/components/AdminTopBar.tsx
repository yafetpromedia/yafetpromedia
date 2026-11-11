"use client";

import { Menu, PanelLeft, Save } from "lucide-react";
import { AdminNavItem, AdminSection } from "@/app/admin/types";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function AdminTopBar({
  activeSection,
  navItems,
  canSave,
  isSaving,
  sidebarCollapsed,
  onSave,
  onOpenMobileNav,
  onToggleSidebar,
}: {
  activeSection: AdminSection;
  navItems: AdminNavItem[];
  canSave: boolean;
  isSaving: boolean;
  sidebarCollapsed?: boolean;
  onSave: () => void;
  onOpenMobileNav: () => void;
  onToggleSidebar: () => void;
}) {
  const label = navItems.find((item) => item.id === activeSection)?.label ?? "Admin";

  return (
    <header className="sticky top-0 z-40 mb-6 w-full min-w-0 border-b border-border/60 bg-background/90 py-4 backdrop-blur-md sm:mb-8">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted active:scale-[0.98] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mt-0.5 hidden size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition hover:bg-muted hover:text-foreground active:scale-[0.98] lg:flex"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={sidebarCollapsed}
          >
            <PanelLeft className="size-5" />
          </button>
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="hidden items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-accent sm:flex">
              Section
            </div>
            <h2 className="break-words font-display text-xl font-semibold tracking-tight sm:text-2xl md:text-[1.75rem]">
              <span className="line-clamp-3 sm:line-clamp-2">{label}</span>
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-foreground/55">
              {activeSection === "overview"
                ? "Analytics and activity at a glance."
                : activeSection === "team"
                  ? "Add collaborators and delegate inbox access."
                  : "Manage your landing experience. Changes apply after you save."}
            </p>
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:max-w-full sm:flex-row sm:items-center sm:justify-end sm:gap-2">
          <ThemeToggle className="size-11 rounded-full border-border bg-card text-foreground/65 hover:bg-muted" />
          {canSave ? (
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="inline-flex h-11 w-full min-w-0 max-w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 sm:w-auto sm:min-w-[11rem]"
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
