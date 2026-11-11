import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { readSiteContent } from "@backend/site-content";
import JsonLd from "@/components/seo/JsonLd";
import { normalizePortfolioCases } from "@/lib/portfolio";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { SITE_NAME, breadcrumbJsonLd, buildPageMetadata, siteUrl } from "@/lib/seo";

const STATUS_LABEL = {
  live: "Live",
  "in-progress": "In progress",
  completed: "Completed",
  concept: "Concept",
} as const;

export async function generateMetadata() {
  const content = await readSiteContent();
  return buildPageMetadata({
    title: `${content.caseStudiesSectionTitle || "Portfolio"} | ${SITE_NAME}`,
    description:
      content.caseStudiesSectionDescription ||
      "Selected client systems and digital programs delivered by Awud Digitals.",
    path: "/portfolio",
  });
}

export default async function PortfolioPage() {
  const content = await readSiteContent();
  const cases = normalizePortfolioCases(content.caseStudiesCards);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: content.caseStudiesSectionTitle || "Portfolio",
    description: content.caseStudiesSectionDescription,
    url: siteUrl("/portfolio"),
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: siteUrl() },
    about: { "@type": "Organization", name: SITE_NAME },
  };

  const crumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
  ]);

  return (
    <main className="min-h-screen bg-background pt-28 pb-24">
      <JsonLd data={[collectionJsonLd, crumbs]} />
      <div className="mx-auto max-w-6xl px-5 sm:px-7">
        <Link
          href="/#case-studies"
          className="mb-10 inline-flex items-center gap-2 text-sm text-foreground/55 transition hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to home
        </Link>

        <div className="mb-14 max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
            {content.caseStudiesSectionTag || "Portfolio"}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {content.caseStudiesSectionTitle}
          </h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-foreground/60">
            {content.caseStudiesSectionDescription}
          </p>
        </div>

        {cases.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-foreground/55">
            Portfolio cases will appear here once published in admin.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {cases.map((item) => {
              const cover = (item.images?.[0] ?? "").trim();
              return (
                <Link
                  key={item.slug}
                  href={`/portfolio/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card/40 transition hover:border-primary/35"
                >
                  {cover ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/60">
                      <Image
                        src={cover}
                        alt=""
                        fill
                        className="object-cover transition duration-700 group-hover:scale-[1.03]"
                        unoptimized={shouldUseUnoptimizedImage(cover)}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] w-full border-b border-border/60 bg-gradient-to-br from-primary/15 via-background to-foreground/[0.04]" />
                  )}
                  <div className="flex flex-1 flex-col p-6 sm:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/55">
                        {item.category}
                      </span>
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
                        {STATUS_LABEL[item.projectStatus] ?? item.projectStatus}
                      </span>
                    </div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-primary">
                      {item.title}
                    </h2>
                    {item.clientName?.trim() ? (
                      <p className="mt-2 text-sm text-foreground/50">{item.clientName}</p>
                    ) : null}
                    <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-foreground/60">
                      {item.problem}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      View case
                      <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                    {item.projectLink?.trim() ? (
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-foreground/40">
                        <ExternalLink className="size-3" /> Live project available
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
