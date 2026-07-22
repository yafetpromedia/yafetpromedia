import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights | Awud Digitals",
  description: "Digital strategy insights, guides, and publications from Awud Digitals.",
  path: "/insights",
});

export default function InsightsPage() {
  redirect("/#insights");
}
