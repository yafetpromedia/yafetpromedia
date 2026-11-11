import { slugify } from "@/lib/slug";
import type { CaseStudyCard } from "@/lib/site-content.shared";

export type PortfolioCase = CaseStudyCard & { slug: string };

/** Normalize case studies with stable slugs for /portfolio routes. */
export function normalizePortfolioCases(cards: CaseStudyCard[]): PortfolioCase[] {
  const used = new Set<string>();
  return cards.map((card, index) => {
    let slug = card.slug?.trim() || slugify(card.title) || `case-${index + 1}`;
    if (used.has(slug)) slug = `${slug}-${index + 1}`;
    used.add(slug);
    return { ...card, slug };
  });
}
