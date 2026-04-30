import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/common/SmoothScrollProvider";
import GlobalChrome from "@/components/common/GlobalChrome";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SiteContentProvider } from "@/components/common/SiteContentProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Yafetpromedia | Digital Infrastructure & System Solutions",
  description:
    "We build complete digital systems, designing infrastructure that powers organizations through technology, branding, and strategic marketing.",
  keywords: [
    "Digital Systems",
    "Infrastructure Design",
    "Mr.Software",
    "Corporate Branding",
    "Media Production",
    "Growth Marketing",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Matches ThemeProvider defaultTheme so SSR/first paint use dark CSS variables (no white hero flash).
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
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
