import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/login", "/login/"],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/about/", "/portfolio/", "/blog/"],
        disallow: ["/admin/", "/api/", "/login"],
      },
    ],
    sitemap: siteUrl("/sitemap.xml"),
    host: siteUrl(),
  };
}
