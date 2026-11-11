import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { SITE_NAME, buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: `Page not found | ${SITE_NAME}`,
  description: `The page you requested could not be found on ${SITE_NAME}.`,
  path: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-24 text-center">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        This page could not be found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/60">
        The address may be wrong, or the page may have moved. {SITE_NAME} lives at the homepage — not{" "}
        <span className="font-mono text-foreground/75">/app</span>.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_rgba(255,106,0,0.35)] transition hover:brightness-105"
        >
          <Home className="size-4" />
          Go to homepage
        </Link>
        <Link
          href="/#contact"
          className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground/80 transition hover:border-primary/35 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Contact us
        </Link>
      </div>
      <p className="mt-8 text-xs text-foreground/40">{DEFAULT_TITLE}</p>
    </main>
  );
}
