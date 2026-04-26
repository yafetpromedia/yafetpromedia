import { cookies } from "next/headers";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth";
import { readSiteContent, writeSiteContent } from "@/lib/site-content";

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
  const content = await readSiteContent();
  return Response.json({ content });
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { content?: Record<string, unknown> };
  const content = await writeSiteContent((body.content ?? {}) as never);
  return Response.json({ content });
}
