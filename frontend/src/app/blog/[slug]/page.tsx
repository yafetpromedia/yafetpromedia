import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { readSiteContent } from "@backend/site-content";
import JsonLd from "@/components/seo/JsonLd";
import { normalizeArticles } from "@/lib/publications";
import { shouldUseUnoptimizedImage } from "@/lib/image-src";
import { SITE_NAME, buildPageMetadata, siteUrl } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const content = await readSiteContent();
  return normalizeArticles(content.publicationsCards).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const content = await readSiteContent();
  const article = normalizeArticles(content.publicationsCards).find((a) => a.slug === slug);
  if (!article) return buildPageMetadata({ title: `Article | ${SITE_NAME}`, path: `/blog/${slug}` });

  const description = article.articleBody.replace(/\s+/g, " ").trim().slice(0, 160);

  return buildPageMetadata({
    title: `${article.title} | ${SITE_NAME}`,
    description,
    path: `/blog/${slug}`,
    ogType: "article",
    ogImage: article.imageSrc.trim() || undefined,
    keywords: [article.category, article.title, SITE_NAME, "digital insights"],
  });
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const content = await readSiteContent();
  const article = normalizeArticles(content.publicationsCards).find((a) => a.slug === slug);
  if (!article) notFound();

  const paragraphs = article.articleBody.split(/\n\n+/).filter(Boolean);
  const articleUrl = siteUrl(`/blog/${slug}`);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.articleBody.replace(/\s+/g, " ").trim().slice(0, 200),
    author: { "@type": "Organization", name: SITE_NAME, url: siteUrl() },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: siteUrl("/icon") },
    },
    mainEntityOfPage: articleUrl,
    url: articleUrl,
    articleSection: article.category,
    ...(article.imageSrc.trim()
      ? { image: [siteUrl(article.imageSrc.startsWith("/") ? article.imageSrc : `/${article.imageSrc}`)] }
      : {}),
  };

  return (
    <main className="min-h-screen bg-background pt-28 pb-20">
      <JsonLd data={articleJsonLd} />
      <article className="mx-auto max-w-3xl px-5 sm:px-7">
        <Link href="/#insights" className="mb-10 inline-flex items-center gap-2 text-sm text-foreground/55 transition hover:text-primary">
          <ArrowLeft className="size-4" /> Back to insights
        </Link>

        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">{article.category}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">{article.title}</h1>
        <p className="mt-4 text-sm text-foreground/50">{article.dateLabel} · {article.readTime}</p>

        {article.imageSrc.trim() && (
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-3xl border border-border">
            <Image src={article.imageSrc} alt={article.title} fill className="object-cover" unoptimized={shouldUseUnoptimizedImage(article.imageSrc)} sizes="(max-width: 768px) 100vw, 768px" priority />
          </div>
        )}

        <div className="prose prose-neutral dark:prose-invert mt-10 max-w-none space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-lg leading-relaxed text-foreground/75">{p}</p>
          ))}
        </div>

        {article.href.trim() && (
          <a href={article.href} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex text-sm font-semibold text-primary hover:underline">
            Read original source →
          </a>
        )}
      </article>
    </main>
  );
}
