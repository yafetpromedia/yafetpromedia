import { defaultSiteContent, SiteContent } from "@/lib/site-content.shared";
import { getDb } from "@/lib/db";

export type { SiteContent } from "@/lib/site-content.shared";
export { defaultSiteContent } from "@/lib/site-content.shared";

export function sanitizeSiteContent(input: Partial<SiteContent>): SiteContent {
  return {
    heroHeadline: String(input.heroHeadline ?? defaultSiteContent.heroHeadline).slice(0, 120),
    heroHighlight: String(input.heroHighlight ?? defaultSiteContent.heroHighlight).slice(0, 80),
    heroTail: String(input.heroTail ?? defaultSiteContent.heroTail).slice(0, 120),
    heroBadge: String(input.heroBadge ?? defaultSiteContent.heroBadge).slice(0, 140),
    contactEmail: String(input.contactEmail ?? defaultSiteContent.contactEmail).slice(0, 120),
    contactPhone: String(input.contactPhone ?? defaultSiteContent.contactPhone).slice(0, 60),
    aiName: String(input.aiName ?? defaultSiteContent.aiName).slice(0, 80),
    whatsappNumber: String(input.whatsappNumber ?? defaultSiteContent.whatsappNumber).replace(/[^\d]/g, ""),
  };
}

export async function readSiteContent(): Promise<SiteContent> {
  const row = getDb()
    .prepare(
      `
      SELECT hero_headline, hero_highlight, hero_tail, hero_badge,
             contact_email, contact_phone, ai_name, whatsapp_number
      FROM site_content WHERE id = 1
    `
    )
    .get() as
    | {
        hero_headline: string;
        hero_highlight: string;
        hero_tail: string;
        hero_badge: string;
        contact_email: string;
        contact_phone: string;
        ai_name: string;
        whatsapp_number: string;
      }
    | undefined;

  if (!row) return defaultSiteContent;

  return sanitizeSiteContent({
    heroHeadline: row.hero_headline,
    heroHighlight: row.hero_highlight,
    heroTail: row.hero_tail,
    heroBadge: row.hero_badge,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    aiName: row.ai_name,
    whatsappNumber: row.whatsapp_number,
  });
}

export async function writeSiteContent(input: Partial<SiteContent>): Promise<SiteContent> {
  const content = sanitizeSiteContent(input);
  getDb()
    .prepare(
      `
      UPDATE site_content
      SET hero_headline = ?, hero_highlight = ?, hero_tail = ?, hero_badge = ?,
          contact_email = ?, contact_phone = ?, ai_name = ?, whatsapp_number = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `
    )
    .run(
      content.heroHeadline,
      content.heroHighlight,
      content.heroTail,
      content.heroBadge,
      content.contactEmail,
      content.contactPhone,
      content.aiName,
      content.whatsappNumber
    );
  return content;
}
