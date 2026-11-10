import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { deleteConsultation, listConsultations } from "@backend/project-consultations";
import { csrfGuard } from "@/lib/request-security";
import { auditAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

export async function GET() {
  try {
    const denied = await jsonForbiddenUnlessPermission("leads.view");
    if (denied) return denied;

    const consultations = await listConsultations(100);
    return Response.json({ consultations });
  } catch (error) {
    console.error("GET /api/admin/consultations failed", error);
    return Response.json(
      { error: "Failed to load consultations. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
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
  } catch (error) {
    console.error("DELETE /api/admin/consultations failed", error);
    return Response.json(
      { error: "Failed to delete consultation. Please try again." },
      { status: 500 }
    );
  }
}
