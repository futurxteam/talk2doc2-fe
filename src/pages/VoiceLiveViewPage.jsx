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
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: 10 }}>
          <img
            src="/logo.jpg"
            alt="MyDoktor 24/7"
            style={{
              height: 36,
              borderRadius: 6,
              background: "#ffffff",
              padding: "2px 6px",
              objectFit: "contain",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
            }}
          />
        </Link>

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
          ← Return to Dashboard
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <VoiceLiveView sessionId={sessionId} />
      </div>
    </div>
  );
}
