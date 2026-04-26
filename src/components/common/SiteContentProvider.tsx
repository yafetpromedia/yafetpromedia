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
    fetch("/api/content")
      .then((res) => res.json())
      .then((data: { content?: SiteContent }) => {
        if (active && data.content) setContent(data.content);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateContent = async (next: SiteContent) => {
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: next }),
    });
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
