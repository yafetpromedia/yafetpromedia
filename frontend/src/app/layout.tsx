import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/common/SmoothScrollProvider";
import GlobalChrome from "@/components/common/GlobalChrome";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SiteContentProvider } from "@/components/common/SiteContentProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { rootMetadata } from "@/lib/seo";
import { readSiteContent } from "@backend/site-content";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await readSiteContent();
  const bust = encodeURIComponent(content.siteLogoSrc || "a");
  return {
    ...rootMetadata,
    icons: {
      icon: [{ url: `/icon?v=${bust}`, type: "image/png" }],
      apple: [{ url: `/apple-icon?v=${bust}`, sizes: "180x180", type: "image/png" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Matches ThemeProvider defaultTheme so SSR/first paint use dark CSS variables (no white hero flash).
  return (
    <html
      lang="en"
      className="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        <ThemeProvider defaultTheme="dark">
          <LanguageProvider>
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
