import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getPublicDir } from "@backend/repo-root";
import { jsonForbiddenUnlessPermission } from "@/lib/admin-access";
import { csrfGuard } from "@/lib/request-security";
import { auditAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif"]);
const MAX_BYTES = 4 * 1024 * 1024;

function hasAllowedImageSignature(buffer: Buffer, mime: string): boolean {
  if (mime === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  if (mime === "image/jpeg" || mime === "image/jpg") {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === "image/gif") {
    const sig = buffer.subarray(0, 6).toString("ascii");
    return sig === "GIF87a" || sig === "GIF89a";
  }
  if (mime === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  if (mime === "image/svg+xml") {
    const start = buffer.subarray(0, Math.min(buffer.length, 300)).toString("utf-8").trimStart().toLowerCase();
    return start.startsWith("<svg") || start.startsWith("<?xml");
  }
  return false;
}

export async function POST(request: Request) {
  const csrf = csrfGuard(request);
  if (csrf) return csrf;

  const denied = await jsonForbiddenUnlessPermission("upload.add");
  if (denied) return denied;

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
            : folderField === "portfolio"
              ? "portfolio"
              : folderField === "ecosystem"
                ? "ecosystem"
                : folderField === "about"
                  ? "about"
                  : "hero";
  const allowedFolders = new Set([
    "hero",
    "systems",
    "products",
    "publications",
    "trust",
    "portfolio",
    "ecosystem",
    "about",
  ]);
  if (!allowedFolders.has(uploadFolder)) {
    return Response.json({ error: "Invalid upload folder." }, { status: 400 });
  }
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
  if (!hasAllowedImageSignature(buffer, file.type)) {
    return Response.json({ error: "File content does not match the declared image type." }, { status: 400 });
  }

  const original = file.name.replace(/[^a-zA-Z0-9._-]/g, "") || "upload";
  const ext = path.extname(original).toLowerCase() || (file.type === "image/svg+xml" ? ".svg" : ".png");
  const base = path.basename(original, path.extname(original)) || "image";
  const name = `${base.slice(0, 40)}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  const dir = path.join(getPublicDir(), "uploads", uploadFolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  await auditAdminAction("upload.image", { folder: uploadFolder, file: name, sizeBytes: buffer.length });

  return Response.json({ url: `/uploads/${uploadFolder}/${name}` });
}
