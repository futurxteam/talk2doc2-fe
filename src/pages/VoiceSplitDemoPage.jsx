import React from "react";
import { Link } from "react-router-dom";
import VoiceDialer from "../components/voice/VoiceDialer";
import VoiceLiveView from "../components/voice/VoiceLiveView";
import "../components/voice/voice.css";

export default function VoiceSplitDemoPage() {
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
        <VoiceDialer />
        <VoiceLiveView />
      </main>
    </div>
  );
}
