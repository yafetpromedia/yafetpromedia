import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import SmoothScrollProvider from "@/components/common/SmoothScrollProvider";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ScrollProgress from "@/components/common/ScrollProgress";
import StickyBookCall from "@/components/common/StickyBookCall";
import AIChatWidget from "@/components/common/AIChatWidget";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { SiteContentProvider } from "@/components/common/SiteContentProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "Yafet Pro Media | Digital Infrastructure & System Solutions",
  description: "We build complete digital systems, designing infrastructure that powers organizations through technology, branding, and strategic marketing.",
  keywords: ["Digital Systems", "Infrastructure Design", "Mr.Software", "Corporate Branding", "Media Production", "Growth Marketing"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <SiteContentProvider>
              <SmoothScrollProvider>
                <StoreProvider>
                  <ScrollProgress />
                  <Navbar />
                  {children}
                  <Footer />
                  <StickyBookCall />
                  <AIChatWidget />
                </StoreProvider>
              </SmoothScrollProvider>
            </SiteContentProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
