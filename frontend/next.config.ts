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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              "img-src 'self' data: blob: https:",
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' data: https:",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com",
              "connect-src 'self' https://translate.googleapis.com https://translate.google.com",
              "frame-src https://translate.google.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
