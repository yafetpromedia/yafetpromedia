import { defaultSiteContent, SiteContent } from "@/lib/site-content.shared";
import { query } from "@/lib/db";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type { SiteContent } from "@/lib/site-content.shared";
export { defaultSiteContent } from "@/lib/site-content.shared";

const fallbackPath = path.join(process.cwd(), ".data", "site-content.fallback.json");

async function readFallbackContent(): Promise<SiteContent> {
  try {
    const file = await readFile(fallbackPath, "utf-8");
    const parsed = JSON.parse(file) as Partial<SiteContent>;
    return sanitizeSiteContent(parsed);
  } catch {
    return defaultSiteContent;
  }
}

async function writeFallbackContent(content: SiteContent): Promise<void> {
  await mkdir(path.dirname(fallbackPath), { recursive: true });
  await writeFile(fallbackPath, JSON.stringify(content, null, 2), "utf-8");
}

export function sanitizeSiteContent(input: Partial<SiteContent>): SiteContent {
  const cards = Array.isArray(input.systemsCards) ? input.systemsCards : defaultSiteContent.systemsCards;
  const serviceCards = Array.isArray(input.servicesCards) ? input.servicesCards : defaultSiteContent.servicesCards;
  const productCards = Array.isArray(input.productsCards) ? input.productsCards : defaultSiteContent.productsCards;
  const caseStudyCards = Array.isArray(input.caseStudiesCards)
    ? input.caseStudiesCards
    : defaultSiteContent.caseStudiesCards;
  const trustLogos = Array.isArray(input.trustLogoItems) ? input.trustLogoItems : defaultSiteContent.trustLogoItems;
  const trustTestimonials = Array.isArray(input.trustTestimonials)
    ? input.trustTestimonials
    : defaultSiteContent.trustTestimonials;
  const processSteps = Array.isArray(input.processSteps) ? input.processSteps : defaultSiteContent.processSteps;
  const faqItems = Array.isArray(input.faqItems) ? input.faqItems : defaultSiteContent.faqItems;
  const socialLinks = Array.isArray(input.socialLinks) ? input.socialLinks : defaultSiteContent.socialLinks;
  return {
    heroHeadline: String(input.heroHeadline ?? defaultSiteContent.heroHeadline).slice(0, 120),
    heroHighlight: String(input.heroHighlight ?? defaultSiteContent.heroHighlight).slice(0, 80),
    heroTail: String(input.heroTail ?? defaultSiteContent.heroTail).slice(0, 120),
    heroBadge: String(input.heroBadge ?? defaultSiteContent.heroBadge).slice(0, 140),
    systemsSectionTag: String(input.systemsSectionTag ?? defaultSiteContent.systemsSectionTag).slice(0, 120),
    systemsSectionTitle: String(input.systemsSectionTitle ?? defaultSiteContent.systemsSectionTitle).slice(0, 180),
    systemsSectionDescription: String(
      input.systemsSectionDescription ?? defaultSiteContent.systemsSectionDescription
    ).slice(0, 400),
    systemsExploreCtaLabel: String(
      input.systemsExploreCtaLabel ?? defaultSiteContent.systemsExploreCtaLabel
    ).slice(0, 80),
    systemsCards: cards.slice(0, 4).map((card, index) => ({
      title: String(card?.title ?? defaultSiteContent.systemsCards[index]?.title ?? "").slice(0, 120),
      description: String(
        card?.description ?? defaultSiteContent.systemsCards[index]?.description ?? ""
      ).slice(0, 300),
      tag: String(card?.tag ?? defaultSiteContent.systemsCards[index]?.tag ?? "").slice(0, 40),
    })),
    servicesSectionTag: String(input.servicesSectionTag ?? defaultSiteContent.servicesSectionTag).slice(0, 120),
    servicesSectionTitle: String(input.servicesSectionTitle ?? defaultSiteContent.servicesSectionTitle).slice(0, 180),
    servicesCards: serviceCards.slice(0, 4).map((card, index) => ({
      title: String(card?.title ?? defaultSiteContent.servicesCards[index]?.title ?? "").slice(0, 120),
      description: String(
        card?.description ?? defaultSiteContent.servicesCards[index]?.description ?? ""
      ).slice(0, 300),
    })),
    productsSectionTag: String(input.productsSectionTag ?? defaultSiteContent.productsSectionTag).slice(0, 120),
    productsSectionTitle: String(input.productsSectionTitle ?? defaultSiteContent.productsSectionTitle).slice(0, 180),
    productsCards: productCards.slice(0, 4).map((card, index) => ({
      title: String(card?.title ?? defaultSiteContent.productsCards[index]?.title ?? "").slice(0, 120),
      description: String(
        card?.description ?? defaultSiteContent.productsCards[index]?.description ?? ""
      ).slice(0, 300),
      label: String(card?.label ?? defaultSiteContent.productsCards[index]?.label ?? "").slice(0, 40),
    })),
    caseStudiesSectionTag: String(
      input.caseStudiesSectionTag ?? defaultSiteContent.caseStudiesSectionTag
    ).slice(0, 120),
    caseStudiesSectionTitle: String(
      input.caseStudiesSectionTitle ?? defaultSiteContent.caseStudiesSectionTitle
    ).slice(0, 180),
    caseStudiesSectionDescription: String(
      input.caseStudiesSectionDescription ?? defaultSiteContent.caseStudiesSectionDescription
    ).slice(0, 400),
    caseStudiesSectionCtaLabel: String(
      input.caseStudiesSectionCtaLabel ?? defaultSiteContent.caseStudiesSectionCtaLabel
    ).slice(0, 80),
    caseStudiesCards: caseStudyCards.slice(0, 3).map((card, index) => ({
      title: String(card?.title ?? defaultSiteContent.caseStudiesCards[index]?.title ?? "").slice(0, 120),
      category: String(card?.category ?? defaultSiteContent.caseStudiesCards[index]?.category ?? "").slice(0, 80),
      problem: String(card?.problem ?? defaultSiteContent.caseStudiesCards[index]?.problem ?? "").slice(0, 300),
      solution: String(card?.solution ?? defaultSiteContent.caseStudiesCards[index]?.solution ?? "").slice(0, 300),
      result: String(card?.result ?? defaultSiteContent.caseStudiesCards[index]?.result ?? "").slice(0, 220),
      stat: String(card?.stat ?? defaultSiteContent.caseStudiesCards[index]?.stat ?? "").slice(0, 40),
      statLabel: String(card?.statLabel ?? defaultSiteContent.caseStudiesCards[index]?.statLabel ?? "").slice(0, 60),
    })),
    trustSectionTag: String(input.trustSectionTag ?? defaultSiteContent.trustSectionTag).slice(0, 120),
    trustSectionTitle: String(input.trustSectionTitle ?? defaultSiteContent.trustSectionTitle).slice(0, 180),
    trustLogoItems: trustLogos.slice(0, 12).map((item) => String(item ?? "").slice(0, 80)).filter(Boolean),
    trustTestimonials: trustTestimonials.slice(0, 4).map((item, index) => ({
      quote: String(item?.quote ?? defaultSiteContent.trustTestimonials[index]?.quote ?? "").slice(0, 320),
      author: String(item?.author ?? defaultSiteContent.trustTestimonials[index]?.author ?? "").slice(0, 100),
      role: String(item?.role ?? defaultSiteContent.trustTestimonials[index]?.role ?? "").slice(0, 120),
    })),
    processFaqSectionTag: String(
      input.processFaqSectionTag ?? defaultSiteContent.processFaqSectionTag
    ).slice(0, 120),
    processFaqSectionTitle: String(
      input.processFaqSectionTitle ?? defaultSiteContent.processFaqSectionTitle
    ).slice(0, 180),
    processFaqSectionDescription: String(
      input.processFaqSectionDescription ?? defaultSiteContent.processFaqSectionDescription
    ).slice(0, 400),
    processSteps: processSteps.slice(0, 6).map((item, index) => ({
      text: String(item?.text ?? defaultSiteContent.processSteps[index]?.text ?? "").slice(0, 180),
    })),
    faqItems: faqItems.slice(0, 6).map((item, index) => ({
      question: String(item?.question ?? defaultSiteContent.faqItems[index]?.question ?? "").slice(0, 180),
      answer: String(item?.answer ?? defaultSiteContent.faqItems[index]?.answer ?? "").slice(0, 320),
    })),
    contactEmail: String(input.contactEmail ?? defaultSiteContent.contactEmail).slice(0, 120),
    contactPhone: String(input.contactPhone ?? defaultSiteContent.contactPhone).slice(0, 60),
    socialLinks: socialLinks.slice(0, 8).map((item, index) => ({
      label: String(item?.label ?? defaultSiteContent.socialLinks[index]?.label ?? "").slice(0, 40),
      url: String(item?.url ?? defaultSiteContent.socialLinks[index]?.url ?? "").slice(0, 260),
      icon: (["whatsapp", "email", "linkedin", "instagram", "youtube", "github", "website"] as const).includes(
        item?.icon as never
      )
        ? (item.icon as SiteContent["socialLinks"][number]["icon"])
        : (defaultSiteContent.socialLinks[index]?.icon ?? "website"),
      enabled: Boolean(item?.enabled ?? defaultSiteContent.socialLinks[index]?.enabled),
    })),
    aiName: String(input.aiName ?? defaultSiteContent.aiName).slice(0, 80),
    whatsappNumber: String(input.whatsappNumber ?? defaultSiteContent.whatsappNumber).replace(/[^\d]/g, ""),
  };
}

export async function readSiteContent(): Promise<SiteContent> {
  try {
    const rows = await query<{
      hero_headline: string;
      hero_highlight: string;
      hero_tail: string;
      hero_badge: string;
      systems_section_tag: string;
      systems_section_title: string;
      systems_section_description: string;
      systems_explore_cta_label: string;
      systems_cards: unknown;
      services_section_tag: string;
      services_section_title: string;
      services_cards: unknown;
      products_section_tag: string;
      products_section_title: string;
      products_cards: unknown;
      case_studies_section_tag: string;
      case_studies_section_title: string;
      case_studies_section_description: string;
      case_studies_section_cta_label: string;
      case_studies_cards: unknown;
      trust_section_tag: string;
      trust_section_title: string;
      trust_logo_items: unknown;
      trust_testimonials: unknown;
      process_faq_section_tag: string;
      process_faq_section_title: string;
      process_faq_section_description: string;
      process_steps: unknown;
      faq_items: unknown;
      contact_email: string;
      contact_phone: string;
      social_links: unknown;
      ai_name: string;
      whatsapp_number: string;
    }>(
      `
        SELECT hero_headline, hero_highlight, hero_tail, hero_badge,
               systems_section_tag, systems_section_title, systems_section_description, systems_explore_cta_label, systems_cards,
               services_section_tag, services_section_title, services_cards,
               products_section_tag, products_section_title, products_cards,
               case_studies_section_tag, case_studies_section_title, case_studies_section_description, case_studies_section_cta_label, case_studies_cards,
               trust_section_tag, trust_section_title, trust_logo_items, trust_testimonials,
               process_faq_section_tag, process_faq_section_title, process_faq_section_description, process_steps, faq_items,
               contact_email, contact_phone, social_links, ai_name, whatsapp_number
        FROM site_content WHERE id = 1
      `
    );
    const row = rows[0];
    if (!row) return readFallbackContent();

    return sanitizeSiteContent({
      heroHeadline: row.hero_headline,
      heroHighlight: row.hero_highlight,
      heroTail: row.hero_tail,
      heroBadge: row.hero_badge,
      systemsSectionTag: row.systems_section_tag,
      systemsSectionTitle: row.systems_section_title,
      systemsSectionDescription: row.systems_section_description,
      systemsExploreCtaLabel: row.systems_explore_cta_label,
      systemsCards: Array.isArray(row.systems_cards)
        ? (row.systems_cards as SiteContent["systemsCards"])
        : defaultSiteContent.systemsCards,
      servicesSectionTag: row.services_section_tag,
      servicesSectionTitle: row.services_section_title,
      servicesCards: Array.isArray(row.services_cards)
        ? (row.services_cards as SiteContent["servicesCards"])
        : defaultSiteContent.servicesCards,
      productsSectionTag: row.products_section_tag || defaultSiteContent.productsSectionTag,
      productsSectionTitle: row.products_section_title || defaultSiteContent.productsSectionTitle,
      productsCards: Array.isArray(row.products_cards) && row.products_cards.length > 0
        ? (row.products_cards as SiteContent["productsCards"])
        : defaultSiteContent.productsCards,
      caseStudiesSectionTag: row.case_studies_section_tag || defaultSiteContent.caseStudiesSectionTag,
      caseStudiesSectionTitle: row.case_studies_section_title || defaultSiteContent.caseStudiesSectionTitle,
      caseStudiesSectionDescription:
        row.case_studies_section_description || defaultSiteContent.caseStudiesSectionDescription,
      caseStudiesSectionCtaLabel:
        row.case_studies_section_cta_label || defaultSiteContent.caseStudiesSectionCtaLabel,
      caseStudiesCards: Array.isArray(row.case_studies_cards) && row.case_studies_cards.length > 0
        ? (row.case_studies_cards as SiteContent["caseStudiesCards"])
        : defaultSiteContent.caseStudiesCards,
      trustSectionTag: row.trust_section_tag || defaultSiteContent.trustSectionTag,
      trustSectionTitle: row.trust_section_title || defaultSiteContent.trustSectionTitle,
      trustLogoItems: Array.isArray(row.trust_logo_items) && row.trust_logo_items.length > 0
        ? (row.trust_logo_items as SiteContent["trustLogoItems"])
        : defaultSiteContent.trustLogoItems,
      trustTestimonials: Array.isArray(row.trust_testimonials) && row.trust_testimonials.length > 0
        ? (row.trust_testimonials as SiteContent["trustTestimonials"])
        : defaultSiteContent.trustTestimonials,
      processFaqSectionTag: row.process_faq_section_tag || defaultSiteContent.processFaqSectionTag,
      processFaqSectionTitle: row.process_faq_section_title || defaultSiteContent.processFaqSectionTitle,
      processFaqSectionDescription:
        row.process_faq_section_description || defaultSiteContent.processFaqSectionDescription,
      processSteps: Array.isArray(row.process_steps) && row.process_steps.length > 0
        ? (row.process_steps as SiteContent["processSteps"])
        : defaultSiteContent.processSteps,
      faqItems: Array.isArray(row.faq_items) && row.faq_items.length > 0
        ? (row.faq_items as SiteContent["faqItems"])
        : defaultSiteContent.faqItems,
      contactEmail: row.contact_email,
      contactPhone: row.contact_phone,
      socialLinks: Array.isArray(row.social_links) && row.social_links.length > 0
        ? (row.social_links as SiteContent["socialLinks"])
        : defaultSiteContent.socialLinks,
      aiName: row.ai_name,
      whatsappNumber: row.whatsapp_number,
    });
  } catch {
    return readFallbackContent();
  }
}

export async function writeSiteContent(input: Partial<SiteContent>): Promise<SiteContent> {
  const content = sanitizeSiteContent(input);
  try {
    await query(
      `
        UPDATE site_content
        SET hero_headline = $1, hero_highlight = $2, hero_tail = $3, hero_badge = $4,
            systems_section_tag = $5, systems_section_title = $6, systems_section_description = $7, systems_explore_cta_label = $8, systems_cards = $9::jsonb,
            services_section_tag = $10, services_section_title = $11, services_cards = $12::jsonb,
            products_section_tag = $13, products_section_title = $14, products_cards = $15::jsonb,
            case_studies_section_tag = $16, case_studies_section_title = $17, case_studies_section_description = $18, case_studies_section_cta_label = $19, case_studies_cards = $20::jsonb,
            trust_section_tag = $21, trust_section_title = $22, trust_logo_items = $23::jsonb, trust_testimonials = $24::jsonb,
            process_faq_section_tag = $25, process_faq_section_title = $26, process_faq_section_description = $27, process_steps = $28::jsonb, faq_items = $29::jsonb,
            contact_email = $30, contact_phone = $31, social_links = $32::jsonb, ai_name = $33, whatsapp_number = $34,
            updated_at = NOW()
        WHERE id = 1
      `,
      [
        content.heroHeadline,
        content.heroHighlight,
        content.heroTail,
        content.heroBadge,
        content.systemsSectionTag,
        content.systemsSectionTitle,
        content.systemsSectionDescription,
        content.systemsExploreCtaLabel,
        JSON.stringify(content.systemsCards),
        content.servicesSectionTag,
        content.servicesSectionTitle,
        JSON.stringify(content.servicesCards),
        content.productsSectionTag,
        content.productsSectionTitle,
        JSON.stringify(content.productsCards),
        content.caseStudiesSectionTag,
        content.caseStudiesSectionTitle,
        content.caseStudiesSectionDescription,
        content.caseStudiesSectionCtaLabel,
        JSON.stringify(content.caseStudiesCards),
        content.trustSectionTag,
        content.trustSectionTitle,
        JSON.stringify(content.trustLogoItems),
        JSON.stringify(content.trustTestimonials),
        content.processFaqSectionTag,
        content.processFaqSectionTitle,
        content.processFaqSectionDescription,
        JSON.stringify(content.processSteps),
        JSON.stringify(content.faqItems),
        content.contactEmail,
        content.contactPhone,
        JSON.stringify(content.socialLinks),
        content.aiName,
        content.whatsappNumber
      ]
    );
  } catch {
    await writeFallbackContent(content);
  }
  return content;
}
