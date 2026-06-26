import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
          fontSize: 96,
          fontWeight: 800,
          color: "#fff",
        }}
      >
        Y
      </div>
    ),
    { ...size }
  );
}
