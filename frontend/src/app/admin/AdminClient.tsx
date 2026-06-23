"use client";

import { useEffect, startTransition, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Home,
  LayoutDashboard,
  LayoutTemplate,
  ClipboardList,
  Inbox,
  Shield,
  Sparkles,
  Wrench,
  Package,
  BriefcaseBusiness,
  Handshake,
  Library,
  ListChecks,
  MessageSquareQuote,
  Users,
  Layers,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminTopBar from "@/app/admin/components/AdminTopBar";
import AdminSectionContent from "@/app/admin/components/AdminSectionContent";
import { AdminClientProps, AdminNavItem, AdminPermission } from "@/app/admin/types";

function canAccess(viewerRole: "owner" | "messages", viewerPermissions: AdminPermission[], permission: AdminPermission) {
  if (viewerRole === "owner") return true;
  return viewerPermissions.includes("*") || viewerPermissions.includes(permission);
}

export default function AdminClient({
  initialContent,
  initialLeads,
  initialTestimonialSubmissions,
  aiStatus,
  analytics,
  initialSection,
  viewerRole,
  viewerPermissions,
}: AdminClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [draft, setDraft] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const activeSection = initialSection;

  const navItems: AdminNavItem[] = useMemo(() => {
    const full: AdminNavItem[] = [
      { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin" },
      { id: "hero", label: "Hero", icon: Home, href: "/admin/hero" },
      { id: "ecosystem", label: "Ecosystem", icon: Layers, href: "/admin/ecosystem" },
      { id: "systems", label: "Systems", icon: Sparkles, href: "/admin/systems" },
      { id: "explore", label: "Explore dialog", icon: LayoutTemplate, href: "/admin/explore" },
      { id: "services", label: "Services", icon: Wrench, href: "/admin/services" },
      { id: "products", label: "Products", icon: Package, href: "/admin/products" },
      { id: "caseStudies", label: "Portfolio", icon: BriefcaseBusiness, href: "/admin/case-studies" },
      { id: "publications", label: "Blog / Insights", icon: Library, href: "/admin/publications" },
      { id: "about", label: "About Yafet", icon: User, href: "/admin/about" },
      { id: "trust", label: "Trust", icon: Handshake, href: "/admin/trust" },
      { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote, href: "/admin/testimonials" },
      { id: "processFaq", label: "Process & FAQ", icon: ListChecks, href: "/admin/process-faq" },
      { id: "contact", label: "Contact & Assistant", icon: Bot, href: "/admin/contact" },
      { id: "team", label: "Team", icon: Users, href: "/admin/team" },
      { id: "leads", label: "Messages", icon: Inbox, href: "/admin/leads" },
      { id: "consultations", label: "AI Consultations", icon: ClipboardList, href: "/admin/consultations" },
      { id: "security", label: "Security", icon: Shield, href: "/admin/security" },
      { id: "ai", label: "AI Provider", icon: Bot, href: "/admin/ai" },
    ];
    if (viewerRole === "owner") return full;
    return full.filter((item) => {
      const required: Partial<Record<typeof item.id, AdminPermission>> = {
        overview: "content.view",
        hero: "content.view",
        ecosystem: "content.view",
        systems: "content.view",
        explore: "content.view",
        services: "content.view",
        products: "content.view",
        caseStudies: "content.view",
        publications: "content.view",
        about: "content.view",
        trust: "content.view",
        testimonials: "testimonials.view",
        processFaq: "content.view",
        contact: "content.view",
        team: "team.view",
        leads: "leads.view",
        consultations: "leads.view",
        security: "security.view",
        ai: "ai.view",
      };
      const permission = required[item.id];
      return permission ? canAccess(viewerRole, viewerPermissions, permission) : false;
    });
  }, [viewerPermissions, viewerRole]);

  const canSave =
    canAccess(viewerRole, viewerPermissions, "content.edit") &&
    activeSection !== "overview" &&
    activeSection !== "leads" &&
    activeSection !== "consultations" &&
    activeSection !== "security" &&
    activeSection !== "team" &&
    activeSection !== "ai";

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: draft }),
    });
    setIsSaving(false);
    if (response.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      router.refresh();
      return;
    }
    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    setSaveError(data?.error ?? "Could not save changes. Please try again.");
  };

  const handlePasswordUpdate = async () => {
    setPasswordStatus("");
    setIsChangingPassword(true);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = (await response.json()) as { error?: string };
    setIsChangingPassword(false);
    if (response.ok) {
      setPasswordStatus("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      return;
    }
    setPasswordStatus(data.error ?? "Could not update password.");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  useEffect(() => {
    startTransition(() => {
      setMobileNavOpen(false);
    });
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileNavOpen]);

  return (
    <main
      className={cn(
        "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
        "bg-gradient-to-b from-background via-background to-muted/15"
      )}
    >
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex min-h-0 w-full flex-1 items-stretch overflow-hidden">
        <AdminSidebar
          navItems={navItems}
          activeSection={activeSection}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
          onLogout={handleLogout}
        />

        <section
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col border-l border-border/40",
            "pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]",
            "px-4 sm:px-5 md:px-7 lg:px-8"
          )}
        >
          <div className="mx-auto flex min-h-0 w-full min-w-0 max-w-6xl flex-1 flex-col">
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-8",
                "[-webkit-overflow-scrolling:touch]"
              )}
            >
              <AdminTopBar
                activeSection={activeSection}
                navItems={navItems}
                canSave={canSave}
                isSaving={isSaving}
                onSave={handleSave}
                onOpenMobileNav={() => setMobileNavOpen(true)}
              />

              {(saved || saveError) && (
                <div
                  className={cn(
                    "mb-5 rounded-xl border px-4 py-3 text-sm",
                    saved && "border-emerald-500/30 bg-emerald-500/[0.06]",
                    saveError && "border-red-500/30 bg-red-500/[0.06]"
                  )}
                  role="status"
                >
                  {saved && (
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium">Saved successfully.</p>
                  )}
                  {saveError && <p className="text-red-700 dark:text-red-400 font-medium">{saveError}</p>}
                </div>
              )}

              <AdminSectionContent
                activeSection={activeSection}
                draft={draft}
                setDraft={setDraft}
                initialLeads={initialLeads}
                initialTestimonialSubmissions={initialTestimonialSubmissions}
                analytics={analytics}
                aiStatus={aiStatus}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                passwordStatus={passwordStatus}
                isChangingPassword={isChangingPassword}
                onUpdatePassword={handlePasswordUpdate}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
