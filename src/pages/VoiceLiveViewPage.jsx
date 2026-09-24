import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import VoiceLiveView from "../components/voice/VoiceLiveView";
import "../components/voice/voice.css";

export default function VoiceLiveViewPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session") || searchParams.get("sessionId") || undefined;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F4F7F5",
        padding: "24px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto 16px" }}>
        <Link
          to="/"
          style={{
            color: "#0F3B3D",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Return to Talk2Doc Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <VoiceLiveView sessionId={sessionId} />
      </div>
    </div>
  );
}
