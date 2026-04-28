/**
 * Always run Next (or ESLint) with cwd = frontend/, so next.config, public/, and .env.local
 * next to frontend are found reliably on Windows + npm workspaces.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const frontend = path.join(repoRoot, "frontend");

const argv = process.argv.slice(2);
const command = argv[0] ?? "dev";
const passThrough = argv.slice(1);

const isLint = command === "lint";
const spawnArgs = isLint ? ["eslint", ".", ...passThrough] : ["next", command, ...passThrough];

const result = spawnSync("npx", spawnArgs, {
  cwd: frontend,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
