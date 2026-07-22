import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const runtime = "edge";
export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1208 45%, #0f0f14 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #ff6a00, #ff9139)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            A
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_NAME}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <p style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05, margin: 0, letterSpacing: -1.5 }}>
            {SITE_TAGLINE}
          </p>
          <p style={{ fontSize: 26, lineHeight: 1.45, margin: 0, color: "rgba(255,255,255,0.72)" }}>
            {DEFAULT_DESCRIPTION.slice(0, 120)}…
          </p>
        </div>

        <p style={{ fontSize: 22, margin: 0, color: "#ff9139", fontWeight: 600 }}>awuddigitals.com</p>
      </div>
    ),
    { ...size }
  );
}
