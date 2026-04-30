import {
  defaultSiteContent,
  HeroCarouselSlide,
  ProductCard,
  PublicationCard,
  SiteContent,
  SystemsCard,
  TestimonialCard,
  TrustLogoItem,
} from "@/lib/site-content.shared";
import { sanitizeExploreArchitecture } from "@/lib/explore-architecture.shared";
import { query } from "@db";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRepoRoot } from "./repo-root";

export type { SiteContent } from "@/lib/site-content.shared";
export { defaultSiteContent } from "@/lib/site-content.shared";

const fallbackPath = path.join(getRepoRoot(), ".data", "site-content.fallback.json");

/** Minimum one card; homepage grid supports up to this many tiles. */
const SERVICE_CARDS_MAX = 8;

function sanitizeServicesCards(raw: unknown): SiteContent["servicesCards"] {
  const def = defaultSiteContent.servicesCards;
  const arr = Array.isArray(raw) ? raw : [];
  const baseLen = arr.length > 0 ? arr.length : def.length;
  const len = Math.min(Math.max(baseLen, 1), SERVICE_CARDS_MAX);
  return Array.from({ length: len }, (_, index) => {
    const card = arr[index] as Partial<{ title: unknown; description: unknown; learnMore: unknown }> | undefined;
    const d = def[index % def.length]!;
    return {
      title: String(card?.title ?? d.title ?? "").slice(0, 120),
      description: String(card?.description ?? d.description ?? "").slice(0, 300),
      learnMore: String(card?.learnMore ?? d.learnMore ?? "").slice(0, 2500),
    };
  });
}

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

function safeHeroImageSrc(value: string, fallback: string): string {
  const t = String(value ?? "")
    .trim()
    .slice(0, 500);
  if (t.startsWith("/") && !t.startsWith("//") && !t.includes("..")) {
    return t;
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  return fallback;
}

/** Empty string allowed (no image). */
function sanitizeOptionalImageUrl(value: unknown): string {
  const t = String(value ?? "")
    .trim()
    .slice(0, 500);
  if (!t) {
    return "";
  }
  if (t.startsWith("/") && !t.startsWith("//") && !t.includes("..")) {
    return t;
  }
  if (/^https?:\/\//i.test(t)) {
    return t;
  }
  return "";
}

/** Safe link for product CTA: #anchor, /path, or https URL. */
function sanitizeProductHref(value: unknown): string {
  const t = String(value ?? "")
    .trim()
    .slice(0, 500);
  if (!t) return "";
  if (t.startsWith("#") && t.length < 200) return t;
  if (t.startsWith("/") && !t.startsWith("//") && !t.includes("..")) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return "";
}

function sanitizeTrustLogoItems(input: unknown): TrustLogoItem[] {
  const defaults = defaultSiteContent.trustLogoItems;
  if (!Array.isArray(input)) {
    return defaults;
  }
  if (input.length === 0) {
    return [];
  }
  const max = 12;
  const out: TrustLogoItem[] = [];
  for (let i = 0; i < Math.min(input.length, max); i += 1) {
    const item = input[i];
    const def = defaults[Math.min(i, defaults.length - 1)] ?? defaults[0]!;
    if (typeof item === "string") {
      const name = String(item).trim().slice(0, 80);
      if (name) {
        out.push({ name, imageSrc: "" });
      }
      continue;
    }
    if (item && typeof item === "object") {
      const o = item as Record<string, unknown>;
      const name = String(o.name ?? o.title ?? "").trim().slice(0, 80);
      const imageSrc = sanitizeOptionalImageUrl(o.imageSrc ?? o.src);
      const resolvedName = name || def.name;
      if (imageSrc || resolvedName) {
        out.push({
          name: resolvedName,
          imageSrc,
        });
      }
    }
  }
  return out.length > 0 ? out : defaults;
}

function sanitizeHeroCarouselSlides(input: unknown): HeroCarouselSlide[] {
  const defaults = defaultSiteContent.heroCarouselSlides;
  const raw = Array.isArray(input) && input.length > 0 ? (input as Partial<HeroCarouselSlide>[]) : null;
  const source: Partial<HeroCarouselSlide>[] = raw ?? defaults;
  const max = 8;
  const out: HeroCarouselSlide[] = [];
  for (let i = 0; i < Math.min(source.length, max); i += 1) {
    const item = source[i];
    const def = defaults[Math.min(i, defaults.length - 1)] ?? defaults[0];
    const id = String(item?.id ?? def.id ?? `slide-${i + 1}`)
      .replace(/[^a-zA-Z0-9-_]/g, "")
      .slice(0, 64);
    out.push({
      id: id || `slide-${i + 1}`,
      src: safeHeroImageSrc(String(item?.src ?? ""), def.src),
      alt: String(item?.alt ?? def.alt).slice(0, 200),
    });
  }
  if (out.length === 0) {
    return defaults;
  }
  return out;
}

export function sanitizeSiteContent(input: Partial<SiteContent>): SiteContent {
  const cards = Array.isArray(input.systemsCards) ? input.systemsCards : defaultSiteContent.systemsCards;
  const productCards = Array.isArray(input.productsCards) ? input.productsCards : defaultSiteContent.productsCards;
  const caseStudyCards = Array.isArray(input.caseStudiesCards)
    ? input.caseStudiesCards
    : defaultSiteContent.caseStudiesCards;
  const publicationCards = Array.isArray(input.publicationsCards)
    ? input.publicationsCards
    : defaultSiteContent.publicationsCards;
  const trustLogos = sanitizeTrustLogoItems(input.trustLogoItems);
  const trustTestimonials = Array.isArray(input.trustTestimonials)
    ? input.trustTestimonials
    : defaultSiteContent.trustTestimonials;
  const processSteps = Array.isArray(input.processSteps) ? input.processSteps : defaultSiteContent.processSteps;
  const faqItems = Array.isArray(input.faqItems) ? input.faqItems : defaultSiteContent.faqItems;
  const socialLinks = Array.isArray(input.socialLinks) ? input.socialLinks : defaultSiteContent.socialLinks;
  const siteLogoSanitized = sanitizeOptionalImageUrl(input.siteLogoSrc);
  return {
    exploreArchitecture: sanitizeExploreArchitecture(
      (input as Partial<SiteContent>).exploreArchitecture
    ),
    siteLogoSrc: siteLogoSanitized || defaultSiteContent.siteLogoSrc,
    heroHeadline: String(input.heroHeadline ?? defaultSiteContent.heroHeadline).slice(0, 120),
    heroHighlight: String(input.heroHighlight ?? defaultSiteContent.heroHighlight).slice(0, 80),
    heroTail: String(input.heroTail ?? defaultSiteContent.heroTail).slice(0, 120),
    heroBadge: String(input.heroBadge ?? defaultSiteContent.heroBadge).slice(0, 140),
    heroCarouselSlides: sanitizeHeroCarouselSlides(input.heroCarouselSlides),
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
      ).slice(0, 600),
      tag: String(card?.tag ?? defaultSiteContent.systemsCards[index]?.tag ?? "").slice(0, 40),
      imageSrc: sanitizeOptionalImageUrl(
        (card as Partial<SystemsCard>).imageSrc ?? defaultSiteContent.systemsCards[index]?.imageSrc
      ),
    })),
    servicesSectionTag: String(input.servicesSectionTag ?? defaultSiteContent.servicesSectionTag).slice(0, 120),
    servicesSectionTitle: String(input.servicesSectionTitle ?? defaultSiteContent.servicesSectionTitle).slice(0, 180),
    servicesCards: sanitizeServicesCards((input as Partial<SiteContent>).servicesCards),
    productsSectionTag: String(input.productsSectionTag ?? defaultSiteContent.productsSectionTag).slice(0, 120),
    productsSectionTitle: String(input.productsSectionTitle ?? defaultSiteContent.productsSectionTitle).slice(0, 180),
    productsSectionDescription: String(
      input.productsSectionDescription ?? defaultSiteContent.productsSectionDescription
    ).slice(0, 400),
    productsCatalogCtaLabel: String(
      input.productsCatalogCtaLabel ?? defaultSiteContent.productsCatalogCtaLabel
    ).slice(0, 80),
    productsCards: productCards.slice(0, 16).map((card, index) => {
      const def = defaultSiteContent.productsCards[Math.min(index, defaultSiteContent.productsCards.length - 1)]!;
      const p = card as Partial<ProductCard>;
      return {
        title: String(card?.title ?? def?.title ?? "").slice(0, 120),
        description: String(card?.description ?? def?.description ?? "").slice(0, 600),
        label: String(card?.label ?? def?.label ?? "").slice(0, 40),
        imageSrc: sanitizeOptionalImageUrl(p.imageSrc ?? def?.imageSrc),
        href: sanitizeProductHref(p.href ?? def?.href),
        linkLabel: String(p.linkLabel ?? def?.linkLabel ?? "Learn more").slice(0, 48),
        featured: Boolean(p.featured ?? def?.featured),
        learnMore: String(p.learnMore ?? def?.learnMore ?? "").slice(0, 2500),
      };
    }),
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
    caseStudiesCards: caseStudyCards.slice(0, 16).map((card, index) => ({
      title: String(card?.title ?? defaultSiteContent.caseStudiesCards[index]?.title ?? "").slice(0, 120),
      category: String(card?.category ?? defaultSiteContent.caseStudiesCards[index]?.category ?? "").slice(0, 80),
      problem: String(card?.problem ?? defaultSiteContent.caseStudiesCards[index]?.problem ?? "").slice(0, 300),
      solution: String(card?.solution ?? defaultSiteContent.caseStudiesCards[index]?.solution ?? "").slice(0, 300),
      result: String(card?.result ?? defaultSiteContent.caseStudiesCards[index]?.result ?? "").slice(0, 220),
      stat: String(card?.stat ?? defaultSiteContent.caseStudiesCards[index]?.stat ?? "").slice(0, 40),
      statLabel: String(card?.statLabel ?? defaultSiteContent.caseStudiesCards[index]?.statLabel ?? "").slice(0, 60),
    })),
    publicationsSectionTag: String(
      input.publicationsSectionTag ?? defaultSiteContent.publicationsSectionTag
    ).slice(0, 120),
    publicationsSectionTitle: String(
      input.publicationsSectionTitle ?? defaultSiteContent.publicationsSectionTitle
    ).slice(0, 180),
    publicationsSectionDescription: String(
      input.publicationsSectionDescription ?? defaultSiteContent.publicationsSectionDescription
    ).slice(0, 400),
    publicationsCatalogCtaLabel: String(
      input.publicationsCatalogCtaLabel ?? defaultSiteContent.publicationsCatalogCtaLabel
    ).slice(0, 80),
    publicationsCards: publicationCards.slice(0, 16).map((card, index) => {
      const def =
        defaultSiteContent.publicationsCards[Math.min(index, defaultSiteContent.publicationsCards.length - 1)]!;
      const p = card as Partial<PublicationCard>;
      return {
        title: String(p.title ?? def.title ?? "").slice(0, 200),
        category: String(p.category ?? def.category ?? "").slice(0, 80),
        dateLabel: String(p.dateLabel ?? def.dateLabel ?? "").slice(0, 80),
        readTime: String(p.readTime ?? def.readTime ?? "").slice(0, 40),
        imageSrc: sanitizeOptionalImageUrl(p.imageSrc ?? def.imageSrc),
        articleBody: String(p.articleBody ?? def.articleBody ?? "").slice(0, 12000),
        href: sanitizeProductHref(p.href ?? def.href),
      };
    }),
    trustSectionTag: String(input.trustSectionTag ?? defaultSiteContent.trustSectionTag).slice(0, 120),
    trustSectionTitle: String(input.trustSectionTitle ?? defaultSiteContent.trustSectionTitle).slice(0, 180),
    trustLogoItems: trustLogos,
    trustTestimonials: trustTestimonials.slice(0, 4).map((item, index) => {
      const t = item as Partial<TestimonialCard> & { quote?: string; author?: string; role?: string };
      const def = defaultSiteContent.trustTestimonials[Math.min(index, defaultSiteContent.trustTestimonials.length - 1)];
      const rawR = t.rating ?? def?.rating ?? 5;
      const rating = Math.min(5, Math.max(1, Math.round(Number(rawR)) || 5));
      return {
        quote: String(t?.quote ?? def?.quote ?? "").slice(0, 320),
        author: String(t?.author ?? def?.author ?? "").slice(0, 100),
        role: String(t?.role ?? def?.role ?? "").slice(0, 120),
        rating,
      };
    }),
    processFaqSectionTag: String(
      input.processFaqSectionTag ?? defaultSiteContent.processFaqSectionTag
    ).slice(0, 120),
    processFaqSectionTitle: String(
      input.processFaqSectionTitle ?? defaultSiteContent.processFaqSectionTitle
    ).slice(0, 180),
    processFaqSectionDescription: String(
      input.processFaqSectionDescription ?? defaultSiteContent.processFaqSectionDescription
    ).slice(0, 400),
    processFaqProcessCardLabel: String(
      input.processFaqProcessCardLabel ?? defaultSiteContent.processFaqProcessCardLabel
    ).slice(0, 80),
    processFaqFaqCardLabel: String(
      input.processFaqFaqCardLabel ?? defaultSiteContent.processFaqFaqCardLabel
    ).slice(0, 80),
    processSteps: processSteps
      .slice(0, 12)
      .map((item, index) => ({
        text: String(item?.text ?? defaultSiteContent.processSteps[index]?.text ?? "").slice(0, 180),
      }))
      .filter((s) => s.text.trim().length > 0),
    faqItems: faqItems
      .slice(0, 12)
      .map((item, index) => ({
        question: String(item?.question ?? defaultSiteContent.faqItems[index]?.question ?? "").slice(0, 180),
        answer: String(item?.answer ?? defaultSiteContent.faqItems[index]?.answer ?? "").slice(0, 320),
      }))
      .filter((f) => f.question.trim().length > 0),
    contactSectionTag: String(input.contactSectionTag ?? defaultSiteContent.contactSectionTag).slice(0, 120),
    contactSectionTitle: String(input.contactSectionTitle ?? defaultSiteContent.contactSectionTitle).slice(0, 200),
    contactSectionDescription: String(
      input.contactSectionDescription ?? defaultSiteContent.contactSectionDescription
    ).slice(0, 500),
    contactEmail: String(input.contactEmail ?? defaultSiteContent.contactEmail).slice(0, 120),
    contactPhone: String(
      input.contactPhone != null && String(input.contactPhone).trim() !== ""
        ? input.contactPhone
        : defaultSiteContent.contactPhone
    ).slice(0, 60),
    contactWhatsappLabel: String(
      input.contactWhatsappLabel ?? defaultSiteContent.contactWhatsappLabel
    ).slice(0, 80),
    contactNamePlaceholder: String(
      input.contactNamePlaceholder ?? defaultSiteContent.contactNamePlaceholder
    ).slice(0, 80),
    contactEmailPlaceholder: String(
      input.contactEmailPlaceholder ?? defaultSiteContent.contactEmailPlaceholder
    ).slice(0, 80),
    contactCompanyPlaceholder: String(
      input.contactCompanyPlaceholder ?? defaultSiteContent.contactCompanyPlaceholder
    ).slice(0, 80),
    contactLeadPhonePlaceholder: String(
      input.contactLeadPhonePlaceholder ?? defaultSiteContent.contactLeadPhonePlaceholder
    ).slice(0, 80),
    contactMessagePlaceholder: String(
      input.contactMessagePlaceholder ?? defaultSiteContent.contactMessagePlaceholder
    ).slice(0, 200),
    contactSubmitLabel: String(input.contactSubmitLabel ?? defaultSiteContent.contactSubmitLabel).slice(0, 80),
    contactReplyNote: String(input.contactReplyNote ?? defaultSiteContent.contactReplyNote).slice(0, 200),
    loginPasswordResetHelp: String(
      input.loginPasswordResetHelp ?? defaultSiteContent.loginPasswordResetHelp
    ).slice(0, 2500),
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
      hero_carousel_slides: unknown;
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
      products_section_description: string;
      products_catalog_cta_label: string;
      products_cards: unknown;
      case_studies_section_tag: string;
      case_studies_section_title: string;
      case_studies_section_description: string;
      case_studies_section_cta_label: string;
      case_studies_cards: unknown;
      publications_section_tag?: string | null;
      publications_section_title?: string | null;
      publications_section_description?: string | null;
      publications_catalog_cta_label?: string | null;
      publications_cards?: unknown;
      trust_section_tag: string;
      trust_section_title: string;
      trust_logo_items: unknown;
      trust_testimonials: unknown;
      process_faq_section_tag: string;
      process_faq_section_title: string;
      process_faq_section_description: string;
      process_faq_process_card_label?: string | null;
      process_faq_faq_card_label?: string | null;
      process_steps: unknown;
      faq_items: unknown;
      contact_section_tag?: string | null;
      contact_section_title?: string | null;
      contact_section_description?: string | null;
      contact_whatsapp_label?: string | null;
      contact_reply_note?: string | null;
      contact_submit_label?: string | null;
      contact_name_placeholder?: string | null;
      contact_email_placeholder?: string | null;
      contact_company_placeholder?: string | null;
      contact_lead_phone_placeholder?: string | null;
      contact_message_placeholder?: string | null;
      login_password_reset_help?: string | null;
      contact_email: string;
      contact_phone: string;
      social_links: unknown;
      ai_name: string;
      whatsapp_number: string;
      site_logo_src: string;
      explore_architecture: unknown;
    }>(
      `
        SELECT hero_headline, hero_highlight, hero_tail, hero_badge, hero_carousel_slides,
               systems_section_tag, systems_section_title, systems_section_description, systems_explore_cta_label, systems_cards,
               services_section_tag, services_section_title, services_cards,
               products_section_tag, products_section_title, products_section_description, products_catalog_cta_label, products_cards,
               case_studies_section_tag, case_studies_section_title, case_studies_section_description, case_studies_section_cta_label, case_studies_cards,
               publications_section_tag, publications_section_title, publications_section_description, publications_catalog_cta_label, publications_cards,
               trust_section_tag, trust_section_title, trust_logo_items, trust_testimonials,
               process_faq_section_tag, process_faq_section_title, process_faq_section_description,
               process_faq_process_card_label, process_faq_faq_card_label,
               process_steps, faq_items,
               contact_section_tag, contact_section_title, contact_section_description,
               contact_whatsapp_label, contact_reply_note, contact_submit_label,
               contact_name_placeholder, contact_email_placeholder, contact_company_placeholder, contact_lead_phone_placeholder, contact_message_placeholder,
               login_password_reset_help,
               contact_email, contact_phone, social_links, ai_name, whatsapp_number, site_logo_src, explore_architecture
        FROM site_content WHERE id = 1
      `
    );
    const row = rows[0];
    if (!row) return readFallbackContent();

    return sanitizeSiteContent({
      siteLogoSrc: row.site_logo_src,
      heroHeadline: row.hero_headline,
      heroHighlight: row.hero_highlight,
      heroTail: row.hero_tail,
      heroBadge: row.hero_badge,
      heroCarouselSlides: Array.isArray(row.hero_carousel_slides)
        ? (row.hero_carousel_slides as SiteContent["heroCarouselSlides"])
        : undefined,
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
      productsSectionDescription:
        row.products_section_description ?? defaultSiteContent.productsSectionDescription,
      productsCatalogCtaLabel:
        row.products_catalog_cta_label ?? defaultSiteContent.productsCatalogCtaLabel,
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
      publicationsSectionTag:
        row.publications_section_tag || defaultSiteContent.publicationsSectionTag,
      publicationsSectionTitle:
        row.publications_section_title || defaultSiteContent.publicationsSectionTitle,
      publicationsSectionDescription:
        row.publications_section_description || defaultSiteContent.publicationsSectionDescription,
      publicationsCatalogCtaLabel:
        row.publications_catalog_cta_label || defaultSiteContent.publicationsCatalogCtaLabel,
      publicationsCards:
        Array.isArray(row.publications_cards) && row.publications_cards.length > 0
          ? (row.publications_cards as SiteContent["publicationsCards"])
          : defaultSiteContent.publicationsCards,
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
      processFaqProcessCardLabel:
        row.process_faq_process_card_label ?? defaultSiteContent.processFaqProcessCardLabel,
      processFaqFaqCardLabel:
        row.process_faq_faq_card_label ?? defaultSiteContent.processFaqFaqCardLabel,
      processSteps: Array.isArray(row.process_steps)
        ? (row.process_steps as SiteContent["processSteps"])
        : defaultSiteContent.processSteps,
      faqItems: Array.isArray(row.faq_items)
        ? (row.faq_items as SiteContent["faqItems"])
        : defaultSiteContent.faqItems,
      contactSectionTag: row.contact_section_tag || defaultSiteContent.contactSectionTag,
      contactSectionTitle: row.contact_section_title || defaultSiteContent.contactSectionTitle,
      contactSectionDescription:
        row.contact_section_description || defaultSiteContent.contactSectionDescription,
      contactWhatsappLabel: row.contact_whatsapp_label || defaultSiteContent.contactWhatsappLabel,
      contactReplyNote: row.contact_reply_note || defaultSiteContent.contactReplyNote,
      contactSubmitLabel: row.contact_submit_label || defaultSiteContent.contactSubmitLabel,
      contactNamePlaceholder: row.contact_name_placeholder || defaultSiteContent.contactNamePlaceholder,
      contactEmailPlaceholder: row.contact_email_placeholder || defaultSiteContent.contactEmailPlaceholder,
      contactCompanyPlaceholder: row.contact_company_placeholder || defaultSiteContent.contactCompanyPlaceholder,
      contactLeadPhonePlaceholder:
        row.contact_lead_phone_placeholder || defaultSiteContent.contactLeadPhonePlaceholder,
      contactMessagePlaceholder: row.contact_message_placeholder || defaultSiteContent.contactMessagePlaceholder,
      loginPasswordResetHelp:
        row.login_password_reset_help ?? defaultSiteContent.loginPasswordResetHelp,
      contactEmail: row.contact_email,
      contactPhone:
        row.contact_phone != null && String(row.contact_phone).trim() !== ""
          ? String(row.contact_phone)
          : defaultSiteContent.contactPhone,
      socialLinks: Array.isArray(row.social_links) && row.social_links.length > 0
        ? (row.social_links as SiteContent["socialLinks"])
        : defaultSiteContent.socialLinks,
      aiName: row.ai_name,
      whatsappNumber: row.whatsapp_number,
      exploreArchitecture: row.explore_architecture as SiteContent["exploreArchitecture"] | undefined,
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
        SET hero_headline = $1, hero_highlight = $2, hero_tail = $3, hero_badge = $4, hero_carousel_slides = $5::jsonb,
            systems_section_tag = $6, systems_section_title = $7, systems_section_description = $8, systems_explore_cta_label = $9, systems_cards = $10::jsonb,
            services_section_tag = $11, services_section_title = $12, services_cards = $13::jsonb,
            products_section_tag = $14, products_section_title = $15, products_section_description = $16, products_catalog_cta_label = $17, products_cards = $18::jsonb,
            case_studies_section_tag = $19, case_studies_section_title = $20, case_studies_section_description = $21, case_studies_section_cta_label = $22, case_studies_cards = $23::jsonb,
            publications_section_tag = $24, publications_section_title = $25, publications_section_description = $26, publications_catalog_cta_label = $27, publications_cards = $28::jsonb,
            trust_section_tag = $29, trust_section_title = $30, trust_logo_items = $31::jsonb, trust_testimonials = $32::jsonb,
            process_faq_section_tag = $33, process_faq_section_title = $34, process_faq_section_description = $35, process_steps = $36::jsonb, faq_items = $37::jsonb,
            contact_email = $38, contact_phone = $39, social_links = $40::jsonb, ai_name = $41, whatsapp_number = $42, explore_architecture = $43::jsonb,
            process_faq_process_card_label = $44, process_faq_faq_card_label = $45,
            contact_section_tag = $46, contact_section_title = $47, contact_section_description = $48,
            contact_whatsapp_label = $49, contact_reply_note = $50, contact_submit_label = $51,
            contact_name_placeholder = $52, contact_email_placeholder = $53, contact_company_placeholder = $54, contact_message_placeholder = $55,
            contact_lead_phone_placeholder = $56,
            login_password_reset_help = $57,
            site_logo_src = $58,
            updated_at = NOW()
        WHERE id = 1
      `,
      [
        content.heroHeadline,
        content.heroHighlight,
        content.heroTail,
        content.heroBadge,
        JSON.stringify(content.heroCarouselSlides),
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
        content.productsSectionDescription,
        content.productsCatalogCtaLabel,
        JSON.stringify(content.productsCards),
        content.caseStudiesSectionTag,
        content.caseStudiesSectionTitle,
        content.caseStudiesSectionDescription,
        content.caseStudiesSectionCtaLabel,
        JSON.stringify(content.caseStudiesCards),
        content.publicationsSectionTag,
        content.publicationsSectionTitle,
        content.publicationsSectionDescription,
        content.publicationsCatalogCtaLabel,
        JSON.stringify(content.publicationsCards),
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
        content.whatsappNumber,
        JSON.stringify(content.exploreArchitecture),
        content.processFaqProcessCardLabel,
        content.processFaqFaqCardLabel,
        content.contactSectionTag,
        content.contactSectionTitle,
        content.contactSectionDescription,
        content.contactWhatsappLabel,
        content.contactReplyNote,
        content.contactSubmitLabel,
        content.contactNamePlaceholder,
        content.contactEmailPlaceholder,
        content.contactCompanyPlaceholder,
        content.contactMessagePlaceholder,
        content.contactLeadPhonePlaceholder,
        content.loginPasswordResetHelp,
        content.siteLogoSrc,
      ]
    );
  } catch {
    await writeFallbackContent(content);
  }
  return content;
}
