"use client";

import Link from "next/link";
import { ChevronRight, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminNavItem, AdminSection } from "@/app/admin/types";

export default function AdminSidebar({
  navItems,
  activeSection,
  mobileOpen,
  onCloseMobile,
  onLogout,
}: {
  navItems: AdminNavItem[];
  activeSection: AdminSection;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex min-h-0 w-[min(20rem,calc(100vw-1rem))] shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card/50 backdrop-blur-sm sm:w-72",
        "fixed inset-y-0 left-0 z-50 max-h-dvh transform transition-transform duration-300 ease-out shadow-2xl",
        "lg:relative lg:h-full lg:max-h-[100dvh] lg:min-h-0 lg:self-stretch lg:translate-x-0 lg:shadow-none",
        "pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-card/50 px-4 py-4 lg:px-5 lg:py-6 lg:border-0">
        <div className="min-w-0 flex-1 lg:mb-0 lg:block">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/45">Admin</p>
          <h1 className="mt-1 truncate text-lg font-display font-bold tracking-tight sm:text-xl lg:text-2xl">
            Website Dashboard
          </h1>
        </div>
        <button
          type="button"
          className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background/80 text-foreground/80 transition hover:bg-foreground/5 lg:hidden"
          onClick={onCloseMobile}
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav
        className="min-h-0 flex-[1_1_0%] space-y-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-3 py-3 [-webkit-overflow-scrolling:touch] lg:px-4 lg:py-2"
        aria-label="Admin sections"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onCloseMobile()}
              className={cn(
                "flex min-h-[2.75rem] w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-foreground/80 hover:bg-foreground/[0.06] active:bg-foreground/10"
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold">
                <Icon className="size-4 shrink-0 opacity-90" />
                <span className="truncate">{item.label}</span>
              </span>
              <ChevronRight
                className={cn("size-4 shrink-0 transition-opacity", isActive ? "opacity-100" : "opacity-35")}
              />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 space-y-2 border-t border-border/60 bg-card/50 px-4 py-4 text-sm lg:px-5">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background/80 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/[0.05]"
        >
          <LogOut className="size-4 shrink-0" />
          Log out
        </button>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg py-2 text-foreground/65 transition hover:text-foreground"
        >
          View website
        </Link>
      </div>
    </aside>
  );
}
