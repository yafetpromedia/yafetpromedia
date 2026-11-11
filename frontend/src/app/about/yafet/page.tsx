import type { Metadata } from "next";
import { readSiteContent } from "@backend/site-content";
import JsonLd from "@/components/seo/JsonLd";
import AboutYafetView from "@/sections/about/AboutYafetView";
import { SITE_NAME, breadcrumbJsonLd, buildPageMetadata, siteUrl } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  const about = content.aboutYafet;
  const description =
    about.introBody.split(/\n\n+/).find(Boolean)?.trim() ||
    `${about.pageTitle} — ${about.pageSubtitle}. ${about.heroTagline}`;

  return buildPageMetadata({
    title: `About ${about.pageTitle} | ${SITE_NAME}`,
    description: description.slice(0, 160),
    path: "/about/yafet",
    keywords: [
      "Yafet Tesfaye",
      "Awud Digitals founder",
      "Yafet Tesfaye Awud Digitals",
      "African software entrepreneur",
      "Ethiopia tech founder",
      about.pageTitle,
    ],
  });
}

export default async function AboutYafetPage() {
  const content = await readSiteContent();
  const about = content.aboutYafet;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: about.pageTitle,
    jobTitle: about.pageSubtitle,
    description: about.heroTagline,
    url: siteUrl("/about/yafet"),
    image: content.siteLogoSrc ? siteUrl(content.siteLogoSrc) : undefined,
    worksFor: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
    },
    nationality: "Ethiopian",
    knowsAbout: [
      "Software entrepreneurship",
      "Digital transformation",
      "Product design",
      "Mr.Software",
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
