import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { readSiteContent } from "@backend/site-content";
import JsonLd from "@/components/seo/JsonLd";
import { normalizePortfolioCases } from "@/lib/portfolio";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { SITE_NAME, breadcrumbJsonLd, buildPageMetadata, siteUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

const STATUS_LABEL = {
  live: "Live",
  "in-progress": "In progress",
  completed: "Completed",
  concept: "Concept",
} as const;

export async function generateStaticParams() {
  const content = await readSiteContent();
  return normalizePortfolioCases(content.caseStudiesCards).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const content = await readSiteContent();
  const item = normalizePortfolioCases(content.caseStudiesCards).find((c) => c.slug === slug);
  if (!item) {
    return buildPageMetadata({ title: `Case study | ${SITE_NAME}`, path: `/portfolio/${slug}` });
  }
  const description = item.result || item.solution || item.problem;
  return buildPageMetadata({
    title: `${item.title} | ${SITE_NAME}`,
    description: description.replace(/\s+/g, " ").trim().slice(0, 160),
    path: `/portfolio/${slug}`,
    ogImage: item.images?.[0]?.trim() || undefined,
    keywords: [item.category, item.title, SITE_NAME, "portfolio", ...(item.technologies ?? [])],
  });
}

export default async function PortfolioCasePage({ params }: Props) {
  const { slug } = await params;
  const content = await readSiteContent();
  const item = normalizePortfolioCases(content.caseStudiesCards).find((c) => c.slug === slug);
  if (!item) notFound();

  const pageUrl = siteUrl(`/portfolio/${slug}`);
  const cover = (item.images?.[0] ?? "").trim();
  const gallery = (item.images ?? []).map((src) => src.trim()).filter(Boolean);

  const caseJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: item.title,
    description: item.solution || item.problem,
    url: pageUrl,
    creator: { "@type": "Organization", name: SITE_NAME, url: siteUrl() },
    about: item.category,
    keywords: [item.category, ...(item.technologies ?? [])].join(", "),
    ...(cover ? { image: [siteUrl(cover.startsWith("/") ? cover : `/${cover}`)] } : {}),
  };

  const crumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Portfolio", path: "/portfolio" },
    { name: item.title, path: `/portfolio/${slug}` },
  ]);

  return (
    <main className="min-h-screen bg-background pt-28 pb-24">
      <JsonLd data={[caseJsonLd, crumbs]} />
      <article className="mx-auto max-w-4xl px-5 sm:px-7">
        <Link
          href="/portfolio"
          className="mb-10 inline-flex items-center gap-2 text-sm text-foreground/55 transition hover:text-primary"
        >
          <ArrowLeft className="size-4" /> All portfolio
        </Link>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground/55">
            {item.category}
          </span>
          <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            {STATUS_LABEL[item.projectStatus] ?? item.projectStatus}
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
          {item.title}
        </h1>
        {item.clientName?.trim() ? (
          <p className="mt-4 text-foreground/55">
            Client: <span className="font-medium text-foreground/80">{item.clientName}</span>
          </p>
        ) : null}

        {cover ? (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-border">
            <Image
              src={cover}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized={shouldUseUnoptimizedImage(cover)}
              sizes="(max-width: 768px) 100vw, 896px"
              priority
            />
          </div>
        ) : null}

        <div className="mt-12 grid gap-10 md:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-10">
            <section>
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/40">
                The constraint
              </h2>
              <p className="mt-3 text-lg font-light leading-relaxed text-foreground/70">{item.problem}</p>
            </section>
            <section>
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                The architecture
              </h2>
              <p className="mt-3 text-lg font-light leading-relaxed text-foreground">{item.solution}</p>
            </section>
            <section>
              <h2 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
                Verifiable result
              </h2>
              <p className="mt-3 text-lg font-medium leading-relaxed text-foreground">{item.result}</p>
            </section>
          </div>

          <aside className="space-y-6 rounded-3xl border border-border/80 bg-card/40 p-6">
            {(item.stat || item.statLabel) && (
              <div>
                <p className="font-display text-4xl font-bold text-foreground">{item.stat}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/45">
                  {item.statLabel}
                </p>
              </div>
            )}
            {(item.technologies?.length ?? 0) > 0 ? (
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                  Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-foreground/65"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            {item.projectLink?.trim() ? (
              <a
                href={item.projectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                View live project <ExternalLink className="size-3.5" />
              </a>
            ) : null}
            <Link
              href="/#book-call"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Start a similar project
              <ArrowRight className="size-4" />
            </Link>
          </aside>
        </div>

        {gallery.length > 1 ? (
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {gallery.slice(1).map((src) => (
              <div key={src} className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={shouldUseUnoptimizedImage(src)}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </main>
  );
}
