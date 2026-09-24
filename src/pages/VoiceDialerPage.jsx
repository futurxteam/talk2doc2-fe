import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import VoiceDialer from "../components/voice/VoiceDialer";
import "../components/voice/voice.css";

export default function VoiceDialerPage() {
  const [searchParams] = useSearchParams();
  const [sessionId] = useState(() => {
    return (
      searchParams.get("session") ||
      searchParams.get("sessionId") ||
      "call_" + Math.random().toString(36).slice(2, 10)
    );
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#06201F",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 16px",
      }}
    >
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="/logo.jpg"
            alt="MyDoktor 24/7"
            style={{
              height: 34,
              borderRadius: 6,
              background: "#ffffff",
              padding: "2px 6px",
              objectFit: "contain",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.18)",
            }}
          />
        </Link>
        <Link
          to="/"
          style={{
            color: "#8DBFAF",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Return to MyDoktor 24/7
        </Link>
      </div>

      <VoiceDialer sessionId={sessionId} />
    </div>
  );
}
