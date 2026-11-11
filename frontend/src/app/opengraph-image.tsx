import { ImageResponse } from "next/og";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const runtime = "edge";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
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
          background: "linear-gradient(160deg, #f4f4f2 0%, #ebeae6 45%, #f7f3ef 100%)",
          color: "#121212",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#ffffff",
              border: "1px solid rgba(18,18,18,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: "#121212",
            }}
          >
            a
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>{SITE_NAME}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 920 }}>
          <p style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05, margin: 0, letterSpacing: -1.5 }}>
            {SITE_TAGLINE}
          </p>
          <p style={{ fontSize: 24, lineHeight: 1.45, margin: 0, color: "rgba(18,18,18,0.62)" }}>
            {DEFAULT_DESCRIPTION.slice(0, 140)}…
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: 22, margin: 0, color: "#e85d04", fontWeight: 600 }}>awuddigitals.com</p>
          <p style={{ fontSize: 18, margin: 0, color: "rgba(18,18,18,0.45)" }}>Addis Ababa · Worldwide</p>
        </div>
      </div>
    ),
    { ...size }
  );
}
