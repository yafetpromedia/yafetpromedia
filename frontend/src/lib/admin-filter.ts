/** Case-insensitive substring match across optional fields — empty query matches everything. */
export function matchesAdminFilter(
  query: string,
  ...parts: (string | number | boolean | undefined | null)[]
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return parts.some((p) => String(p ?? "").toLowerCase().includes(q));
}
