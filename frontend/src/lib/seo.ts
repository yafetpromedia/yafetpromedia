import type { Metadata } from "next";

export const SITE_NAME = "Awud Digitals";
export const SITE_TAGLINE = "Building the Future, Digitally.";
export const DEFAULT_TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  "Awud Digitals is a technology company founded and owned by Yafet Tesfaye, focused on building modern digital solutions for businesses, schools, startups, and organizations. We specialize in software development, artificial intelligence, cloud solutions, web and mobile applications, UI/UX design, branding, and digital transformation.";

export const DEFAULT_KEYWORDS = [
  "Awud Digitals",
  "Yafet Tesfaye",
  "digital agency Ethiopia",
  "web development Addis Ababa",
  "website design Ethiopia",
  "Mr.Software",
  "Chora",
  "business automation",
  "branding and media production",
  "ecommerce development",
  "SaaS development Africa",
  "digital infrastructure",
  "growth marketing",
  "software company Ethiopia",
  "AI solutions Africa",
];

const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

/** Canonical site origin — set NEXT_PUBLIC_SITE_URL in production (e.g. https://awuddigitals.com). */
export function siteUrl(path = ""): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://awuddigitals.com"
  ).replace(/\/$/, "");
  const origin = base.startsWith("http") ? base : `https://${base}`;
  if (!path) return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absoluteUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return siteUrl(path.startsWith("/") ? path : `/${path}`);
}

export function defaultOgImage(): string {
  const custom = process.env.NEXT_PUBLIC_OG_IMAGE?.trim();
  if (custom) return absoluteUrl(custom);
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
}

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

function siteVerification(): Metadata["verification"] | undefined {
  const google =
    process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
    process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing =
    process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() ||
    process.env.BING_SITE_VERIFICATION?.trim();
  const yandex =
    process.env.NEXT_PUBLIC_YANDEX_VERIFICATION?.trim() ||
    process.env.YANDEX_VERIFICATION?.trim();
  if (!google && !bing && !yandex) return undefined;
  return {
    ...(google ? { google } : {}),
    ...(bing ? { other: { "msvalidate.01": bing } } : {}),
    ...(yandex ? { yandex } : {}),
  };
}

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = DEFAULT_KEYWORDS,
  ogImage,
  ogType = "website",
  noIndex = false,
  publishedTime,
  modifiedTime,
  authors,
}: PageMetadataInput = {}): Metadata {
  const pageTitle = title?.trim() || DEFAULT_TITLE;
  const canonical = siteUrl(path);
  const image = ogImage ? absoluteUrl(ogImage) : defaultOgImage();
  const isArticle = ogType === "article";
  const verification = siteVerification();

  return {
    // absolute avoids double "| Awud Digitals" when root uses a title template
    title: { absolute: pageTitle },
    description,
    keywords,
    authors: authors?.map((name) => ({ name })) ?? [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(siteUrl()),
    alternates: {
      canonical,
      languages: {
        "en-US": canonical,
        "x-default": canonical,
      },
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: ogType,
      locale: "en_US",
      alternateLocale: ["am_ET"],
      url: canonical,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: pageTitle,
          type: "image/png",
        },
      ],
      ...(isArticle && publishedTime ? { publishedTime } : {}),
      ...(isArticle && modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image],
      creator: "@awuddigitals",
      site: "@awuddigitals",
    },
    category: "technology",
    ...(verification ? { verification } : {}),
  };
}

/** BreadcrumbList JSON-LD helper */
export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  };
}

/** FAQPage JSON-LD helper */
export function faqJsonLd(
  items: { question: string; answer: string }[]
): Record<string, unknown> | null {
  const cleaned = items
    .map((item) => ({
      question: item.question.trim(),
      answer: item.answer.trim(),
    }))
    .filter((item) => item.question && item.answer);
  if (cleaned.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: cleaned.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export const rootMetadata: Metadata = {
  ...buildPageMetadata(),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "32x32" },
      { url: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icon"],
  },
  manifest: "/manifest.webmanifest",
  other: {
    "geo.region": "ET-AA",
    "geo.placename": "Addis Ababa",
    "geo.position": "9.03;38.74",
    ICBM: "9.03, 38.74",
  },
};
