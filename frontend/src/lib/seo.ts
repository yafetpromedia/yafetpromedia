import type { Metadata } from "next";

export const SITE_NAME = "YafetPromedia";
export const SITE_TAGLINE = "Digital Infrastructure & System Solutions";
export const DEFAULT_TITLE = `${SITE_NAME} | ${SITE_TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  "YafetPromedia builds complete digital systems — websites, automation, branding, media, and growth infrastructure for businesses in Ethiopia, Africa, and worldwide. Powered by Mr.Software.";

export const DEFAULT_KEYWORDS = [
  "YafetPromedia",
  "digital agency Ethiopia",
  "web development Addis Ababa",
  "website design Ethiopia",
  "Mr.Software",
  "CampusOne",
  "business automation",
  "branding and media production",
  "ecommerce development",
  "SaaS development Africa",
  "digital infrastructure",
  "growth marketing",
];

const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

/** Canonical site origin — set NEXT_PUBLIC_SITE_URL in production (e.g. https://yafetpromedia.com). */
export function siteUrl(path = ""): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_URL?.trim() ||
    "https://yafetpromedia.com"
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
  authors?: string[];
};

export function buildPageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  keywords = DEFAULT_KEYWORDS,
  ogImage,
  ogType = "website",
  noIndex = false,
  publishedTime,
  authors,
}: PageMetadataInput = {}): Metadata {
  const pageTitle = title?.trim() || DEFAULT_TITLE;
  const canonical = siteUrl(path);
  const image = ogImage ? absoluteUrl(ogImage) : defaultOgImage();
  const isArticle = ogType === "article";

  return {
    title: pageTitle,
    description,
    keywords,
    authors: authors?.map((name) => ({ name })),
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(siteUrl()),
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large" },
        },
    openGraph: {
      type: ogType,
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: pageTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: pageTitle }],
      ...(isArticle && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [image],
      creator: "@yafetpromedia",
      site: "@yafetpromedia",
    },
    category: "technology",
  };
}

export const rootMetadata: Metadata = {
  ...buildPageMetadata(),
  applicationName: SITE_NAME,
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "geo.region": "ET-AA",
    "geo.placename": "Addis Ababa",
  },
};
