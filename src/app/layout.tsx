import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import SmoothScrollProvider from "@/components/common/SmoothScrollProvider";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

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
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-[#050505] text-white`}>
        <SmoothScrollProvider>
          <StoreProvider>
            <Navbar />
            {children}
            <Footer />
          </StoreProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
