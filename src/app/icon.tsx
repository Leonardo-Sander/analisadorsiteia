import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 7,
          background: "linear-gradient(135deg, #ff7a3d, #ff4d1a)",
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 20,
          color: "#0b0b0c",
        }}
      >
        Δ
      </div>
    ),
    { ...size },
  );
}
