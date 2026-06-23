import { slugify } from "@/lib/slug";
import type { PublicationCard } from "@/lib/site-content.shared";

export type PublicationArticle = PublicationCard & { slug: string };

export function normalizeArticles(cards: PublicationCard[]): PublicationArticle[] {
  return cards.map((card, index) => ({
    ...card,
    slug: card.slug?.trim() || slugify(card.title) || `article-${index + 1}`,
  }));
}
