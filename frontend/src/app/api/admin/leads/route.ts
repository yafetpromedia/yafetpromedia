import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { removeLeadFromFile, updateLeadHandledInFile } from "@backend/leads-file";
import { query } from "@db";
import { csrfGuard } from "@/lib/request-security";
import { auditAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function GET() {
  const denied = await jsonForbiddenUnlessPermission("leads.view");
  if (denied) return denied;

  const leads = await query<{
    id: number;
    name: string;
    email: string;
    company: string;
    phone: string;
    message: string;
    handled: boolean;
    created_at: string;
  }>(
    `
      SELECT id, name, email, company, COALESCE(phone, '') AS phone, message,
             COALESCE(handled, false) AS handled, created_at
      FROM leads
      ORDER BY id DESC
      LIMIT 100
    `
  );

  return Response.json({ leads });
}

export async function PATCH(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("leads.edit");
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { id?: number; handled?: unknown } | null;
  const id = Number(body?.id);
  const handled = body?.handled;
  if (!Number.isFinite(id) || id === 0 || typeof handled !== "boolean") {
    return Response.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (id < 0) {
    const ok = await updateLeadHandledInFile(id, handled);
    if (!ok) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await auditAdminAction("lead.update.file", { id, handled });
    return Response.json({ ok: true });
  }

  const rows = await query<{ id: number }>(
    "UPDATE leads SET handled = $2 WHERE id = $1 RETURNING id",
    [id, handled]
  );
  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  await auditAdminAction("lead.update", { id, handled });

  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("leads.delete");
  if (denied) return denied;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(id) || id === 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  if (id < 0) {
    const removed = await removeLeadFromFile(id);
    if (!removed) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    await auditAdminAction("lead.delete.file", { id });
    return Response.json({ ok: true });
  }

  const rows = await query<{ id: number }>("DELETE FROM leads WHERE id = $1 RETURNING id", [id]);
  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  await auditAdminAction("lead.delete", { id });

  return Response.json({ ok: true });
}
