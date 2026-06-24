import { readSiteContent } from "@backend/site-content";
import type { SiteContent } from "@/lib/site-content.shared";

/** Public CMS payload — excludes admin-only fields. */
export type PublicSiteContent = Omit<SiteContent, "loginPasswordResetHelp">;

export function toPublicSiteContent(content: SiteContent): PublicSiteContent {
  const { loginPasswordResetHelp: _removed, ...publicContent } = content;
  return publicContent;
}
