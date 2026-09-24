import React from "react";
import { Link } from "react-router-dom";
import VoiceDialer from "../components/voice/VoiceDialer";
import "../components/voice/voice.css";

export default function VoiceDialerPage() {
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
      <div style={{ marginBottom: 16 }}>
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
          ← Return to Talk2Doc
        </Link>
      </div>

      <VoiceDialer />
    </div>
  );
}
