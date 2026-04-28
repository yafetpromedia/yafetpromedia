"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ScrollProgress from "@/components/common/ScrollProgress";
import StickyBookCall from "@/components/common/StickyBookCall";
import AIChatWidget from "@/components/common/AIChatWidget";

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidePublicChrome = pathname.startsWith("/admin") || pathname.startsWith("/login");

  return (
    <>
      {!hidePublicChrome && (
        <>
          <ScrollProgress />
          <Navbar />
        </>
      )}

      {children}

      {!hidePublicChrome && (
        <>
          <Footer />
          <StickyBookCall />
          <AIChatWidget />
        </>
      )}
    </>
  );
}
