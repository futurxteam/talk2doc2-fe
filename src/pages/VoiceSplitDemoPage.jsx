import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import VoiceDialer from "../components/voice/VoiceDialer";
import VoiceLiveView from "../components/voice/VoiceLiveView";
import "../components/voice/voice.css";

export default function VoiceSplitDemoPage() {
  const [searchParams] = useSearchParams();
  const [sessionId] = useState(() => {
    return (
      searchParams.get("session") ||
      searchParams.get("sessionId") ||
      "call_" + Math.random().toString(36).slice(2, 10)
    );
  });

  return (
    <div className="voice-demo-container">
      {/* Top Navigation Bar */}
      <header className="voice-demo-header">
        <div className="voice-brand-logo">
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: 10 }}>
            <img
              src="/logo.jpg"
              alt="MyDoktor 24/7 Logo"
              className="voice-header-logo-img"
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>


            </div>
          </Link>
          <span className="voice-brand-badge">24/7 AI Triage & Booking</span>
        </div>

        <nav className="voice-nav-actions">
          <Link to="/appointments" className="voice-nav-btn">
            📅 My Appointments
          </Link>
        </nav>
      </header>

      {/* Split Dual-Pane View */}
      <main className="voice-split-body">
        <VoiceDialer sessionId={sessionId} />
        <VoiceLiveView sessionId={sessionId} />
      </main>
    </div>
  );
}
