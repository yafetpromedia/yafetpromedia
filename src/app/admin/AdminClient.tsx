"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Home, LayoutDashboard, Shield, Sparkles, Users, Wrench, Package, BriefcaseBusiness, Handshake, ListChecks } from "lucide-react";
import AdminSidebar from "@/app/admin/components/AdminSidebar";
import AdminTopBar from "@/app/admin/components/AdminTopBar";
import AdminSectionContent from "@/app/admin/components/AdminSectionContent";
import { AdminClientProps, AdminNavItem } from "@/app/admin/types";

export default function AdminClient({
  initialContent,
  initialLeads,
  aiStatus,
  initialSection,
}: AdminClientProps) {
  const router = useRouter();
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
    { id: "services", label: "Services", icon: Wrench, href: "/admin/services" },
    { id: "products", label: "Products", icon: Package, href: "/admin/products" },
    { id: "caseStudies", label: "Case Studies", icon: BriefcaseBusiness, href: "/admin/case-studies" },
    { id: "trust", label: "Trust", icon: Handshake, href: "/admin/trust" },
    { id: "processFaq", label: "Process & FAQ", icon: ListChecks, href: "/admin/process-faq" },
    { id: "contact", label: "Contact & Assistant", icon: Bot, href: "/admin/contact" },
    { id: "leads", label: "Leads", icon: Users, href: "/admin/leads" },
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

  return (
    <main className="h-screen bg-background overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-screen">
        <AdminSidebar navItems={navItems} activeSection={activeSection} />

        <section className="px-5 py-6 md:px-8 md:py-8 border-l border-border/50 overflow-y-auto">
          <AdminTopBar
            activeSection={activeSection}
            navItems={navItems}
            isSaving={isSaving}
            onSave={handleSave}
            onLogout={handleLogout}
          />

          {(saved || saveError) && (
            <div className="mb-6">
              {saved && <p className="text-sm text-green-500">Saved successfully.</p>}
              {saveError && <p className="text-sm text-red-500">{saveError}</p>}
            </div>
          )}

          <AdminSectionContent
            activeSection={activeSection}
            draft={draft}
            setDraft={setDraft}
            initialLeads={initialLeads}
            aiStatus={aiStatus}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            passwordStatus={passwordStatus}
            isChangingPassword={isChangingPassword}
            onUpdatePassword={handlePasswordUpdate}
          />
        </section>
      </div>
    </main>
  );
}
