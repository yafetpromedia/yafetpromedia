import type { Metadata } from "next";
import { readSiteContent } from "@backend/site-content";
import JsonLd from "@/components/seo/JsonLd";
import AboutYafetView from "@/sections/about/AboutYafetView";
import {
  CONTACT_CITY,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_E164,
  FOUNDER_NAME,
  SITE_NAME,
  breadcrumbJsonLd,
  buildPageMetadata,
  siteUrl,
  toE164Phone,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  const about = content.aboutYafet;
  const description =
    about.introBody.split(/\n\n+/).find(Boolean)?.trim() ||
    `${about.pageTitle} — ${about.pageSubtitle}. ${about.heroTagline}`;

  return buildPageMetadata({
    title: `About ${about.pageTitle} | ${SITE_NAME}`,
    description: `${description.slice(0, 130)} Contact ${CONTACT_PHONE_DISPLAY}.`.slice(0, 160),
    path: "/about/yafet",
    authors: [about.pageTitle || FOUNDER_NAME],
    keywords: [
      "Yafet Tesfaye",
      "Yafet",
      "Awud Digitals founder",
      "Yafet Tesfaye Awud Digitals",
      "0991185321",
      "+251991185321",
      CONTACT_EMAIL,
      "African software entrepreneur",
      "Ethiopia tech founder",
      "Addis Ababa",
      about.pageTitle,
    ],
  });
}

export default async function AboutYafetPage() {
  const content = await readSiteContent();
  const about = content.aboutYafet;
  const phone = toE164Phone(content.contactPhone) || CONTACT_PHONE_E164;
  const email = content.contactEmail?.trim() || CONTACT_EMAIL;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.pageTitle || FOUNDER_NAME,
    alternateName: ["Yafet", FOUNDER_NAME],
    jobTitle: about.pageSubtitle,
    description: about.heroTagline,
    url: siteUrl("/about/yafet"),
    email,
    telephone: phone,
    image: content.siteLogoSrc ? siteUrl(content.siteLogoSrc) : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: CONTACT_CITY,
      addressCountry: "ET",
    },
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
      telephone: phone,
      email,
    },
    nationality: "Ethiopian",
    knowsAbout: [
      "Software entrepreneurship",
      "Digital transformation",
      "Product design",
      "Mr.Software",
      "Chora",
      SITE_NAME,
    ],
  };

  const crumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: `About ${about.pageTitle}`, path: "/about/yafet" },
  ]);

  return (
    <>
      <JsonLd data={[personJsonLd, crumbs]} />
      <AboutYafetView
        about={about}
        siteLogoSrc={content.siteLogoSrc}
        ecosystemCards={content.ecosystemCards}
      />
    </>
  );
}
