import { readSiteContent } from "@/lib/site-content";

export const runtime = "nodejs";

export async function GET() {
  try {
    const content = await readSiteContent();
    return Response.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content API failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
