import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights & Articles | Awud Digitals",
  description: "Guides, thought leadership, and digital strategy insights from the Awud Digitals team.",
  path: "/blog",
});

/** Publications live on the homepage — /#insights */
export default function BlogPage() {
  redirect("/#insights");
}
