import { query } from "@db";
import type { ConsultationPhase, ConsultationRequirements } from "@/lib/project-consultant.shared";
import type { ConsultationSession } from "@/lib/project-consultant-engine";

const SERVER_PHASE_KEY = "__phase";

type StoredRequirements = ConsultationRequirements & { [SERVER_PHASE_KEY]?: ConsultationPhase };

function packRequirements(session: ConsultationSession): string {
  return JSON.stringify({
    ...session.requirements,
    [SERVER_PHASE_KEY]: session.phase,
  });
}

function unpackRequirements(raw: unknown): { requirements: ConsultationRequirements; phase: ConsultationPhase | null } {
  const obj = (raw && typeof raw === "object" ? raw : {}) as StoredRequirements;
  const phase = obj[SERVER_PHASE_KEY] ?? null;
  const { [SERVER_PHASE_KEY]: _, ...requirements } = obj;
  return { requirements, phase };
}

function inferPhase(row: {
  status: string;
  project_type: string;
  industry: string;
  budget: string;
  timeline: string;
  client_email: string;
}): ConsultationPhase {
  if (row.status === "completed") return "complete";
  if (row.client_email.trim()) return "contact";
  if (row.timeline.trim()) return "contact";
  if (row.budget.trim()) return "timeline";
  if (row.industry.trim()) return "budget";
  if (row.project_type.trim()) return "industry";
  return "welcome";
}

export function sessionFromDbRow(row: {
  session_id: string;
  project_type: string;
  industry: string;
  budget: string;
  timeline: string;
  requirements: unknown;
  client_name: string;
  client_email: string;
  status: string;
}): ConsultationSession {
  const { requirements, phase: storedPhase } = unpackRequirements(row.requirements);
  return {
    sessionId: row.session_id,
    phase: storedPhase ?? inferPhase(row),
    projectType: row.project_type,
    industry: row.industry,
    budget: row.budget,
    timeline: row.timeline,
    requirements,
    clientName: row.client_name,
    clientEmail: row.client_email,
  };
}

export async function loadConsultationSession(sessionId: string): Promise<ConsultationSession | null> {
  const rows = await query<{
    session_id: string;
    project_type: string;
    industry: string;
    budget: string;
    timeline: string;
    requirements: unknown;
    client_name: string;
    client_email: string;
    status: string;
  }>(
    `
      SELECT session_id, project_type, industry, budget, timeline, requirements,
             client_name, client_email, status
      FROM project_consultations
      WHERE session_id = $1
      LIMIT 1
    `,
    [sessionId]
  );
  const row = rows[0];
  if (!row) return null;
  return sessionFromDbRow(row);
}

export type DbConsultation = {
  id: number;
  session_id: string;
  project_type: string;
  industry: string;
  budget: string;
  timeline: string;
  requirements: ConsultationRequirements;
  generated_brief: string;
  lead_score: number;
  client_name: string;
  client_email: string;
  complexity: string;
  estimated_cost: string;
  estimated_timeline: string;
  status: string;
  created_at: string;
};

export async function upsertConsultationDraft(session: ConsultationSession) {
  await query(
    `
      INSERT INTO project_consultations (
        session_id, project_type, industry, budget, timeline, requirements,
        client_name, client_email, status
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, 'in_progress')
      ON CONFLICT (session_id) DO UPDATE SET
        project_type = EXCLUDED.project_type,
        industry = EXCLUDED.industry,
        budget = EXCLUDED.budget,
        timeline = EXCLUDED.timeline,
        requirements = EXCLUDED.requirements,
        client_name = EXCLUDED.client_name,
        client_email = EXCLUDED.client_email,
        status = EXCLUDED.status
    `,
    [
      session.sessionId,
      session.projectType,
      session.industry,
      session.budget,
      session.timeline,
      packRequirements(session),
      session.clientName,
      session.clientEmail,
    ]
  );
}

export async function completeConsultation(
  session: ConsultationSession,
  briefMarkdown: string,
  meta: {
    leadScore: number;
    complexity: string;
    estimatedCost: string;
    estimatedTimeline: string;
  }
): Promise<number> {
  const rows = await query<{ id: number }>(
    `
      INSERT INTO project_consultations (
        session_id, project_type, industry, budget, timeline, requirements,
        generated_brief, lead_score, client_name, client_email,
        complexity, estimated_cost, estimated_timeline, status
      ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12, $13, 'completed')
      ON CONFLICT (session_id) DO UPDATE SET
        project_type = EXCLUDED.project_type,
        industry = EXCLUDED.industry,
        budget = EXCLUDED.budget,
        timeline = EXCLUDED.timeline,
        requirements = EXCLUDED.requirements,
        generated_brief = EXCLUDED.generated_brief,
        lead_score = EXCLUDED.lead_score,
        client_name = EXCLUDED.client_name,
        client_email = EXCLUDED.client_email,
        complexity = EXCLUDED.complexity,
        estimated_cost = EXCLUDED.estimated_cost,
        estimated_timeline = EXCLUDED.estimated_timeline,
        status = 'completed'
      RETURNING id
    `,
    [
      session.sessionId,
      session.projectType,
      session.industry,
      session.budget,
      session.timeline,
      packRequirements(session),
      briefMarkdown,
      meta.leadScore,
      session.clientName,
      session.clientEmail,
      meta.complexity,
      meta.estimatedCost,
      meta.estimatedTimeline,
    ]
  );
  return rows[0]?.id ?? 0;
}

export async function listConsultations(limit = 100): Promise<DbConsultation[]> {
  return query<DbConsultation>(
    `
      SELECT id, session_id, project_type, industry, budget, timeline,
             requirements, generated_brief, lead_score, client_name, client_email,
             complexity, estimated_cost, estimated_timeline, status, created_at::text
      FROM project_consultations
      WHERE status = 'completed'
      ORDER BY created_at DESC
      LIMIT $1
    `,
    [limit]
  );
}

export async function deleteConsultation(id: number) {
  await query("DELETE FROM project_consultations WHERE id = $1", [id]);
}

export async function markConsultationLeadLinked(sessionId: string, leadId: number) {
  await query(
    `
      UPDATE project_consultations
      SET requirements = requirements || $2::jsonb
      WHERE session_id = $1
    `,
    [sessionId, JSON.stringify({ leadCreated: true, leadId })]
  );
}
