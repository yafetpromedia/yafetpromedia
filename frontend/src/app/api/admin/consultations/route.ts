import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { deleteConsultation, listConsultations } from "@backend/project-consultations";
import { csrfGuard } from "@/lib/request-security";
import { auditAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function GET() {
  const denied = await jsonForbiddenUnlessPermission("leads.view");
  if (denied) return denied;

  const consultations = await listConsultations(100);
  return Response.json({ consultations });
}

export async function DELETE(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("leads.delete");
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as { id?: number } | null;
  const id = Number(body?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  await deleteConsultation(id);
  await auditAdminAction("consultation.delete", { id });
  return Response.json({ ok: true });
}
