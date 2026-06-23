"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ScrollProgress from "@/components/common/ScrollProgress";
import FloatingActionCluster from "@/components/common/FloatingActionCluster";
import PageViewTracker from "@/components/common/PageViewTracker";

function ChromeTop() {
  const pathname = usePathname();
  const hidePublicChrome =
    pathname.startsWith("/admin") || pathname.startsWith("/login");
  if (hidePublicChrome) return null;
  return (
    <>
      <ScrollProgress />
      <Navbar />
    </>
  );
}

function ChromeBottom() {
  const pathname = usePathname();
  const hidePublicChrome =
    pathname.startsWith("/admin") || pathname.startsWith("/login");
  if (hidePublicChrome) return null;
  return (
    <>
      <Footer />
      <FloatingActionCluster />
    </>
  );
}

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageViewTracker />
      <Suspense fallback={null}>
        <ChromeTop />
      </Suspense>

      {children}

      <Suspense fallback={null}>
        <ChromeBottom />
      </Suspense>
    </>
  );
}
