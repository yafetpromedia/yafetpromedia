"use client";

import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, useLenis } from "lenis/react";

function LenisSync() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    if (!lenis) return;

    lenis.start();

    const sync = () => {
      lenis.resize();
    };

    sync();

    const ro = new ResizeObserver(() => {
      requestAnimationFrame(sync);
    });
    ro.observe(document.documentElement);
    ro.observe(document.body);

    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    window.addEventListener("load", sync);

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      window.removeEventListener("load", sync);
      ro.disconnect();
    };
  }, [lenis, pathname]);

  return null;
}

function SmoothScrollInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const disableLenis =
    pathname.startsWith("/admin") || pathname.startsWith("/login");

  if (disableLenis) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.05,
        duration: 1.5,
        smoothWheel: true,
        autoResize: true,
      }}
    >
      <LenisSync />
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
