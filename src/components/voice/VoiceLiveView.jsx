import React, { useState, useEffect, useRef } from "react";
import API_BASE_URL from "../../config";
import "./voice.css";

const URGENCY_LABELS = {
  routine: "Routine",
  soon: "See Soon",
  same_day: "Same Day (Urgent)",
};

export default function VoiceLiveView() {
  const [callState, setCallState] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [duration, setDuration] = useState("0:00");

  const audioCtxRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Sound chime synthesizer
  const playChime = (frequencies = [660, 880], urgent = false) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      const t0 = ctx.currentTime;
      const repeats = urgent ? 3 : 1;

      for (let r = 0; r < repeats; r++) {
        frequencies.forEach((f, i) => {
          const t = t0 + r * 0.5 + i * 0.15;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = f;

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.2, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.32);
        });
      }
    } catch (_) { }
  };

  const toggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      await ctx.resume();
      playChime([660, 880]);
    }
  };

  // Connect to SSE stream
  useEffect(() => {
    const sseUrl = `${API_BASE_URL}/api/voice/events`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log("Connected to Live Voice SSE stream");
    };

    eventSource.onerror = () => {
      // Graceful reconnect
    };

    eventSource.addEventListener("snapshot", (e) => {
      try {
        const data = JSON.parse(e.data);
        setCallState(data);
        if (data?.transcript) setTranscript(data.transcript);
      } catch (_) { }
    });

    eventSource.addEventListener("call_started", (e) => {
      try {
        const data = JSON.parse(e.data);
        setCallState(data);
        setTranscript([]);
        playChime([520, 660]);
      } catch (_) { }
    });

    eventSource.addEventListener("transcript", (e) => {
      try {
        const { role, text } = JSON.parse(e.data);
        setTranscript((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === role) {
            return [...prev.slice(0, -1), { role, text: last.text + text }];
          }
          return [...prev, { role, text }];
        });
      } catch (_) { }
    });

    eventSource.addEventListener("emergency", (e) => {
      try {
        const data = JSON.parse(e.data);
        setCallState((prev) => (prev ? { ...prev, emergency: data } : prev));
        playChime([880, 660], true);
      } catch (_) { }
    });

    eventSource.addEventListener("assessment", (e) => {
      try {
        const data = JSON.parse(e.data);
        setCallState((prev) => (prev ? { ...prev, assessment: data } : prev));
        playChime([660, 880]);
      } catch (_) { }
    });

    eventSource.addEventListener("search", (e) => {
      try {
        const data = JSON.parse(e.data);
        setCallState((prev) => (prev ? { ...prev, search: data, selected: null } : prev));
        playChime([660, 880, 1100]);
      } catch (_) { }
    });

    eventSource.addEventListener("selected", (e) => {
      try {
        const data = JSON.parse(e.data);
        setCallState((prev) => (prev ? { ...prev, selected: data } : prev));
        playChime([880, 1100]);
      } catch (_) { }
    });

    eventSource.addEventListener("booking_confirmed", (e) => {
      try {
        const data = JSON.parse(e.data);
        setCallState((prev) => (prev ? { ...prev, booking: data } : prev));
        playChime([520, 660, 880, 1040]);
      } catch (_) { }
    });

    eventSource.addEventListener("ended", () => {
      setCallState((prev) => (prev ? { ...prev, status: "ended" } : prev));
    });

    return () => {
      eventSource.close();
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [soundEnabled]);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Duration timer
  useEffect(() => {
    if (callState?.startedAt) {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = setInterval(() => {
        const end = callState.endedAt || Date.now();
        const sec = Math.max(0, Math.floor((end - callState.startedAt) / 1000));
        const m = Math.floor(sec / 60);
        const s = String(sec % 60).padStart(2, "0");
        setDuration(`${callState.status === "ended" ? "Ended · " : ""}${m}:${s}`);
      }, 1000);
    }
  }, [callState?.startedAt, callState?.status]);

  const hasActiveCall = Boolean(callState && callState.status !== "ended");
  const assessment = callState?.assessment;
  const search = callState?.search;
  const emergency = callState?.emergency;
  const booking = callState?.booking;
  const selected = callState?.selected;

  return (
    <div className="live-pane">
      <div className="pane-label">
        🖥️ Live View <span>Clinical Intelligence Monitor</span>
      </div>

      <div className="live-card">
        <div className="live-header">
          <h2>
            <span> Meera</span>
            <small style={{ fontSize: 13, color: "var(--v-muted)", fontWeight: 500 }}>
              Live Clinical Feed · Kochi
            </small>
          </h2>

          <button
            className="sound-toggle-btn"
            onClick={toggleSound}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? "🔊 Sound Chimes ON" : "🔇 Sound Alerts OFF"}
          </button>
        </div>

        {!callState ? (
          <div className="empty-live-state">
            <span className="pulse-dot"></span>
            <h3 style={{ fontSize: 20, color: "var(--v-ink)", marginBottom: 8 }}>
              No Active Clinical Call
            </h3>
            <p style={{ maxWidth: 440, margin: "0 auto", lineHeight: 1.5, fontSize: 14 }}>
              When a caller dials <b>1800 247 3658</b>, you will see real-time speech transcripts,
              recommended medical specialties, location matching, and automated booking receipts.
            </p>
          </div>
        ) : (
          <div className="live-grid">
            {/* Left Column: Clinical Assessment & Matches */}
            <div className="live-col">
              {/* Emergency Banner */}
              {emergency && (
                <div
                  style={{
                    background: "#D6383E",
                    color: "#fff",
                    borderRadius: 12,
                    padding: 14,
                    lineHeight: 1.45,
                    fontSize: 14,
                  }}
                >
                  <strong style={{ display: "block", fontSize: 16 }}>
                    🚨 RED-FLAG EMERGENCY: {emergency.red_flag}
                  </strong>
                  <span>{emergency.details}</span>
                  <div style={{ marginTop: 6, fontWeight: 700 }}>
                    Caller instructed to dial 108 immediately.
                  </div>
                </div>
              )}

              {/* Confirmed Booking Banner */}
              {booking && (
                <div className="confirmed-booking-banner">
                  <h4>✅ Verified MyDoktor24/7 Booking Registered</h4>
                  <p>
                    <b>Patient:</b> {booking.patient.name} ({booking.patient.phone})
                  </p>
                  <p>
                    <b>Doctor:</b> {booking.doctor.name} — {booking.doctor.specialization}
                  </p>
                  <p>
                    <b>Slot:</b> {booking.appointment.date} @ {booking.appointment.timeSlot}
                  </p>
                  <p>
                    <b>Booking ID:</b> #{String(booking.bookingId).slice(-6)} · Status: Confirmed
                  </p>
                </div>
              )}

              {/* Recommended Specialist Panel */}
              <div className="live-panel">
                <div className="live-panel-title">Recommended Specialty</div>
                {!assessment ? (
                  <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                    Meera is currently conducting symptom intake…
                  </p>
                ) : (
                  <div>
                    <div className="spec-badge-row">
                      <span className="spec-name">{assessment.specialty}</span>
                      <span
                        className={`urgency-badge urgency-${assessment.urgency || "routine"}`}
                      >
                        {URGENCY_LABELS[assessment.urgency] || assessment.urgency}
                      </span>
                    </div>
                    <p className="live-reason">{assessment.reason}</p>
                    <p className="live-symptoms">
                      <b>Summary:</b> {assessment.symptoms_summary}{" "}
                      {assessment.age && assessment.age !== "not stated" && `· Age ${assessment.age}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Doctor Directory Search Panel */}
              <div className="live-panel" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <div className="live-panel-title">Matching Specialist Directory</div>

                {!search ? (
                  <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                    Doctors will be fetched once caller preferences are provided.
                  </p>
                ) : (
                  <div>
                    {/* Preference Chips */}
                    <div className="filter-chips">
                      <span className="filter-chip">
                        <b>Area:</b> {search.preferences.locality}
                      </span>
                      <span className="filter-chip">
                        <b>Within:</b> {search.preferences.max_distance_km} km
                      </span>
                      <span className="filter-chip">
                        <b>Doctor:</b> {search.preferences.gender}
                      </span>
                      <span className="filter-chip">
                        <b>Insurance:</b> {search.preferences.insurance}
                      </span>
                    </div>

                    {/* Relaxation note */}
                    {search.relaxed?.length > 0 && (
                      <div className="relaxed-box">
                        ⚡ <b>Search Relaxation:</b> Meera {search.relaxed.join("; ")}.
                      </div>
                    )}

                    {/* Doctor Matches List */}
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                      {search.matches.map((doc) => {
                        const isChosen = selected?.id === doc.id;
                        return (
                          <div
                            key={doc.id}
                            style={{
                              border: isChosen ? "2px solid #2FBF71" : "1px solid #DCE6E2",
                              background: isChosen ? "#F2FBF6" : "#FFFFFF",
                              borderRadius: 12,
                              padding: 12,
                              transition: "all 0.2s",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <strong style={{ fontSize: 15, color: "var(--v-ink)" }}>{doc.name}</strong>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#2F7D5F" }}>
                                {doc.distance_km} km away
                              </span>
                            </div>

                            <div style={{ fontSize: 12, color: "var(--v-muted)", marginTop: 2 }}>
                              {doc.qualifications} · {doc.clinic} ({doc.locality})
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                              <span className="filter-chip">₹{doc.fee_inr} fee</span>
                              <span className="filter-chip">{doc.years_experience} yrs exp</span>
                              <span className="filter-chip">{doc.languages?.join(", ")}</span>
                              {doc.insurance_covered && (
                                <span className="filter-chip" style={{ background: "#DDF3E6", color: "#1D6B45" }}>
                                  Insurance Covered
                                </span>
                              )}
                            </div>

                            {isChosen && (
                              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#1D6B45" }}>
                                ★ Caller's Chosen Doctor
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Live Conversation Transcript */}
            <div className="live-panel transcript-col">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <div className="live-panel-title" style={{ margin: 0 }}>
                  Live Dialogue Stream
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--v-muted)" }}>
                  {duration}
                </span>
              </div>

              <div className="transcript-scroll">
                {transcript.length === 0 ? (
                  <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", margin: "auto" }}>
                    Awaiting conversational speech…
                  </p>
                ) : (
                  transcript.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.role}`}>
                      <div className="chat-speaker">
                        {msg.role === "patient" ? "Caller (Patient)" : "Meera "}
                      </div>
                      <div>{msg.text}</div>
                    </div>
                  ))
                )}
                <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
