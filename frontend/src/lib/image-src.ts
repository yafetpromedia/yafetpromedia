/** Skip Next image optimizer for sources that often mismatch between SSR and client. */
export function shouldUseUnoptimizedImage(src: string): boolean {
  const value = src.trim();
  if (!value) return true;
  if (/^https?:\/\//i.test(value)) return true;
  if (value.startsWith("/uploads/") || value.startsWith("/brand/")) return true;
  if (/\s/.test(value)) return true;
  return false;
}
