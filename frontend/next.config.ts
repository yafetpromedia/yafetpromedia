import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";

const monorepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Next only auto-loads `.env*` from `frontend/`; keep `DATABASE_URL` etc. in repo-root `.env.local`. */
loadEnvConfig(monorepoRoot);

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/app", destination: "/", permanent: false }];
  },
  async rewrites() {
    // Browsers still request /favicon.ico by default; serve the CMS-driven /icon.
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
  turbopack: {
    /** Workspace: lockfile lives at monorepo root; include `frontend/`, `backend/`, `db/` in resolution. */
    root: monorepoRoot,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      const prevIgnored = config.watchOptions?.ignored;
      const uploadsPattern = /[\\/]public[\\/]uploads(?:[\\/]|$)/;
      const uploadsGlob = "**/public/uploads/**";

      if (prevIgnored instanceof RegExp) {
        config.watchOptions = {
          ...config.watchOptions,
          ignored: new RegExp(`${prevIgnored.source}|${uploadsPattern.source}`, prevIgnored.flags),
        };
      } else if (typeof prevIgnored === "string" && prevIgnored) {
        config.watchOptions = {
          ...config.watchOptions,
          ignored: [prevIgnored, uploadsGlob],
        };
      } else if (Array.isArray(prevIgnored)) {
        const globs = prevIgnored.filter((v): v is string => typeof v === "string" && v.length > 0);
        config.watchOptions = {
          ...config.watchOptions,
          ignored: globs.length ? [...globs, uploadsGlob] : uploadsPattern,
        };
      } else {
        config.watchOptions = {
          ...config.watchOptions,
          ignored: uploadsPattern,
        };
      }
    }
    return config;
  },
  async headers() {
    const securityHeaders = [
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
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://translate.google.com https://translate.googleapis.com https://www.gstatic.com https://www.google.com",
          "connect-src 'self' https://translate.googleapis.com https://translate.google.com https://translate-pa.googleapis.com https://clients5.google.com https://www.gstatic.com https://www.google.com https://api.mymemory.translated.net",
          "frame-src https://translate.google.com https://translate.googleapis.com https://www.google.com https://www.gstatic.com https://translate.googleusercontent.com",
          "worker-src 'self' blob:",
          "child-src 'self' blob: https://translate.google.com https://www.google.com",
        ].join("; "),
      },
    ];

    if (process.env.NODE_ENV === "production") {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
