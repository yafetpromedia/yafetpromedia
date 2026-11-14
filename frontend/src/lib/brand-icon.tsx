import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getPublicDir } from "@backend/repo-root";
import { readSiteContent } from "@backend/site-content";
import { defaultSiteContent } from "@/lib/site-content.shared";
import { siteUrl } from "@/lib/seo";

function mimeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

async function loadLogoBytes(src: string): Promise<{ data: Buffer; contentType: string } | null> {
  const trimmed = src.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("..")) {
    const filePath = path.join(getPublicDir(), trimmed.replace(/^\//, ""));
    try {
      const data = await readFile(filePath);
      return { data, contentType: mimeFromPath(filePath) };
    } catch {
      return null;
    }
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const res = await fetch(trimmed, { cache: "no-store" });
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") || "image/png";
      const data = Buffer.from(await res.arrayBuffer());
      return { data, contentType };
    } catch {
      return null;
    }
  }

  return null;
}

const ICON_HEADERS = {
  "Cache-Control": "public, max-age=0, must-revalidate",
};

function letterFallback(size: number, radius: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff6a00, #ff9139)",
          borderRadius: radius,
          fontSize: Math.round(size * 0.62),
          fontWeight: 800,
          color: "#fff",
        }}
      >
        A
      </div>
    ),
    { width: size, height: size, headers: ICON_HEADERS }
  );
}

/** Favicon / apple icon from CMS site logo (falls back to letter A). */
export async function brandIconResponse(size: number, radius: number): Promise<Response> {
  try {
    const content = await readSiteContent();
    const src = content.siteLogoSrc?.trim() || defaultSiteContent.siteLogoSrc;
    const loaded = await loadLogoBytes(src);

    // Absolute URL fetch as secondary path (useful when files live only on the live host).
    const remote =
      loaded ??
      (src.startsWith("/")
        ? await loadLogoBytes(siteUrl(src))
        : null);

    if (remote && !remote.contentType.includes("svg")) {
      const dataUrl = `data:${remote.contentType};base64,${remote.data.toString("base64")}`;
      return new ImageResponse(
        (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              borderRadius: radius,
            }}
          >
            <img
              src={dataUrl}
              width={Math.round(size * 0.86)}
              height={Math.round(size * 0.86)}
              style={{ objectFit: "contain" }}
              alt=""
            />
          </div>
        ),
        { width: size, height: size, headers: ICON_HEADERS }
      );
    }
  } catch {
    // fall through
  }

  return letterFallback(size, radius);
}
