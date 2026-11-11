import type { MetadataRoute } from "next";
import { readSiteContent } from "@backend/site-content";
import { normalizePortfolioCases } from "@/lib/portfolio";
import { normalizeArticles } from "@/lib/publications";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await readSiteContent();
  const articles = normalizeArticles(content.publicationsCards);
  const cases = normalizePortfolioCases(content.caseStudiesCards);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/about/yafet"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: siteUrl("/portfolio"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.5 },
  ];

  const portfolioPages: MetadataRoute.Sitemap = cases.map((item) => ({
    url: siteUrl(`/portfolio/${item.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: siteUrl(`/blog/${article.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...portfolioPages, ...articlePages];
}
