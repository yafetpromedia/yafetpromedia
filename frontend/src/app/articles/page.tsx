import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Articles | Awud Digitals",
  description: "Articles and publications on web development, automation, and digital growth.",
  path: "/articles",
});

export default function ArticlesPage() {
  redirect("/#insights");
}
