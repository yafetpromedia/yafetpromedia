"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ScrollProgress from "@/components/common/ScrollProgress";
import FloatingActionCluster from "@/components/common/FloatingActionCluster";
import PageViewTracker from "@/components/common/PageViewTracker";

function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidePublicChrome =
    pathname.startsWith("/admin") || pathname.startsWith("/login");

  return (
    <>
      {!hidePublicChrome ? (
        <>
          <ScrollProgress />
          <Navbar />
        </>
      ) : null}

      {children}

      {!hidePublicChrome ? (
        <>
          <Footer />
          <FloatingActionCluster />
        </>
      ) : null}
    </>
  );
}

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageViewTracker />
      {/* Single Suspense so Navbar + FAB hydrate together (not before/after locale). */}
      <Suspense fallback={<>{children}</>}>
        <PublicChrome>{children}</PublicChrome>
      </Suspense>
    </>
  );
}
