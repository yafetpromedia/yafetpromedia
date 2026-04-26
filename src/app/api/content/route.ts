import { readSiteContent } from "@/lib/site-content";

export const runtime = "nodejs";

export async function GET() {
  const content = await readSiteContent();
  return Response.json({ content });
}
