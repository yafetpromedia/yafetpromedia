import type { Metadata } from "next";
import { readSiteContent } from "@backend/site-content";
import JsonLd from "@/components/seo/JsonLd";
import Hero from "@/sections/home/Hero";
import EcosystemSection from "@/sections/home/EcosystemSection";
import SystemsOverview from "@/sections/home/SystemsOverview";
import ServicesGrid from "@/sections/home/ServicesGrid";
import ProductsPreview from "@/sections/home/ProductsPreview";
import PricingSection from "@/sections/home/PricingSection";
import CaseStudiesPreview from "@/sections/home/CaseStudiesPreview";
import TrustSection from "@/sections/home/TrustSection";
import ProcessAndFaq from "@/sections/home/ProcessAndFaq";
import BookCallSection from "@/sections/home/BookCallSection";
import ContactSection from "@/sections/home/ContactSection";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_NAME,
  buildPageMetadata,
  faqJsonLd,
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

  const sameAs = content.socialLinks
    ?.filter((link) => link.enabled && link.url.startsWith("http"))
    .map((link) => link.url);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${origin}/#organization`,
    name: SITE_NAME,
    legalName: SITE_NAME,
    url: origin,
    logo: {
      "@type": "ImageObject",
      url: siteUrl("/icon"),
      width: 512,
      height: 512,
    },
    image: siteUrl("/opengraph-image"),
    description: DEFAULT_DESCRIPTION,
    email: content.contactEmail,
    telephone: content.contactPhone || undefined,
    sameAs,
    foundingLocation: {
      "@type": "Place",
      name: "Addis Ababa, Ethiopia",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: content.contactEmail,
        telephone: content.contactPhone || undefined,
        areaServed: ["ET", "Africa", "Worldwide"],
        availableLanguage: ["English", "Amharic"],
      },
    ],
    founder: {
      "@type": "Person",
      name: content.aboutYafet.pageTitle,
      jobTitle: content.aboutYafet.pageSubtitle,
      url: siteUrl("/about/yafet"),
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
    "@id": `${origin}/#website`,
    name: SITE_NAME,
    url: origin,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-US",
    publisher: { "@id": `${origin}/#organization` },
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${origin}/#localbusiness`,
    name: SITE_NAME,
    url: origin,
    description: DEFAULT_DESCRIPTION,
    email: content.contactEmail,
    telephone: content.contactPhone || undefined,
    image: siteUrl("/opengraph-image"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 9.03,
      longitude: 38.74,
    },
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    parentOrganization: { "@id": `${origin}/#organization` },
  };

  const serviceListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services",
    itemListElement: content.servicesCards.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        provider: { "@id": `${origin}/#organization` },
        areaServed: ["Ethiopia", "Africa", "Worldwide"],
      },
    })),
  };

  const faqData = faqJsonLd(
    (content.faqItems ?? []).map((item) => ({
      question: item.question,
      answer: item.answer,
    }))
  );

  const jsonLd = [
    organizationJsonLd,
    websiteJsonLd,
    localBusinessJsonLd,
    serviceListJsonLd,
    ...(faqData ? [faqData] : []),
  ];

  return (
    <main>
      <JsonLd data={jsonLd} />
      <Hero />
      <EcosystemSection />
      <SystemsOverview />
      <ServicesGrid />
      <ProductsPreview />
      <PricingSection />
      <CaseStudiesPreview />
      <TrustSection />
      <ProcessAndFaq />
      <BookCallSection />
      <ContactSection />
    </main>
  );
}
