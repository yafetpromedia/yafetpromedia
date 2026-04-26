"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";

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

    if (response.ok) {
      router.push("/admin");
      router.refresh();
      setIsLoading(false);
      return;
    }
    setError("Invalid login. Check your admin credentials.");
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-background pt-36 pb-20 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <section className="rounded-[2rem] border border-border bg-card p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-5">Secure Portal</p>
            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
              Welcome back to your admin workspace.
            </h1>
            <p className="text-foreground/65 max-w-md">
              Manage landing page content, review leads, and keep your brand experience up to date.
            </p>
          </div>
          <p className="text-sm text-foreground/45 mt-8">Use your configured admin credentials.</p>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-8 md:p-10">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm text-foreground/70 block mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full h-12 rounded-xl border border-border bg-background pl-10 pr-4 outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-foreground/70 block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/40" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full h-12 rounded-xl border border-border bg-background pl-10 pr-4 outline-none focus:border-primary"
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-colors"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
          <Link href="/" className="inline-block mt-6 text-sm text-foreground/60 hover:text-foreground">
            Back to website
          </Link>
        </section>
      </div>
    </main>
  );
}
