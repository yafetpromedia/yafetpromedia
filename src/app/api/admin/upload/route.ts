import { cookies } from "next/headers";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSessionCookieName, verifySessionToken } from "@/server/auth";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get(getSessionCookieName())?.value;
  return verifySessionToken(session);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  const folderField = form?.get("folder");
  const uploadFolder =
    folderField === "systems"
      ? "systems"
      : folderField === "products"
        ? "products"
        : folderField === "publications"
          ? "publications"
          : folderField === "trust"
            ? "trust"
            : "hero";
  if (!file || !(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return Response.json({ error: "Only image files are allowed" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_BYTES) {
    return Response.json({ error: "File too large (max 4MB)" }, { status: 400 });
  }

  const original = file.name.replace(/[^a-zA-Z0-9._-]/g, "") || "upload";
  const ext = path.extname(original).toLowerCase() || (file.type === "image/svg+xml" ? ".svg" : ".png");
  const base = path.basename(original, path.extname(original)) || "image";
  const name = `${base.slice(0, 40)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const dir = path.join(process.cwd(), "public", "uploads", uploadFolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);

  return Response.json({ url: `/uploads/${uploadFolder}/${name}` });
}
