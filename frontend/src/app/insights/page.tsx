import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Insights | YafetPromedia",
  description: "Digital strategy insights, guides, and publications from YafetPromedia.",
  path: "/insights",
});

export default function InsightsPage() {
  redirect("/#insights");
}
