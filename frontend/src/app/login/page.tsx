"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <main
      className={cn(
        "min-h-dvh w-full",
        "bg-gradient-to-b from-background via-background to-muted/20",
        "px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-20",
        "pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))]"
      )}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 items-stretch lg:grid-cols-2 lg:gap-8">
        <section
          className={cn(
            "order-2 flex flex-col justify-between rounded-3xl border border-border/80 bg-card/60 p-8 shadow-sm backdrop-blur-sm sm:p-10",
            "lg:order-1"
          )}
        >
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Secure portal</p>
            <h1 className="mt-4 text-3xl font-display font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Welcome back to your admin workspace.
            </h1>
            <p className="mt-4 max-w-md text-foreground/65 leading-relaxed">
              Manage landing page content, review leads, and keep your brand experience up to date.
            </p>
          </div>
          <p className="mt-8 text-sm text-foreground/45">Use your configured admin credentials.</p>
        </section>

        <section
          className={cn(
            "order-1 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:p-8 md:p-10",
            "lg:order-2"
          )}
        >
          <h2 className="text-lg font-semibold sm:text-xl">Sign in</h2>
          <p className="mt-1 text-sm text-foreground/55">Access the dashboard for this site only.</p>
          <form onSubmit={handleLogin} className="mt-6 space-y-4 sm:mt-8 sm:space-y-5">
            <div>
              <label className="mb-1.5 block text-sm text-foreground/70">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-[16px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-foreground/70">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/40" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-[16px] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:text-sm"
                />
              </div>
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoading ? "Logging in…" : "Log in"}
            </button>
          </form>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-foreground/60 transition hover:text-foreground"
          >
            Back to website
          </Link>
        </section>
      </div>
    </main>
  );
}
