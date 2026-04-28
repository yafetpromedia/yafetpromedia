import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRepoRoot } from "./repo-root";

export type TestimonialSubmissionStatus = "pending" | "approved" | "rejected";

export type TestimonialFileRow = {
  id: number;
  quote: string;
  author: string;
  role: string;
  email: string;
  rating: number;
  status: TestimonialSubmissionStatus;
  approved_at: string | null;
  created_at: string;
};

const filePath = path.join(getRepoRoot(), ".data", "testimonial-submissions-pending.json");

function nextNegativeId(): number {
  return -Date.now() - Math.floor(Math.random() * 1_000_000);
}

function normalizeRow(o: Record<string, unknown>): TestimonialFileRow | null {
  const id = Number(o.id);
  if (!Number.isFinite(id) || id >= 0) return null;
  const rating = Math.min(5, Math.max(1, Math.round(Number(o.rating ?? 5)) || 5));
  const rawStatus = String(o.status ?? "pending");
  const status: TestimonialSubmissionStatus =
    rawStatus === "approved" || rawStatus === "rejected" ? rawStatus : "pending";
  return {
    id,
    quote: String(o.quote ?? ""),
    author: String(o.author ?? ""),
    role: String(o.role ?? ""),
    email: String(o.email ?? ""),
    rating,
    status,
    approved_at: o.approved_at != null ? String(o.approved_at) : null,
    created_at: String(o.created_at ?? new Date().toISOString()),
  };
}

export async function readTestimonialSubmissionsFromFile(): Promise<TestimonialFileRow[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: TestimonialFileRow[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object") continue;
      const row = normalizeRow(item as Record<string, unknown>);
      if (row) out.push(row);
    }
    return out;
  } catch {
    return [];
  }
}

export async function appendTestimonialSubmissionToFile(entry: {
  quote: string;
  author: string;
  role: string;
  email: string;
  rating: number;
}): Promise<TestimonialFileRow> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readTestimonialSubmissionsFromFile();
  const row: TestimonialFileRow = {
    id: nextNegativeId(),
    quote: entry.quote,
    author: entry.author,
    role: entry.role,
    email: entry.email,
    rating: entry.rating,
    status: "pending",
    approved_at: null,
    created_at: new Date().toISOString(),
  };
  const next = [row, ...existing].slice(0, 200);
  await writeFile(filePath, JSON.stringify(next, null, 2), "utf-8");
  return row;
}

export async function removeTestimonialSubmissionFromFile(id: number): Promise<boolean> {
  if (id >= 0) return false;
  const existing = await readTestimonialSubmissionsFromFile();
  const filtered = existing.filter((r) => r.id !== id);
  if (filtered.length === existing.length) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export async function setTestimonialFileSubmissionStatus(
  id: number,
  status: TestimonialSubmissionStatus,
  approvedAt: string | null
): Promise<boolean> {
  if (id >= 0) return false;
  const rows = await readTestimonialSubmissionsFromFile();
  let found = false;
  const next = rows.map((r) => {
    if (r.id !== id) return r;
    found = true;
    return { ...r, status, approved_at: approvedAt };
  });
  if (!found) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(next, null, 2), "utf-8");
  return true;
}
