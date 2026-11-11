"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/components/common/SiteContentProvider";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";

export default function LoginPage() {
  const { content } = useSiteContent();
  const logoSrc = content.siteLogoSrc || defaultSiteContent.siteLogoSrc;
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [recoveryConfigured, setRecoveryConfigured] = useState<boolean | null>(null);
  const [helpText, setHelpText] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [recoverySecret, setRecoverySecret] = useState("");
  const [resetNew, setResetNew] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetDone, setResetDone] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/password-reset");
        const data = (await res.json()) as { recoveryConfigured?: boolean; helpText?: string };
        if (cancelled) return;
        setRecoveryConfigured(Boolean(data.recoveryConfigured));
        setHelpText(typeof data.helpText === "string" ? data.helpText : "");
      } catch {
        if (!cancelled) {
          setRecoveryConfigured(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleResetDialogChange = (open: boolean) => {
    setResetOpen(open);
    if (!open) {
      setResetError("");
      setResetBusy(false);
      setRecoverySecret("");
      setResetNew("");
      setResetConfirm("");
      setResetDone(false);
    } else {
      setResetEmail(email.trim());
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (response.ok) {
      router.push("/admin");
      router.refresh();
      setIsLoading(false);
      return;
    }
    setError(payload?.error ?? "Invalid login. Check your admin credentials.");
    setIsLoading(false);
  };

  const submitPasswordReset = async (event: FormEvent) => {
    event.preventDefault();
    setResetError("");
    if (resetNew !== resetConfirm) {
      setResetError("New password fields do not match.");
      return;
    }
    if (resetNew.length < 8) {
      setResetError("New password must be at least 8 characters.");
      return;
    }
    setResetBusy(true);
    const response = await fetch("/api/auth/password-reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: resetEmail,
        recoverySecret,
        newPassword: resetNew,
      }),
    });
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    setResetBusy(false);
    if (response.ok) {
      setResetDone(true);
      setRecoverySecret("");
      setResetNew("");
      setResetConfirm("");
      return;
    }
    setResetError(payload?.error ?? "Could not reset password.");
  };

  const inputWrap =
    "group relative flex items-center gap-3 rounded-2xl border border-border/80 bg-background px-4 transition-[border-color,box-shadow] focus-within:border-accent/45 focus-within:shadow-[0_0_0_3px_rgba(232,93,4,0.12)]";

  const helpParagraphs =
    helpText.trim().length > 0 ? (
      <div className="mt-6 whitespace-pre-wrap rounded-2xl border border-border/60 bg-muted/30 px-4 py-3 text-left text-[13px] leading-relaxed text-foreground/65">
        {helpText.trim()}
      </div>
    ) : null;

  return (
    <>
      <Dialog open={resetOpen} onOpenChange={handleResetDialogChange}>
        <DialogContent
          showCloseButton
          overlayClassName="bg-foreground/25 backdrop-blur-[8px]"
          className={cn(
            "max-h-[min(90dvh,720px)] gap-0 overflow-y-auto rounded-2xl border border-border/60 p-0 sm:max-w-md",
            "bg-card shadow-xl ring-1 ring-black/[0.04]"
          )}
        >
          <DialogHeader className="border-b border-border/50 px-6 pb-4 pt-6 text-left">
            <div className="mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
              <KeyRound className="size-5" aria-hidden />
            </div>
            <DialogTitle className="font-display text-lg font-bold tracking-tight">Reset admin password</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-foreground/60">
              {recoveryConfigured === null
                ? "Loading options…"
                : recoveryConfigured
                  ? "Enter your admin email, the recovery secret from hosting env, and your new password."
                  : "Self-service reset is not enabled on this deployment. Use the notes below or ask another admin."}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            {resetDone ? (
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.06] px-4 py-4 text-sm text-emerald-900 dark:text-emerald-300">
                <div className="flex gap-3">
                  <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  <p>
                    Password updated. You can close this dialog and sign in with your new password.
                  </p>
                </div>
                <Button type="button" className="mt-4 w-full rounded-xl" onClick={() => handleResetDialogChange(false)}>
                  Close
                </Button>
              </div>
            ) : recoveryConfigured === null ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-foreground/55">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading…
              </div>
            ) : recoveryConfigured ? (
              <form onSubmit={submitPasswordReset} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-[13px] font-medium text-foreground/75">
                    Admin email
                  </label>
                  <div className={inputWrap}>
                    <Mail className="size-[18px] shrink-0 text-foreground/35" aria-hidden />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none sm:text-[15px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="reset-secret" className="text-[13px] font-medium text-foreground/75">
                    Recovery secret
                  </label>
                  <div className={inputWrap}>
                    <KeyRound className="size-[18px] shrink-0 text-foreground/35" aria-hidden />
                    <input
                      id="reset-secret"
                      type="password"
                      required
                      autoComplete="off"
                      value={recoverySecret}
                      onChange={(e) => setRecoverySecret(e.target.value)}
                      placeholder="From ADMIN_PASSWORD_RECOVERY_SECRET"
                      className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-foreground/28 sm:text-[15px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="reset-new" className="text-[13px] font-medium text-foreground/75">
                    New password
                  </label>
                  <div className={inputWrap}>
                    <Lock className="size-[18px] shrink-0 text-foreground/35" aria-hidden />
                    <input
                      id="reset-new"
                      type={showResetNewPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={resetNew}
                      onChange={(e) => setResetNew(e.target.value)}
                      className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none sm:text-[15px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetNewPassword((prev) => !prev)}
                      className="rounded-md p-1.5 text-foreground/45 transition hover:text-foreground/70"
                      aria-label={showResetNewPassword ? "Hide new password" : "Show new password"}
                    >
                      {showResetNewPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="reset-confirm" className="text-[13px] font-medium text-foreground/75">
                    Confirm new password
                  </label>
                  <div className={inputWrap}>
                    <Lock className="size-[18px] shrink-0 text-foreground/35" aria-hidden />
                    <input
                      id="reset-confirm"
                      type={showResetConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={resetConfirm}
                      onChange={(e) => setResetConfirm(e.target.value)}
                      className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none sm:text-[15px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                      className="rounded-md p-1.5 text-foreground/45 transition hover:text-foreground/70"
                      aria-label={showResetConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showResetConfirmPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                    </button>
                  </div>
                </div>

                {resetError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/35 bg-red-500/[0.07] px-3 py-2 text-[13px] text-red-700 dark:text-red-400"
                  >
                    {resetError}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={resetBusy}
                  className="h-12 w-full rounded-2xl font-semibold shadow-lg shadow-primary/20"
                >
                  {resetBusy ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Updating…
                    </span>
                  ) : (
                    "Save new password"
                  )}
                </Button>
              </form>
            ) : (
              <p className="py-2 text-sm leading-relaxed text-foreground/65">
                Ask your team to add{" "}
                <span className="font-mono text-[11px] text-foreground/75">ADMIN_PASSWORD_RECOVERY_SECRET</span> to
                hosting secrets, or sign in with credentials from your deployment environment.
              </p>
            )}

            {!resetDone && helpParagraphs}
          </div>
        </DialogContent>
      </Dialog>

      <main className="relative min-h-dvh overflow-hidden bg-[radial-gradient(ellipse_70%_50%_at_0%_0%,rgba(232,93,4,0.05),transparent_50%),linear-gradient(180deg,var(--background)_0%,var(--muted)_100%)] text-foreground antialiased">
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[18%] top-[-12%] h-[min(52vmin,480px)] w-[min(52vmin,480px)] rounded-full bg-accent/[0.07] blur-[110px]" />
          <div className="absolute -right-[12%] bottom-[-8%] h-[min(48vmin,420px)] w-[min(48vmin,420px)] rounded-full bg-sky-500/[0.05] blur-[100px]" />
        </div>

        <div
          className={cn(
            "relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col justify-center",
            "px-4 py-10 sm:px-6 lg:px-12",
            "pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]"
          )}
        >
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_minmax(0,420px)] lg:gap-16 xl:gap-24">
            {/* Copy column */}
            <section className="hidden lg:block">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                <Shield className="size-3.5 opacity-90" aria-hidden />
                Secure portal
              </div>
              <h1 className="mt-8 font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.06] tracking-tight">
                Welcome back to your workspace.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Manage landing content, review leads, and keep your brand experience aligned — all in one dashboard.
              </p>
              <ul className="mt-10 flex flex-wrap gap-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                <li className="rounded-full border border-border/70 bg-card px-3 py-1.5">
                  Session cookie
                </li>
                <li className="rounded-full border border-border/70 bg-card px-3 py-1.5">
                  HTTPS recommended
                </li>
                <li className="rounded-full border border-border/70 bg-card px-3 py-1.5">
                  Admin only
                </li>
              </ul>
            </section>

            {/* Form card */}
            <section className="mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-end">
              <div
                className={cn(
                  "rounded-[1.75rem] border border-border/70 bg-card p-8 shadow-sm",
                  "ring-1 ring-black/[0.03]"
                )}
              >
                <div className="mb-8 flex flex-col gap-5">
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-white p-1.5 shadow-sm dark:border-white/20">
                      <Image
                        src={logoSrc}
                        alt="Awud Digitals"
                        width={36}
                        height={36}
                        className="object-contain"
                        priority
                        unoptimized={shouldUseUnoptimizedImage(logoSrc)}
                      />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold tracking-tight">Awud Digitals</p>
                      <p className="text-[11px] text-foreground/45">
                        Founded by {content.aboutYafet.pageTitle}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight sm:text-[1.65rem]">Sign in</h2>
                    <p className="mt-1.5 text-sm text-foreground/50">
                      Use your admin email and password for this site.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-[13px] font-medium text-foreground/75">
                      Email
                    </label>
                    <div className={inputWrap}>
                      <Mail className="size-[18px] shrink-0 text-foreground/35" aria-hidden />
                      <input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@company.com"
                        className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-foreground/28 sm:text-[15px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-[13px] font-medium text-foreground/75">
                      Password
                    </label>
                    <div className={inputWrap}>
                      <Lock className="size-[18px] shrink-0 text-foreground/35" aria-hidden />
                      <input
                        id="login-password"
                        type={showLoginPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-foreground/28 sm:text-[15px]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword((prev) => !prev)}
                        className="rounded-md p-1.5 text-foreground/45 transition hover:text-foreground/70"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                      </button>
                    </div>
                  </div>

                  {error ? (
                    <p
                      role="alert"
                      className="rounded-xl border border-red-500/35 bg-red-500/[0.07] px-3.5 py-2.5 text-[13px] leading-snug text-red-700 dark:text-red-400"
                    >
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "relative flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold transition",
                      "bg-primary text-primary-foreground",
                      "hover:opacity-90 active:scale-[0.99]",
                      "disabled:pointer-events-none disabled:opacity-55"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-[18px] animate-spin" aria-hidden />
                        Signing in…
                      </>
                    ) : (
                      "Continue"
                    )}
                  </button>
                </form>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <Link
                    href="/"
                    className={cn(
                      "inline-flex items-center gap-2 text-sm font-medium text-foreground/50 transition",
                      "hover:text-foreground"
                    )}
                  >
                    <ArrowLeft className="size-4 opacity-70" aria-hidden />
                    Back to website
                  </Link>
                  <button
                    type="button"
                    onClick={() => setResetOpen(true)}
                    className="text-sm font-semibold text-accent transition hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
