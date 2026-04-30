import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getRepoRoot } from "./repo-root";

export type LeadFileRow = {
  id: number;
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  /** Admin-only; persisted in `.data/leads-pending.json`. */
  handled?: boolean;
  created_at: string;
};

const filePath = path.join(getRepoRoot(), ".data", "leads-pending.json");

function nextNegativeId(): number {
  return -Date.now() - Math.floor(Math.random() * 1_000_000);
}

function normalizeRow(o: Record<string, unknown>): LeadFileRow | null {
  const id = Number(o.id);
  if (!Number.isFinite(id) || id >= 0) return null;
  return {
    id,
    name: String(o.name ?? ""),
    email: String(o.email ?? ""),
    company: String(o.company ?? ""),
    phone: String(o.phone ?? ""),
    message: String(o.message ?? ""),
    handled: typeof o.handled === "boolean" ? o.handled : false,
    created_at: String(o.created_at ?? new Date().toISOString()),
  };
}

export async function readLeadsFromFile(): Promise<LeadFileRow[]> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: LeadFileRow[] = [];
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

export async function appendLeadToFile(entry: {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}): Promise<LeadFileRow> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const existing = await readLeadsFromFile();
  const row: LeadFileRow = {
    id: nextNegativeId(),
    name: entry.name,
    email: entry.email,
    company: entry.company,
    phone: entry.phone,
    message: entry.message,
    handled: false,
    created_at: new Date().toISOString(),
  };
  const next = [row, ...existing].slice(0, 500);
  await writeFile(filePath, JSON.stringify(next, null, 2), "utf-8");
  return row;
}

/** Removes a pending lead written to `.data/leads-pending.json` (negative ids only). */
export async function removeLeadFromFile(id: number): Promise<boolean> {
  if (id >= 0) return false;
  const existing = await readLeadsFromFile();
  const filtered = existing.filter((r) => r.id !== id);
  if (filtered.length === existing.length) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

export async function updateLeadHandledInFile(id: number, handled: boolean): Promise<boolean> {
  if (id >= 0) return false;
  const existing = await readLeadsFromFile();
  let found = false;
  const next = existing.map((r) => {
    if (r.id !== id) return r;
    found = true;
    return { ...r, handled };
  });
  if (!found) return false;
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(next, null, 2), "utf-8");
  return true;
}
