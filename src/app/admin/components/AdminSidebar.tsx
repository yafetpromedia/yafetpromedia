"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AdminNavItem, AdminSection } from "@/app/admin/types";

export default function AdminSidebar({
  navItems,
  activeSection,
}: {
  navItems: AdminNavItem[];
  activeSection: AdminSection;
}) {
  return (
    <aside className="border-r border-border bg-card/30 p-5 md:p-6 h-full lg:sticky lg:top-0 overflow-y-auto flex flex-col">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.25em] text-foreground/45">Admin Console</p>
        <h1 className="mt-2 text-2xl font-display font-bold">Website Dashboard</h1>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full h-11 px-3 rounded-xl flex items-center justify-between transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-transparent hover:bg-foreground/5 text-foreground/75"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="size-4" />
                {item.label}
              </span>
              <ChevronRight className={`size-4 ${isActive ? "opacity-100" : "opacity-40"}`} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-border space-y-2 text-sm">
        <Link href="/" className="block text-foreground/65 hover:text-foreground">
          View website
        </Link>
        <Link href="/#contact" className="block text-foreground/65 hover:text-foreground">
          Contact section
        </Link>
      </div>
    </aside>
  );
}
