import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Next only auto-loads `.env*` from `frontend/`; keep `DATABASE_URL` etc. in repo-root `.env.local`. */
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {
  turbopack: {
    /** Workspace: lockfile lives at monorepo root; include `frontend/`, `backend/`, `db/` in resolution. */
    root: monorepoRoot,
  },
};

export default nextConfig;
