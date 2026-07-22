import { brandIconResponse } from "@/lib/brand-icon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return brandIconResponse(32, 8);
}
