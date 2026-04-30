/**
 * Always run Next (or ESLint) with cwd = frontend/, so next.config, public/, and .env.local
 * next to frontend are found reliably on Windows + npm workspaces.
 *
 * Uses `npm run` (not `npx`) so the local `next` from frontend/node_modules is used — avoids
 * npm fetching Next on the server and extra WASM/toolchain load during builds.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const frontend = path.join(repoRoot, "frontend");

const argv = process.argv.slice(2);
const command = argv[0] ?? "dev";
const passThrough = argv.slice(1);

const validCommands = ["dev", "build", "start", "lint"];
if (!validCommands.includes(command)) {
  console.error(`Unknown command "${command}". Expected one of: ${validCommands.join(", ")}`);
  process.exit(1);
}

const npmArgs = ["run", command];
if (passThrough.length) {
  npmArgs.push("--", ...passThrough);
}

const result = spawnSync("npm", npmArgs, {
  cwd: frontend,
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status === null ? 1 : result.status);
