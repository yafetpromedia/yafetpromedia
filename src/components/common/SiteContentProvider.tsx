"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultSiteContent, SiteContent } from "@/lib/site-content.shared";

type SiteContentContextType = {
  content: SiteContent;
  updateContent: (next: SiteContent) => Promise<void>;
  isLoading: boolean;
};

const SiteContentContext = createContext<SiteContentContextType | undefined>(undefined);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadContent() {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { content?: SiteContent };
        if (active && data?.content) setContent(data.content);
      } catch {
        // Keep default content when API is unavailable.
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadContent();

    function onVisible() {
      if (document.visibilityState === "visible") void loadContent();
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const updateContent = async (next: SiteContent) => {
    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: next }),
    });
    if (!response.ok) {
      throw new Error("Could not update content");
    }
    setContent(next);
  };

  const value = useMemo(() => ({ content, updateContent, isLoading }), [content, isLoading]);

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) throw new Error("useSiteContent must be used within SiteContentProvider");
  return context;
}
