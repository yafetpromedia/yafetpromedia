"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    const referrer = typeof document !== "undefined" ? document.referrer : "";
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
