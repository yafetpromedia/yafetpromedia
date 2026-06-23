import { appendLeadToFile } from "@backend/leads-file";
import { query } from "@db";
import type { ConsultationSession } from "@/lib/project-consultant-engine";

export type ConsultationLeadInput = {
  session: ConsultationSession;
  briefMarkdown: string;
  leadScore: number;
  estimatedCost: string;
  estimatedTimeline: string;
};

function buildLeadMessage(input: ConsultationLeadInput): string {
  const { session, briefMarkdown, leadScore, estimatedCost, estimatedTimeline } = input;
  const payments = session.requirements.paymentMethods?.join(", ") || "Not specified";

  return [
    "— AI Project Consultant lead —",
    "",
    `Project: ${session.projectType || "TBD"}`,
    `Industry: ${session.industry || "General"}`,
    `Products: ${session.requirements.products || "Not specified"}`,
    `Payments: ${payments}`,
    `Budget: ${session.budget || "TBD"}`,
    `Timeline: ${session.timeline || "TBD"}`,
    `Est. cost: ${estimatedCost}`,
    `Est. duration: ${estimatedTimeline}`,
    `Lead score: ${leadScore}/100`,
    `Session: ${session.sessionId}`,
    "",
    "--- Generated brief ---",
    "",
    briefMarkdown,
  ].join("\n");
}

/** Persists an inbox lead when the visitor shared contact info during consultation. */
export async function createLeadFromConsultation(input: ConsultationLeadInput): Promise<number | null> {
  const email = input.session.clientEmail.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return null;
  }

  if (input.session.requirements.leadCreated) {
    return input.session.requirements.leadId ?? null;
  }

  const dbUrl = process.env.DATABASE_URL?.trim();
  if (dbUrl) {
    try {
      const existing = await query<{ requirements: { leadCreated?: boolean; leadId?: number } }>(
        "SELECT requirements FROM project_consultations WHERE session_id = $1 LIMIT 1",
        [input.session.sessionId]
      );
      const req = existing[0]?.requirements;
      if (req?.leadCreated && req.leadId) {
        return req.leadId;
      }
    } catch {
      // Continue to insert if lookup fails.
    }
  }

  const name = (input.session.clientName.trim() || "AI Consultation Lead").slice(0, 120);
  const company = [input.session.projectType, input.session.industry].filter(Boolean).join(" — ").slice(0, 160) || "AI Consultation";
  const message = buildLeadMessage(input).slice(0, 4000);

  if (!dbUrl) {
    const row = await appendLeadToFile({ name, email, company, phone: "", message });
    return row.id;
  }

  try {
    const rows = await query<{ id: number }>(
      "INSERT INTO leads (name, email, company, phone, message) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email.slice(0, 160), company, "", message]
    );
    return rows[0]?.id ?? null;
  } catch (err) {
    console.error("[consultation-leads] database insert failed, using file fallback:", err);
    const row = await appendLeadToFile({ name, email, company, phone: "", message });
    return row.id;
  }
}
