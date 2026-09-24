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
          <span>MyDoktor24/7 · Voice Hotline</span>
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
