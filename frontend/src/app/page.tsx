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
  CONTACT_CITY,
  CONTACT_COUNTRY,
  CONTACT_EMAIL,
  CONTACT_PHONE_E164,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  FOUNDER_NAME,
  SITE_NAME,
  SITE_SLOGAN,
  buildPageMetadata,
  faqJsonLd,
  siteUrl,
  toE164Phone,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  const headline = [content.heroHeadline, content.heroHighlight, content.heroTail]
    .filter(Boolean)
    .join(" ")
    .trim();
  return buildPageMetadata({
    title: headline ? `${headline} | ${SITE_NAME}` : DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: "/",
  });
}

export default async function Home() {
  const content = await readSiteContent();
  const origin = siteUrl();

  const sameAs = content.socialLinks
    ?.filter((link) => link.enabled && link.url.startsWith("http"))
    .map((link) => link.url);

  const phone = toE164Phone(content.contactPhone) || CONTACT_PHONE_E164;
  const email = content.contactEmail?.trim() || CONTACT_EMAIL;
  const founderName = content.aboutYafet.pageTitle?.trim() || FOUNDER_NAME;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${origin}/#founder`,
    name: founderName,
    alternateName: ["Yafet", "Yafet Tesfaye"],
    jobTitle: content.aboutYafet.pageSubtitle || `Founder of ${SITE_NAME}`,
    description: content.aboutYafet.heroTagline || DEFAULT_DESCRIPTION,
    url: siteUrl("/about/yafet"),
    email,
    telephone: phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT_CITY,
      addressCountry: "ET",
    },
    nationality: "Ethiopian",
    worksFor: { "@id": `${origin}/#organization` },
    founder: { "@id": `${origin}/#organization` },
    sameAs,
    knowsAbout: [
      "Software Development",
      "Entrepreneurship",
      "Digital Transformation",
      "Mr.Software",
      "Chora",
      SITE_NAME,
    ],
  };

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
    slogan: SITE_SLOGAN,
    email,
    telephone: phone,
    sameAs,
    foundingLocation: {
      "@type": "Place",
      name: `${CONTACT_CITY}, ${CONTACT_COUNTRY}`,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email,
        telephone: phone,
        areaServed: ["ET", "Africa", "Worldwide"],
        availableLanguage: ["English", "Amharic"],
      },
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email,
        telephone: phone,
        areaServed: ["ET", "Africa", "Worldwide"],
        availableLanguage: ["English", "Amharic"],
      },
    ],
    founder: { "@id": `${origin}/#founder` },
    employee: { "@id": `${origin}/#founder` },
    areaServed: [CONTACT_COUNTRY, "Africa", "Worldwide"],
    knowsAbout: [
      "Software Development",
      "Web Development",
      "Mobile App Development",
      "Artificial Intelligence",
      "Cloud Solutions",
      "UI/UX Design",
      "Branding",
      "Digital Transformation",
      "Mr.Software",
      "Chora",
      "Best digital agency Ethiopia",
      "Enterprise software",
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
    author: { "@id": `${origin}/#founder` },
  };

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${origin}/#localbusiness`,
    name: SITE_NAME,
    url: origin,
    description: DEFAULT_DESCRIPTION,
    email,
    telephone: phone,
    image: siteUrl("/opengraph-image"),
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT_CITY,
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
    founder: { "@id": `${origin}/#founder` },
    slogan: SITE_SLOGAN,
    areaServed: [CONTACT_COUNTRY, "Africa", "Worldwide"],
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
    personJsonLd,
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
