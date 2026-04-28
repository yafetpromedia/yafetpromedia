import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  turbopack: {
    /** Workspace: lockfile lives at monorepo root; include `frontend/`, `backend/`, `db/` in resolution. */
    root: monorepoRoot,
  },
};

export default nextConfig;
