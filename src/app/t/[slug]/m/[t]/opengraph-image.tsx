import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Herman Suede · Behind the Hook";

export default async function Image({ params }: { params: Promise<{ slug: string; t: string }> }) {
  const { t } = await params;
  const n = Math.max(0, Math.floor(Number(t) || 0));
  const at = `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0E0E0E", color: "#F2EEE6", padding: 72 }}>
        <div style={{ display: "flex", width: 120, height: 12, background: "#C8FF00" }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 30, color: "#C8FF00", letterSpacing: 4 }}>HERMAN SUEDE · BEHIND THE HOOK</div>
          <div style={{ fontSize: 120, fontWeight: 800, marginTop: 16 }}>▶ Play from {at}</div>
        </div>
        <div style={{ fontSize: 28, color: "rgba(242,238,230,0.6)" }}>Tap to hear the moment and what went into it.</div>
      </div>
    ),
    size,
  );
}
