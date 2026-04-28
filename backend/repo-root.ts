import path from "node:path";

/** Repo root (contains `frontend`, `backend`, `db`, `.data`). When cwd is `frontend`, this is one level up. */
export function getRepoRoot(): string {
  const cwd = process.cwd();
  return path.basename(cwd).toLowerCase() === "frontend" ? path.resolve(cwd, "..") : cwd;
}

/** Next.js `public` folder (uploads, static files). */
export function getPublicDir(): string {
  const cwd = process.cwd();
  if (path.basename(cwd).toLowerCase() === "frontend") {
    return path.join(cwd, "public");
  }
  return path.join(cwd, "frontend", "public");
}
