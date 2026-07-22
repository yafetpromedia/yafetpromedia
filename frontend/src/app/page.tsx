import type { Metadata } from "next";
import { readSiteContent } from "@backend/site-content";
import JsonLd from "@/components/seo/JsonLd";
import Hero from "@/sections/home/Hero";
import EcosystemSection from "@/sections/home/EcosystemSection";
import SystemsOverview from "@/sections/home/SystemsOverview";
import ServicesGrid from "@/sections/home/ServicesGrid";
import ProductsPreview from "@/sections/home/ProductsPreview";
import CaseStudiesPreview from "@/sections/home/CaseStudiesPreview";
import AuthorityPreview from "@/sections/home/AuthorityPreview";
import TrustSection from "@/sections/home/TrustSection";
import ProcessAndFaq from "@/sections/home/ProcessAndFaq";
import ContactSection from "@/sections/home/ContactSection";
import CTASection from "@/sections/home/CTASection";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  buildPageMetadata,
  siteUrl,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  const headline = [content.heroHeadline, content.heroHighlight, content.heroTail]
    .filter(Boolean)
    .join(" ")
    .trim();
  const description =
    content.heroBadge?.trim() ||
    content.aboutYafet.heroTagline?.trim() ||
    DEFAULT_DESCRIPTION;

  return buildPageMetadata({
    title: headline ? `${headline} | ${SITE_NAME}` : DEFAULT_TITLE,
    description,
    path: "/",
  });
}

export default async function Home() {
  const content = await readSiteContent();
  const origin = siteUrl();

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: origin,
    logo: siteUrl("/icon"),
    description: DEFAULT_DESCRIPTION,
    email: content.contactEmail,
    telephone: content.contactPhone || undefined,
    sameAs: content.socialLinks
      ?.filter((link) => link.enabled && link.url.startsWith("http"))
      .map((link) => link.url),
    founder: {
      "@type": "Person",
      name: content.aboutYafet.pageTitle,
      jobTitle: content.aboutYafet.pageSubtitle,
    },
    areaServed: ["Ethiopia", "Africa", "Worldwide"],
    knowsAbout: [
      "Software Development",
      "Web Development",
      "Mobile App Development",
      "Artificial Intelligence",
      "Cloud Solutions",
      "UI/UX Design",
      "Branding",
      "Digital Transformation",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: origin,
    description: DEFAULT_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: SITE_NAME,
    url: origin,
    description: DEFAULT_DESCRIPTION,
    email: content.contactEmail,
    telephone: content.contactPhone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    priceRange: "$$",
  };

  return (
    <main>
      <JsonLd data={[organizationJsonLd, websiteJsonLd, localBusinessJsonLd]} />
      <Hero />
      <EcosystemSection />
      <SystemsOverview />
      <ServicesGrid />
      <ProductsPreview />
      <CaseStudiesPreview />
      <AuthorityPreview />
      <TrustSection />
      <ProcessAndFaq />
      <ContactSection />
      <CTASection />
    </main>
  );
}
