import { readSiteContent } from "@backend/site-content";
import { toPublicSiteContent } from "@backend/public-site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const content = toPublicSiteContent(await readSiteContent());
    const body = JSON.stringify({ content });
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "private, no-store, must-revalidate, max-age=0",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Content API failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
