import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@backend/auth";
import { readSiteContent, writeSiteContent } from "@backend/site-content";

export const runtime = "nodejs";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  return verifySessionToken(session);
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const content = await readSiteContent();
    return Response.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read content.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { content?: Record<string, unknown> };
    const content = await writeSiteContent((body.content ?? {}) as never);
    return Response.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save content.";
    return Response.json({ error: message }, { status: 500 });
  }
}
