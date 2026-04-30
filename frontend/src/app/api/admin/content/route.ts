import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { readSiteContent, writeSiteContent } from "@backend/site-content";
import { csrfGuard } from "@/lib/request-security";
import { auditAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function GET() {
  const denied = await jsonForbiddenUnlessPermission("content.view");
  if (denied) return denied;
  try {
    const content = await readSiteContent();
    return Response.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to read content.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("content.edit");
  if (denied) return denied;
  try {
    const body = (await request.json()) as { content?: Record<string, unknown> };
    if (!body?.content || typeof body.content !== "object" || Array.isArray(body.content)) {
      return Response.json({ error: "Invalid content payload." }, { status: 400 });
    }
    const content = await writeSiteContent((body.content ?? {}) as never);
    await auditAdminAction("content.update");
    return Response.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save content.";
    return Response.json({ error: message }, { status: 500 });
  }
}
