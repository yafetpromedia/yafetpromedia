"use client";

import Link from "next/link";
import { ChevronRight, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminNavItem, AdminSection } from "@/app/admin/types";

export default function AdminSidebar({
  navItems,
  activeSection,
  mobileOpen,
  collapsed,
  onCloseMobile,
  onLogout,
}: {
  navItems: AdminNavItem[];
  activeSection: AdminSection;
  mobileOpen: boolean;
  collapsed?: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}) {
  return (
    <aside
      className={cn(
        "flex min-h-0 shrink-0 flex-col overflow-hidden border-r border-border/60 bg-card/50 backdrop-blur-sm",
        "fixed inset-y-0 left-0 z-50 max-h-dvh transform shadow-2xl transition-[transform,width] duration-300 ease-out",
        "lg:sticky lg:top-0 lg:h-dvh lg:max-h-dvh lg:translate-x-0 lg:shadow-none",
        "pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]",
        collapsed
          ? "w-[min(20rem,calc(100vw-1rem))] lg:w-[4.5rem]"
          : "w-[min(20rem,calc(100vw-1rem))] sm:w-72",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-card/50 py-4 lg:border-0",
          collapsed ? "px-2 lg:justify-center lg:px-2" : "px-4 lg:px-5 lg:py-6"
        )}
      >
        <div className={cn("min-w-0 flex-1 lg:mb-0 lg:block", collapsed && "lg:hidden")}>
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/45">Admin</p>
          <h1 className="mt-1 truncate text-lg font-display font-bold tracking-tight sm:text-xl lg:text-2xl">
            Website Dashboard
          </h1>
        </div>
        {collapsed ? (
          <p
            className="hidden text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/45 lg:block"
            title="Website Dashboard"
          >
            AD
          </p>
        ) : null}
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
        className={cn(
          "min-h-0 flex-[1_1_0%] space-y-1 overflow-y-auto overflow-x-hidden overscroll-y-contain py-3 [-webkit-overflow-scrolling:touch] lg:py-2",
          collapsed ? "px-2" : "px-3 lg:px-4"
        )}
        aria-label="Admin sections"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              title={collapsed ? item.label : undefined}
              onClick={() => onCloseMobile()}
              className={cn(
                "flex min-h-[2.75rem] w-full items-center rounded-xl py-2.5 text-left transition-colors",
                collapsed ? "justify-center px-2" : "justify-between gap-2 px-3",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-foreground/80 hover:bg-foreground/[0.06] active:bg-foreground/10"
              )}
            >
              <span
                className={cn(
                  "flex min-w-0 items-center text-sm font-semibold",
                  collapsed ? "justify-center" : "gap-2.5"
                )}
              >
                <Icon className="size-4 shrink-0 opacity-90" />
                <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
              </span>
              <ChevronRight
                className={cn(
                  "size-4 shrink-0 transition-opacity",
                  isActive ? "opacity-100" : "opacity-35",
                  collapsed && "lg:hidden"
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "mt-auto shrink-0 space-y-2 border-t border-border/60 bg-card/50 py-4 text-sm",
          collapsed ? "px-2" : "px-4 lg:px-5"
        )}
      >
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "Log out" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl border border-border bg-background/80 py-2.5 text-sm font-medium text-foreground transition hover:bg-foreground/[0.05]",
            collapsed ? "justify-center px-2" : "justify-center gap-2"
          )}
        >
          <LogOut className="size-4 shrink-0" />
          <span className={cn(collapsed && "lg:hidden")}>Log out</span>
        </button>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? "View website" : undefined}
          className={cn(
            "block rounded-lg py-2 text-foreground/65 transition hover:text-foreground",
            collapsed ? "text-center text-xs lg:px-0" : ""
          )}
        >
          <span className={cn(collapsed && "lg:sr-only")}>View website</span>
          {collapsed ? <span className="hidden lg:inline" aria-hidden>↗</span> : null}
        </Link>
      </div>
    </aside>
  );
}
