import { headers } from "next/headers";
import { getViewerAccess } from "@/lib/admin-access";

function readIpFromHeaders(forwardedFor: string | null, realIp: string | null): string {
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return realIp?.trim() || "unknown";
}

export async function auditAdminAction(
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  const [h, viewer] = await Promise.all([headers(), getViewerAccess()]);
  const ip = readIpFromHeaders(h.get("x-forwarded-for"), h.get("x-real-ip"));
  const actor = viewer?.email || "unknown";
  console.info("[admin-audit]", {
    at: new Date().toISOString(),
    action,
    actor,
    ip,
    ...details,
  });
}

