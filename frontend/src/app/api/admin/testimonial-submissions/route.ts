import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { query } from "@db";
import {
  removeTestimonialSubmissionFromFile,
  setTestimonialFileSubmissionStatus,
} from "@backend/testimonial-submissions-file";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const denied = await jsonForbiddenUnlessPermission("testimonials.edit");
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as {
    id?: number;
    action?: string;
  } | null;
  const id = Number(body?.id);
  const action = body?.action;
  if (!Number.isFinite(id) || id === 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  const approvedAt = action === "approve" ? new Date().toISOString() : null;

  if (id < 0) {
    if (action === "approve") {
      const ok = await setTestimonialFileSubmissionStatus(id, "approved", approvedAt);
      if (!ok) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
    } else {
      const ok = await setTestimonialFileSubmissionStatus(id, "rejected", null);
      if (!ok) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }
    }
    return Response.json({ ok: true });
  }

  if (action === "approve") {
    const rows = await query<{ id: number }>(
      `
        UPDATE testimonial_submissions
        SET status = 'approved', approved_at = NOW()
        WHERE id = $1 AND status IN ('pending', 'rejected')
        RETURNING id
      `,
      [id]
    );
    if (rows.length === 0) {
      return Response.json({ error: "Not found or already processed" }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  const rows = await query<{ id: number }>(
    `
      UPDATE testimonial_submissions
      SET status = 'rejected', approved_at = NULL
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );
  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await jsonForbiddenUnlessPermission("testimonials.delete");
  if (denied) return denied;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(id) || id === 0) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  if (id < 0) {
    const removed = await removeTestimonialSubmissionFromFile(id);
    if (!removed) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  const rows = await query<{ id: number }>(
    "DELETE FROM testimonial_submissions WHERE id = $1 RETURNING id",
    [id]
  );
  if (rows.length === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}
