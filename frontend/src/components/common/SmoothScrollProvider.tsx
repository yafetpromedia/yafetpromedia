"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";

function SmoothScrollInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const disableLenis =
    pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (disableLenis) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}

/** Suspense required by Next.js App Router before usePathname() runs on the client. */
export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <SmoothScrollInner>{children}</SmoothScrollInner>
    </Suspense>
  );
}
