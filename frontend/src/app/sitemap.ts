import type { MetadataRoute } from "next";
import { readSiteContent } from "@backend/site-content";
import { normalizeArticles } from "@/lib/publications";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await readSiteContent();
  const articles = normalizeArticles(content.publicationsCards);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/about/yafet"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: siteUrl(`/blog/${article.slug}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages];
}
