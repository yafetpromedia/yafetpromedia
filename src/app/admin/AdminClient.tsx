"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Home,
  LayoutDashboard,
  LayoutTemplate,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminTopBar from "@/app/admin/components/AdminTopBar";
import AdminSectionContent from "@/app/admin/components/AdminSectionContent";
import { AdminClientProps, AdminNavItem } from "@/app/admin/types";

export default function AdminClient({
  initialContent,
  initialLeads,
  initialTestimonialSubmissions,
  aiStatus,
  initialSection,
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

  const navItems: AdminNavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/admin" },
    { id: "hero", label: "Hero", icon: Home, href: "/admin/hero" },
    { id: "systems", label: "Systems", icon: Sparkles, href: "/admin/systems" },
    { id: "explore", label: "Explore dialog", icon: LayoutTemplate, href: "/admin/explore" },
    { id: "services", label: "Services", icon: Wrench, href: "/admin/services" },
    { id: "products", label: "Products", icon: Package, href: "/admin/products" },
    { id: "caseStudies", label: "Case Studies", icon: BriefcaseBusiness, href: "/admin/case-studies" },
    { id: "publications", label: "Publications", icon: Library, href: "/admin/publications" },
    { id: "trust", label: "Trust", icon: Handshake, href: "/admin/trust" },
    { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote, href: "/admin/testimonials" },
    { id: "processFaq", label: "Process & FAQ", icon: ListChecks, href: "/admin/process-faq" },
    { id: "contact", label: "Contact & Assistant", icon: Bot, href: "/admin/contact" },
    { id: "leads", label: "Messages", icon: Inbox, href: "/admin/leads" },
    { id: "security", label: "Security", icon: Shield, href: "/admin/security" },
    { id: "ai", label: "AI Provider", icon: Bot, href: "/admin/ai" },
  ];

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
    setMobileNavOpen(false);
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
        "min-h-dvh flex flex-col",
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

      <div className="flex min-h-0 w-full flex-1 min-h-dvh lg:min-h-screen">
        <AdminSidebar
          navItems={navItems}
          activeSection={activeSection}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        <section
          className={cn(
            "flex-1 min-w-0 flex flex-col border-l border-border/40",
            "overflow-y-auto overflow-x-hidden",
            "pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2",
            "px-4 sm:px-5 md:px-7 lg:px-8"
          )}
        >
          <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col min-h-0">
            <AdminTopBar
              activeSection={activeSection}
              navItems={navItems}
              isSaving={isSaving}
              onSave={handleSave}
              onLogout={handleLogout}
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

            <div className="flex-1 min-h-0 pb-8">
              <AdminSectionContent
                activeSection={activeSection}
                draft={draft}
                setDraft={setDraft}
                initialLeads={initialLeads}
                initialTestimonialSubmissions={initialTestimonialSubmissions}
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
