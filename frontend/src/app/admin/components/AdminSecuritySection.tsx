"use client";

import { Dispatch, SetStateAction } from "react";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import type { SiteContent } from "@/lib/site-content.shared";
import { cn } from "@/lib/utils";

type Props = {
  draft: SiteContent;
  setDraft: Dispatch<SetStateAction<SiteContent>>;
  currentPassword: string;
  setCurrentPassword: Dispatch<SetStateAction<string>>;
  newPassword: string;
  setNewPassword: Dispatch<SetStateAction<string>>;
  passwordStatus: string;
  isChangingPassword: boolean;
  onUpdatePassword: () => void;
};

const labelCls =
  "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/48";

const inputCls = cn(
  "w-full rounded-2xl border border-border/85 bg-background/85 px-4 py-2.5 text-[15px] text-foreground outline-none transition",
  "placeholder:text-foreground/35 focus:border-primary/55 focus:ring-2 focus:ring-primary/15",
  "dark:border-white/[0.09] dark:bg-white/[0.04]"
);

const sectionShell =
  "rounded-3xl border border-white/[0.06] bg-card/55 p-6 shadow-sm backdrop-blur-sm dark:bg-card/35 sm:p-8";

const textareaCls = cn(
  inputCls,
  "min-h-[120px] resize-y py-3 leading-relaxed"
);

export default function AdminSecuritySection({
  draft,
  setDraft,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  passwordStatus,
  isChangingPassword,
  onUpdatePassword,
}: Props) {
  return (
    <div className="max-w-2xl space-y-10 pb-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-slate-500/[0.11] via-card/92 to-indigo-500/[0.09] p-6 shadow-[0_28px_80px_-44px_rgba(99,102,241,0.22)] sm:p-8">
        <div className="pointer-events-none absolute -left-28 top-0 size-[260px] rounded-full bg-slate-400/[0.1] blur-[100px]" />
        <div className="pointer-events-none absolute -right-28 bottom-0 size-[240px] rounded-full bg-indigo-400/[0.09] blur-[92px]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-800 ring-1 ring-indigo-500/28 dark:text-indigo-400">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-900/90 dark:text-indigo-400/95">
                Admin · Access control
              </p>
              <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">Security</h3>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-foreground/58">
                Rotate your dashboard password periodically. This credential protects publish actions and sensitive settings.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl border border-white/[0.08] bg-background/55 px-4 py-2.5 font-mono text-[11px] text-foreground/55 backdrop-blur-sm dark:bg-white/[0.03]">
            <Lock className="size-3.5 text-indigo-600/85 dark:text-indigo-400/90" />
            Password-only sign-in
          </div>
        </div>
      </div>

      {/* Guidance */}
      <div className="rounded-2xl border border-indigo-500/18 bg-indigo-500/[0.05] px-4 py-3.5 text-sm leading-relaxed text-foreground/72 ring-1 ring-indigo-500/12 dark:bg-indigo-500/[0.08]">
        <span className="mr-1 inline-flex items-center gap-1.5 align-middle">
          <KeyRound className="size-3.5 text-indigo-600 dark:text-indigo-400" />
        </span>
        Use a strong password you do not reuse elsewhere, and store it in a password manager if possible.
      </div>

      {/* Public login · forgot-password copy */}
      <section className={sectionShell}>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-5">
          <KeyRound className="size-4 text-indigo-600/85 dark:text-indigo-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Login page · Forgot password</h4>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-foreground/62">
          Text visitors see on{" "}
          <span className="font-mono text-[11px] text-foreground/70">/login</span> when they open “Forgot password.” Use it
          for internal contacts, SLA notes, or guidance when self-service reset is off.
        </p>
        <label className="block">
          <span className={labelCls}>Instructions (optional)</span>
          <textarea
            rows={5}
            value={draft.loginPasswordResetHelp}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, loginPasswordResetHelp: e.target.value }))
            }
            placeholder="Example: Email ops@… or open a ticket in …"
            className={textareaCls}
          />
        </label>
        <p className="mt-3 text-xs text-foreground/48">
          Save from the top bar. Self-service reset requires{" "}
          <span className="font-mono text-[11px] text-foreground/55">ADMIN_PASSWORD_RECOVERY_SECRET</span> on the server.
        </p>
      </section>

      <div className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3.5 text-xs leading-relaxed text-foreground/65 dark:bg-white/[0.02]">
        <p className="font-semibold text-foreground/75">Environment · recovery secret</p>
        <p className="mt-2 font-mono text-[11px] text-foreground/55">
          ADMIN_PASSWORD_RECOVERY_SECRET=<span className="text-foreground/40">long-random-passphrase</span>
        </p>
        <p className="mt-2">
          Set this only in hosting secrets (never commit). Anyone with the secret plus a known admin email can set a new
          password from the login page.
        </p>
      </div>

      {/* Form */}
      <section className={sectionShell}>
        <div className="mb-8 flex items-center gap-2 border-b border-border/50 pb-6">
          <Lock className="size-4 text-indigo-600/85 dark:text-indigo-400/90" />
          <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-foreground/75">Change admin password</h4>
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className={labelCls}>Current password</span>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className={labelCls}>New password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputCls}
            />
          </label>

          <button
            type="button"
            onClick={onUpdatePassword}
            disabled={isChangingPassword}
            className={cn(
              "inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition sm:w-auto",
              "hover:bg-primary/92 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/60",
              "disabled:pointer-events-none disabled:opacity-55"
            )}
          >
            {isChangingPassword ? "Updating…" : "Update password"}
          </button>

          {passwordStatus ? (
            <p className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-sm leading-relaxed text-foreground/75 dark:bg-white/[0.03]">
              {passwordStatus}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
