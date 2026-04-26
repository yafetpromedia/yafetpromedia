"use client";

import { LogOut, Save } from "lucide-react";
import { AdminNavItem, AdminSection } from "@/app/admin/types";

export default function AdminTopBar({
  activeSection,
  navItems,
  isSaving,
  onSave,
  onLogout,
}: {
  activeSection: AdminSection;
  navItems: AdminNavItem[];
  isSaving: boolean;
  onSave: () => void;
  onLogout: () => void;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl md:text-3xl font-display font-bold">
          {navItems.find((item) => item.id === activeSection)?.label}
        </h2>
        <p className="text-sm text-foreground/60 mt-1">
          Manage your landing experience with a modern structured workflow.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={onSave}
          className="h-10 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold inline-flex items-center gap-2"
        >
          <Save className="size-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={onLogout}
          className="h-10 px-4 rounded-xl border border-border inline-flex items-center gap-2"
        >
          <LogOut className="size-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
