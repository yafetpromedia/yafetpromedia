import { redirect } from "next/navigation";

/** Publications live on the homepage — /#insights */
export default function BlogPage() {
  redirect("/#insights");
}
