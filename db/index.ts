import { createHash } from "node:crypto";
import { Pool } from "pg";
import { defaultSiteContent } from "@/lib/site-content.shared";
let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

function hashPassword(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Configure PostgreSQL connection in .env.local.");
  }
  pool = new Pool({ connectionString });
  return pool;
}

async function ensureSchema() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      hero_headline TEXT NOT NULL,
      hero_highlight TEXT NOT NULL,
      hero_tail TEXT NOT NULL,
      hero_badge TEXT NOT NULL,
      systems_section_tag TEXT NOT NULL DEFAULT '',
      systems_section_title TEXT NOT NULL DEFAULT '',
      systems_section_description TEXT NOT NULL DEFAULT '',
      systems_explore_cta_label TEXT NOT NULL DEFAULT '',
      systems_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
      services_section_tag TEXT NOT NULL DEFAULT '',
      services_section_title TEXT NOT NULL DEFAULT '',
      services_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
      products_section_tag TEXT NOT NULL DEFAULT '',
      products_section_title TEXT NOT NULL DEFAULT '',
      products_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
      case_studies_section_tag TEXT NOT NULL DEFAULT '',
      case_studies_section_title TEXT NOT NULL DEFAULT '',
      case_studies_section_description TEXT NOT NULL DEFAULT '',
      case_studies_section_cta_label TEXT NOT NULL DEFAULT '',
      case_studies_cards JSONB NOT NULL DEFAULT '[]'::jsonb,
      trust_section_tag TEXT NOT NULL DEFAULT '',
      trust_section_title TEXT NOT NULL DEFAULT '',
      trust_logo_items JSONB NOT NULL DEFAULT '[]'::jsonb,
      trust_testimonials JSONB NOT NULL DEFAULT '[]'::jsonb,
      process_faq_section_tag TEXT NOT NULL DEFAULT '',
      process_faq_section_title TEXT NOT NULL DEFAULT '',
      process_faq_section_description TEXT NOT NULL DEFAULT '',
      process_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
      faq_items JSONB NOT NULL DEFAULT '[]'::jsonb,
      contact_section_tag TEXT NOT NULL DEFAULT '',
      contact_section_title TEXT NOT NULL DEFAULT '',
      contact_section_description TEXT NOT NULL DEFAULT '',
      contact_whatsapp_label TEXT NOT NULL DEFAULT '',
      contact_reply_note TEXT NOT NULL DEFAULT '',
      contact_submit_label TEXT NOT NULL DEFAULT '',
      contact_name_placeholder TEXT NOT NULL DEFAULT '',
      contact_email_placeholder TEXT NOT NULL DEFAULT '',
      contact_company_placeholder TEXT NOT NULL DEFAULT '',
      contact_message_placeholder TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL,
      contact_phone TEXT NOT NULL,
      social_links JSONB NOT NULL DEFAULT '[]'::jsonb,
      ai_name TEXT NOT NULL,
      whatsapp_number TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_logs (
      id SERIAL PRIMARY KEY,
      user_message TEXT NOT NULL,
      ai_reply TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS testimonial_submissions (
      id SERIAL PRIMARY KEY,
      quote TEXT NOT NULL,
      author TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      rating SMALLINT NOT NULL DEFAULT 5,
      status TEXT NOT NULL DEFAULT 'pending',
      approved_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await getPool().query(`
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS systems_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS systems_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS systems_section_description TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS systems_explore_cta_label TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS systems_cards JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS services_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS services_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS services_cards JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS products_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS products_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS products_cards JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS case_studies_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS case_studies_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS case_studies_section_description TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS case_studies_section_cta_label TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS case_studies_cards JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS trust_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS trust_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS trust_logo_items JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS trust_testimonials JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS process_faq_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS process_faq_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS process_faq_section_description TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS process_steps JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS faq_items JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_section_description TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_whatsapp_label TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_reply_note TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_submit_label TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_name_placeholder TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_email_placeholder TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_company_placeholder TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_message_placeholder TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS hero_carousel_slides JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS explore_architecture JSONB NOT NULL DEFAULT '{}'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS products_section_description TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS products_catalog_cta_label TEXT NOT NULL DEFAULT 'EXPLORE ALL PRODUCTS';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS publications_section_tag TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS publications_section_title TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS publications_section_description TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS publications_catalog_cta_label TEXT NOT NULL DEFAULT 'VIEW ALL PUBLICATIONS';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS publications_cards JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE testimonial_submissions ADD COLUMN IF NOT EXISTS rating SMALLINT NOT NULL DEFAULT 5;
    ALTER TABLE testimonial_submissions ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
    ALTER TABLE testimonial_submissions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ NULL;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS process_faq_process_card_label TEXT NOT NULL DEFAULT 'Process';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS process_faq_faq_card_label TEXT NOT NULL DEFAULT 'FAQ';
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
    ALTER TABLE leads ADD COLUMN IF NOT EXISTS handled BOOLEAN NOT NULL DEFAULT false;
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'owner';
    ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '[]'::jsonb;
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS contact_lead_phone_placeholder TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS login_password_reset_help TEXT NOT NULL DEFAULT '';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS site_logo_src TEXT NOT NULL DEFAULT '';
  `);
}

async function seedInitialData() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@yafetpromedia.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@12345";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? hashPassword(adminPassword);

  await getPool().query(
    `
      INSERT INTO admin_users (email, password_hash)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
    `,
    [adminEmail, passwordHash]
  );

  await getPool().query(
    `
      INSERT INTO site_content (
        id, hero_headline, hero_highlight, hero_tail, hero_badge,
        systems_section_tag, systems_section_title, systems_section_description, systems_explore_cta_label, systems_cards,
        services_section_tag, services_section_title, services_cards,
        products_section_tag, products_section_title, products_section_description, products_catalog_cta_label, products_cards,
        case_studies_section_tag, case_studies_section_title, case_studies_section_description, case_studies_section_cta_label, case_studies_cards,
        trust_section_tag, trust_section_title, trust_logo_items, trust_testimonials,
        process_faq_section_tag, process_faq_section_title, process_faq_section_description, process_steps, faq_items,
        contact_email, contact_phone, social_links, ai_name, whatsapp_number
      ) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12::jsonb, $13, $14, $15, $16, $17::jsonb, $18, $19, $20, $21, $22::jsonb, $23, $24, $25::jsonb, $26::jsonb, $27, $28, $29, $30::jsonb, $31::jsonb, $32, $33, $34::jsonb, $35, $36)
      ON CONFLICT (id) DO NOTHING
    `,
    [
      defaultSiteContent.heroHeadline,
      defaultSiteContent.heroHighlight,
      defaultSiteContent.heroTail,
      defaultSiteContent.heroBadge,
      defaultSiteContent.systemsSectionTag,
      defaultSiteContent.systemsSectionTitle,
      defaultSiteContent.systemsSectionDescription,
      defaultSiteContent.systemsExploreCtaLabel,
      JSON.stringify(defaultSiteContent.systemsCards),
      defaultSiteContent.servicesSectionTag,
      defaultSiteContent.servicesSectionTitle,
      JSON.stringify(defaultSiteContent.servicesCards),
      defaultSiteContent.productsSectionTag,
      defaultSiteContent.productsSectionTitle,
      defaultSiteContent.productsSectionDescription,
      defaultSiteContent.productsCatalogCtaLabel,
      JSON.stringify(defaultSiteContent.productsCards),
      defaultSiteContent.caseStudiesSectionTag,
      defaultSiteContent.caseStudiesSectionTitle,
      defaultSiteContent.caseStudiesSectionDescription,
      defaultSiteContent.caseStudiesSectionCtaLabel,
      JSON.stringify(defaultSiteContent.caseStudiesCards),
      defaultSiteContent.trustSectionTag,
      defaultSiteContent.trustSectionTitle,
      JSON.stringify(defaultSiteContent.trustLogoItems),
      JSON.stringify(defaultSiteContent.trustTestimonials),
      defaultSiteContent.processFaqSectionTag,
      defaultSiteContent.processFaqSectionTitle,
      defaultSiteContent.processFaqSectionDescription,
      JSON.stringify(defaultSiteContent.processSteps),
      JSON.stringify(defaultSiteContent.faqItems),
      defaultSiteContent.contactEmail,
      defaultSiteContent.contactPhone,
      JSON.stringify(defaultSiteContent.socialLinks),
      defaultSiteContent.aiName,
      defaultSiteContent.whatsappNumber,
    ]
  );
}

async function initDb() {
  if (!initPromise) {
    initPromise = (async () => {
      await ensureSchema();
      await seedInitialData();
    })();
  }
  await initPromise;
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []) {
  await initDb();
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export function hashAdminPassword(input: string) {
  return hashPassword(input);
}
