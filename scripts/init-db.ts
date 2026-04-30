/** One-shot: runs DB bootstrap (same as first app query). Usage: npx tsx scripts/init-db.ts */
import { loadEnvConfig } from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query } from "../db/index";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
async function main() {
  loadEnvConfig(root);
  await query("SELECT 1");
  console.log("Database schema initialized.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
