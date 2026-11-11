import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/common/SmoothScrollProvider";
import GlobalChrome from "@/components/common/GlobalChrome";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import {
  LANG_COOKIE,
  htmlDirFor,
  htmlLangFor,
  parseAppLanguage,
} from "@/lib/app-language";
import { SiteContentProvider } from "@/components/common/SiteContentProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { rootMetadata } from "@/lib/seo";
import { readSiteContent } from "@backend/site-content";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  const bust = encodeURIComponent(content.siteLogoSrc || "a");
  return {
    ...rootMetadata,
    icons: {
      icon: [
        { url: `/icon?v=${bust}`, type: "image/png", sizes: "32x32" },
        { url: `/apple-icon?v=${bust}`, type: "image/png", sizes: "180x180" },
      ],
      apple: [{ url: `/apple-icon?v=${bust}`, sizes: "180x180", type: "image/png" }],
      shortcut: [`/icon?v=${bust}`],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialLanguage = parseAppLanguage(cookieStore.get(LANG_COOKIE)?.value);
  // Matches ThemeProvider defaultTheme — light-first modern look.
  return (
    <html
      lang={htmlLangFor(initialLanguage)}
      dir={htmlDirFor(initialLanguage)}
      className="light"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`${plusJakarta.variable} ${outfit.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="light">
          <LanguageProvider initialLanguage={initialLanguage}>
            <SiteContentProvider>
              <SmoothScrollProvider>
                <GlobalChrome>{children}</GlobalChrome>
              </SmoothScrollProvider>
            </SiteContentProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
