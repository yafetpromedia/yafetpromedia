"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteContent } from "@/lib/site-content.shared";

type Lead = {
  id: number;
  name: string;
  email: string;
  company: string;
  message: string;
  created_at: string;
};

export default function AdminClient({
  initialContent,
  initialLeads,
}: {
  initialContent: SiteContent;
  initialLeads: Lead[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<SiteContent>(initialContent);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  return (
    <main className="min-h-screen bg-background pt-36 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <section className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Landing Page Manager</h1>
          <p className="text-foreground/65 mb-8">
            Update your public landing page copy and key contact details from one place.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(
              [
                ["heroHeadline", "Hero Headline"],
                ["heroHighlight", "Hero Highlight"],
                ["heroTail", "Hero Tail"],
                ["heroBadge", "Hero Badge"],
                ["contactEmail", "Contact Email"],
                ["contactPhone", "Contact Phone"],
                ["aiName", "AI Assistant Name"],
                ["whatsappNumber", "WhatsApp Number"],
              ] as Array<[keyof SiteContent, string]>
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="text-sm text-foreground/70 block mb-2">{label}</span>
                <input
                  value={draft[key]}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      [key]: event.target.value,
                    }))
                  }
                  className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
                />
              </label>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={async () => {
                setIsSaving(true);
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
                }
              }}
              className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/login");
                router.refresh();
              }}
              className="h-11 px-6 rounded-xl border border-border"
            >
              Logout
            </button>
            {saved && <span className="text-sm text-green-500 self-center">Saved successfully.</span>}
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-8 md:p-10 lg:col-span-1">
          <h2 className="text-2xl font-display font-bold mb-4">Recent Leads</h2>
          {initialLeads.length === 0 ? (
            <p className="text-foreground/60 text-sm">No leads submitted yet.</p>
          ) : (
            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {initialLeads.map((lead) => (
                <article key={lead.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex justify-between gap-3 items-start">
                    <h3 className="font-semibold">{lead.name}</h3>
                    <span className="text-xs text-foreground/45">{new Date(lead.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-foreground/65">{lead.company}</p>
                  <p className="text-sm text-primary mt-1">{lead.email}</p>
                  <p className="text-sm text-foreground/70 mt-3">{lead.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-8 md:p-10 lg:col-span-1">
          <h2 className="text-2xl font-display font-bold mb-2">Change Admin Password</h2>
          <p className="text-sm text-foreground/60 mb-6">
            Use a strong password and store it safely.
          </p>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">Current Password</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-sm text-foreground/70 block mb-2">New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full h-11 rounded-xl border border-border bg-background px-4 outline-none focus:border-primary"
              />
            </label>
            <button
              onClick={async () => {
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
                } else {
                  setPasswordStatus(data.error ?? "Could not update password.");
                }
              }}
              className="h-11 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
            {passwordStatus && <p className="text-sm text-foreground/70">{passwordStatus}</p>}
          </div>
        </section>

        <aside className="rounded-[2rem] border border-border bg-card p-6 h-fit">
          <h2 className="font-semibold mb-3">Quick links</h2>
          <div className="space-y-2 text-sm">
            <Link href="/" className="block text-foreground/70 hover:text-foreground">
              View website
            </Link>
            <Link href="/#contact" className="block text-foreground/70 hover:text-foreground">
              Contact section
            </Link>
            <Link href="/#faq" className="block text-foreground/70 hover:text-foreground">
              FAQ section
            </Link>
          </div>
          <p className="text-xs text-foreground/45 mt-6">
            Changes are now saved server-side and persist across restarts.
          </p>
        </aside>
      </div>
    </main>
  );
}
