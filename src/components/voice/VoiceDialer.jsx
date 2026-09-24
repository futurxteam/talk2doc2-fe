import React, { useState, useEffect, useRef } from "react";
import API_BASE_URL from "../../config";
import "./voice.css";

export default function VoiceDialer({ onCallChange, sessionId: propSessionId }) {
  const [internalSessionId] = useState(() => "call_" + Math.random().toString(36).slice(2, 9));
  const activeSessionId = propSessionId || internalSessionId;

  const [screen, setScreen] = useState("dial"); // 'dial' | 'call'
  const [phase, setPhase] = useState("idle"); // 'idle' | 'ringing' | 'connected' | 'searching' | 'ended'
  const [statusText, setStatusText] = useState("Calling…");
  const [displayNumber, setDisplayNumber] = useState("1800 247 3658");
  const [callTimer, setCallTimer] = useState("00:00");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [doctorMatches, setDoctorMatches] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [textInput, setTextInput] = useState("");

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // WebRTC & Audio Refs
  const peerRef = useRef(null);
  const eventsRef = useRef(null);
  const micStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const stopRingRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const meterRafRef = useRef(null);
  const delegationsRef = useRef(new Map());
  const transcriptBufferRef = useRef([]);
  const hasGreetedRef = useRef(false);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    return audioCtxRef.current;
  };

  // Indian ringback tone: 400Hz double ring (0.4s on, 0.2s off, 0.4s on, 2.0s off)
  const startRingback = () => {
    const ac = getAudioContext();
    const gain = ac.createGain();
    gain.gain.value = 0;
    gain.connect(ac.destination);

    const osc = ac.createOscillator();
    osc.frequency.value = 400;
    osc.connect(gain);
    osc.start();

    let ringTimeout;
    const cycle = () => {
      const t = ac.currentTime;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.setValueAtTime(0, t + 0.4);
      gain.gain.setValueAtTime(0.12, t + 0.6);
      gain.gain.setValueAtTime(0, t + 1.0);
      ringTimeout = setTimeout(cycle, 3000);
    };
    cycle();

    return () => {
      clearTimeout(ringTimeout);
      gain.gain.cancelScheduledValues(0);
      gain.gain.value = 0;
      try {
        osc.stop();
      } catch (_) { }
    };
  };

  // Speech volume meter for the animated visualizer orb
  const startMeter = (stream) => {
    const ac = getAudioContext();
    const analyser = ac.createAnalyser();
    analyser.fftSize = 512;
    const source = ac.createMediaStreamSource(stream);
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    let smooth = 0;

    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (const v of data) {
        const x = (v - 128) / 128;
        sum += x * x;
      }
      const rms = Math.sqrt(sum / data.length);
      smooth = smooth * 0.75 + Math.min(1, rms * 6) * 0.25;

      const orbEl = document.getElementById("phone-voice-orb");
      if (orbEl) {
        orbEl.style.setProperty("--level", smooth.toFixed(3));
      }
      meterRafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  // Batch speech transcript to backend
  useEffect(() => {
    const interval = setInterval(() => {
      if (!transcriptBufferRef.current.length) return;
      const merged = [];
      for (const item of transcriptBufferRef.current) {
        const last = merged[merged.length - 1];
        if (last && last.role === item.role) {
          last.text += item.text;
        } else {
          merged.push({ ...item });
        }
      }
      transcriptBufferRef.current = [];
      merged.forEach((m) => {
        if (m.role === "assistant") {
          console.log(
            `%c🤖 Meera (AI): %c${m.text.trim()}`,
            "background: #064E3B; color: #34D399; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 13px;",
            "color: #065F46; font-weight: 600; font-size: 13px; line-height: 1.5;"
          );
        } else {
          console.log(
            `%c👤 Caller: %c${m.text.trim()}`,
            "background: #1E3A8A; color: #93C5FD; font-weight: bold; padding: 2px 6px; border-radius: 4px; font-size: 13px;",
            "color: #1E40AF; font-weight: 600; font-size: 13px; line-height: 1.5;"
          );
        }
        fetch(`${API_BASE_URL}/api/voice/transcript`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...m, sessionId: activeSessionId }),
        }).catch(() => { });
      });
    }, 350);

    return () => clearInterval(interval);
  }, []);

  const sendEvent = (evt) => {
    if (eventsRef.current && eventsRef.current.readyState === "open") {
      eventsRef.current.send(
        JSON.stringify({ event_id: crypto.randomUUID(), ...evt })
      );
    }
  };

  // Expose window.talk2doc for console testing
  useEffect(() => {
    window.talk2doc = {
      say: (text) => {
        console.log("💬 Sending user message to Meera:", text);
        sendEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text }],
          },
        });
        sendEvent({ type: "response.create" });
        fetch(`${API_BASE_URL}/api/voice/transcript`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "patient", text, sessionId: activeSessionId }),
        }).catch(() => { });
      },
      testBeep: () => {
        try {
          const ac = getAudioContext();
          ac.resume();
          const osc = ac.createOscillator();
          const gain = ac.createGain();
          osc.frequency.value = 587.33;
          gain.gain.setValueAtTime(0.2, ac.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ac.destination);
          osc.start();
          osc.stop(ac.currentTime + 0.6);
          console.log("🔊 Played test chime. If you heard it, audio output is working!");
        } catch (e) {
          console.error("Audio error:", e);
        }
      },
      status: () => {
        console.log("Talk2Doc Voice Diagnostic Status:", {
          screen,
          phase,
          isMuted,
          peerState: peerRef.current?.connectionState,
          iceState: peerRef.current?.iceConnectionState,
          dataChannelState: eventsRef.current?.readyState,
        });
      },
      book: (phone, name) => {
        return fetch(`${API_BASE_URL}/api/voice/book`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctor_id: selectedDoctorId || "d001",
            caller_phone: phone || "9847012345",
            patient_name: name || "Test Patient",
            sessionId: activeSessionId,
          }),
        })
          .then((r) => r.json())
          .then((d) => console.log("Booking result:", d));
      },
    };

    console.log(
      "%c🎙️ Talk2Doc Console Testing Utilities Active!\n" +
      "Type in console to test:\n" +
      "  window.talk2doc.testBeep()            // Test audio speaker output\n" +
      "  window.talk2doc.say('Hello Meera')    // Send text into call\n" +
      "  window.talk2doc.status()              // Check WebRTC & data channel status\n" +
      "  window.talk2doc.book('9847111222')    // Test instant booking",
      "color: #2FBF71; font-weight: bold; font-size: 13px;"
    );

    return () => {
      delete window.talk2doc;
    };
  }, [screen, phase, isMuted, selectedDoctorId]);

  // Run backend tools called by OpenAI Responses model
  const runTool = async (item) => {
    let args = {};
    try {
      args = JSON.parse(item.arguments || "{}");
    } catch (_) { }

    const done = (output) => ({ call_id: item.call_id, output });

    if (item.name === "flag_emergency") {
      await fetch(`${API_BASE_URL}/api/voice/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...args, sessionId: activeSessionId }),
      }).catch(() => { });
      setEmergencyAlert(true);
      return done({
        status: "emergency_flagged",
        note: "Instruct the caller to dial 108 or go to emergency immediately.",
      });
    }

    if (item.name === "record_assessment") {
      await fetch(`${API_BASE_URL}/api/voice/assessment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...args, sessionId: activeSessionId }),
      }).catch(() => { });
      setStatusText(`Specialist: ${args.specialty || "Recommended"}`);
      return done({
        status: "recorded",
        specialty: args.specialty,
        note: "Explain why this specialty suits them, then ask for their location preferences.",
      });
    }

    if (item.name === "find_specialists") {
      setStatusText("Finding matching doctors …");
      const res = await fetch(`${API_BASE_URL}/api/voice/find`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...args, sessionId: activeSessionId }),
      });
      const data = await res.json().catch(() => ({}));
      setStatusText("Meera · AI  Assistant");
      if (data?.matches) {
        setDoctorMatches(data);
      }
      return done(data);
    }

    if (item.name === "select_doctor") {
      setSelectedDoctorId(args.doctor_id);
      const res = await fetch(`${API_BASE_URL}/api/voice/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...args, sessionId: activeSessionId }),
      });
      const data = await res.json().catch(() => ({}));
      return done(data);
    }

    if (item.name === "book_appointment") {
      setStatusText("Registering Talk2Doc appointment…");
      const res = await fetch(`${API_BASE_URL}/api/voice/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: args.doctor_id,
          caller_phone: args.caller_phone,
          patient_name: args.patient_name,
          age: args.age,
          gender: args.gender,
          preferred_slot: args.preferred_slot,
          sessionId: activeSessionId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.booking) {
        setBookingConfirmed(data.booking);
        setStatusText("✅ Appointment Confirmed!");
      }
      return done(data);
    }

    return done({ status: "error", note: `Unknown tool ${item.name}` });
  };

  const onResponseEvent = async (delegationId, e) => {
    if (e.type === "response.output_item.done" && e.item?.type === "function_call") {
      const list = delegationsRef.current.get(delegationId) || [];
      list.push(runTool(e.item));
      delegationsRef.current.set(delegationId, list);
    } else if (e.type === "response.completed") {
      const list = delegationsRef.current.get(delegationId);
      if (!list?.length) return;
      delegationsRef.current.delete(delegationId);
      const results = await Promise.all(list);
      for (const r of results) {
        sendEvent({
          type: "response.item.create",
          item: {
            type: "function_call_output",
            call_id: r.call_id,
            output: JSON.stringify(r.output),
          },
        });
      }
      sendEvent({ type: "response.create" });
    }
  };

  const triggerInitialGreeting = () => {
    if (hasGreetedRef.current) return;
    hasGreetedRef.current = true;

    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    setPhase("connected");
    setStatusText("Meera · AI Assistant Connected");

    // Start call duration timer
    if (!timerIntervalRef.current) {
      const start = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const sec = Math.floor((Date.now() - start) / 1000);
        const m = String(Math.floor(sec / 60)).padStart(2, "0");
        const s = String(sec % 60).padStart(2, "0");
        setCallTimer(`${m}:${s}`);
      }, 500);
    }

    // Immediately trigger Meera to speak her opening greeting in English
    console.log("🗣️ Triggering initial Meera greeting in English...");
    sendEvent({
      type: "response.create",
      response: {
        instructions:
          "The call has connected right now. Greet the caller first immediately in warm, polite, natural English: 'Hello! I am Meera from MyDoktor24/7. Please tell me what symptoms or health concerns you are experiencing, and I will help you find the right specialist and book an appointment.' Speak this opening greeting out loud immediately. If the caller responds in Malayalam, Hindi, or Tamil, switch immediately to that language.",
      },
    });
  };

  const onLiveEvent = (evt) => {
    switch (evt.type) {
      case "session.created":
      case "session.started":
      case "session.updated":
        triggerInitialGreeting();
        break;

      case "session.input_transcript.delta":
        if (evt.delta) {
          transcriptBufferRef.current.push({ role: "patient", text: evt.delta });
        }
        break;

      case "session.output_transcript.delta":
        if (evt.delta) {
          transcriptBufferRef.current.push({ role: "assistant", text: evt.delta });
        }
        break;

      case "response.event":
        onResponseEvent(evt.delegation_id, evt.event);
        break;

      case "session.closed":
        teardownCall();
        break;

      default:
        break;
    }
  };

  const waitForIce = (pc) => {
    if (pc.iceGatheringState === "complete") return Promise.resolve();
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(), 300);
      pc.addEventListener("icecandidate", (e) => {
        if (e.candidate) {
          setTimeout(() => resolve(), 80);
        }
      });
      pc.addEventListener("icegatheringstatechange", function handler() {
        if (pc.iceGatheringState === "complete") {
          clearTimeout(timeout);
          pc.removeEventListener("icegatheringstatechange", handler);
          resolve();
        }
      });
    });
  };

  const teardownCall = () => {
    if (meterRafRef.current) cancelAnimationFrame(meterRafRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (eventsRef.current) eventsRef.current.close();
    if (peerRef.current) peerRef.current.close();
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    hasGreetedRef.current = false;
    peerRef.current = null;
    eventsRef.current = null;
    micStreamRef.current = null;
    delegationsRef.current.clear();
  };

  const startCall = async () => {
    hasGreetedRef.current = false;
    setErrorMsg("");
    setEmergencyAlert(false);
    setScreen("call");
    setPhase("ringing");
    setStatusText("Connecting to Meera AI…");

    try {
      const ac = getAudioContext();
      await ac.resume();
      stopRingRef.current = startRingback();

      const peer = new RTCPeerConnection();
      peer.addEventListener("track", (e) => {
        console.log("🔊 WebRTC audio track received:", e.track.kind, e.track.id);
        const stream = new MediaStream([e.track]);
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;
          remoteAudioRef.current.play().then(() => {
            console.log("▶️ Meera voice audio is playing!");
            setTimeout(() => triggerInitialGreeting(), 300);
          }).catch((err) => {
            console.warn("⚠️ Audio autoplay warning:", err);
            setTimeout(() => triggerInitialGreeting(), 300);
          });
        }
        startMeter(stream);
      });

      peer.onconnectionstatechange = () => {
        console.log("📡 WebRTC Connection State:", peer.connectionState);
      };
      peer.oniceconnectionstatechange = () => {
        console.log("🧊 ICE Connection State:", peer.iceConnectionState);
      };

      const mic = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      console.log("🎤 Microphone active:", mic.getAudioTracks().map((t) => t.label).join(", "));
      micStreamRef.current = mic;
      mic.getAudioTracks().forEach((track) => peer.addTrack(track, mic));

      const events = peer.createDataChannel("oai-events");
      eventsRef.current = events;
      events.onopen = () => {
        console.log("🟢 DataChannel 'oai-events' is OPEN");
        setTimeout(() => triggerInitialGreeting(), 300);
      };
      events.onclose = () => console.log("🔴 DataChannel 'oai-events' CLOSED");
      events.onerror = (err) => console.error("⚠️ DataChannel ERROR:", err);

      events.addEventListener("message", ({ data }) => {
        try {
          const evt = JSON.parse(data);
          onLiveEvent(evt);
        } catch (_) { }
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await waitForIce(peer);

      const res = await fetch(`${API_BASE_URL}/api/voice/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sdp: peer.localDescription.sdp,
          sessionId: activeSessionId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const sessionResult = await res.json();
      if (!sessionResult?.transport?.sdp) {
        throw new Error(
          sessionResult?.error ||
          "Could not establish WebRTC live connection with Meera AI."
        );
      }

      await peer.setRemoteDescription({
        type: "answer",
        sdp: sessionResult.transport.sdp,
      });
    } catch (err) {
      console.error("Start call failed:", err);
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      teardownCall();
      setScreen("dial");
      setPhase("idle");
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Microphone access is required to make the call."
          : `Call failed: ${err.message}`
      );
    }
  };

  const endCall = () => {
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    fetch(`${API_BASE_URL}/api/voice/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: activeSessionId }),
    }).catch(() => { });
    teardownCall();

    setPhase("ended");
    setStatusText("Call ended");
    setTimeout(() => {
      setScreen("dial");
      setPhase("idle");
      setCallTimer("00:00");
    }, 1800);
  };

  const toggleMute = () => {
    if (!micStreamRef.current) return;
    const nextState = !isMuted;
    setIsMuted(nextState);
    micStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !nextState;
    });
  };

  const handleKeyClick = (digit) => {
    setDisplayNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setDisplayNumber((prev) => prev.slice(0, -1));
  };

  const handleDoctorSelect = (doc) => {
    setSelectedDoctorId(doc.id);
    fetch(`${API_BASE_URL}/api/voice/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctor_id: doc.id, sessionId: activeSessionId }),
    }).catch(() => { });
  };

  const handleTriggerBooking = (doc) => {
    setSelectedDoctorId(doc.id);
    setShowBookingModal(true);
  };

  const submitManualBooking = async (e) => {
    e.preventDefault();
    if (!patientPhone) return;

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/voice/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: selectedDoctorId,
          caller_phone: patientPhone,
          patient_name: patientName || "Caller Patient",
          preferred_slot: "Tomorrow 10:00 AM",
          sessionId: activeSessionId,
        }),
      });
      const data = await res.json();
      if (data?.booking) {
        setBookingConfirmed(data.booking);
        setShowBookingModal(false);
        setStatusText("✅ Appointment Confirmed!");
      }
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="phone-pane">
      <div className="pane-label">
        📞 Caller View <span>phoning MyDoktor 24/7 AI Line</span>
      </div>

      <div className="phone-shell">
        {/* Real DOM audio element for browser audio playback */}
        <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: "none" }} />

        {screen === "dial" ? (
          /* ================= DIALER SCREEN ================= */
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div className="phone-top-bar">
              <p className="phone-app-title">Mydoktor 24/7 AI Medical Line</p>
              <p className="phone-display-number">{displayNumber || " "}</p>
            </div>

            <div className="phone-keypad">
              {[
                ["1", ""],
                ["2", "ABC"],
                ["3", "DEF"],
                ["4", "GHI"],
                ["5", "JKL"],
                ["6", "MNO"],
                ["7", "PQRS"],
                ["8", "TUV"],
                ["9", "WXYZ"],
                ["*", ""],
                ["0", "+"],
                ["#", ""],
              ].map(([num, letters]) => (
                <button
                  key={num}
                  className="keypad-key"
                  onClick={() => handleKeyClick(num)}
                  aria-label={num}
                >
                  <b>{num}</b>
                  <small>{letters}</small>
                </button>
              ))}
            </div>

            <div className="phone-dial-actions">
              <button
                className="btn-circle btn-circle-call"
                onClick={startCall}
                title="Place Call"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
                  <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
                </svg>
              </button>

              <button
                className="btn-circle btn-circle-back"
                onClick={handleBackspace}
                title="Delete"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 5H9l-6 7 6 7h12z" />
                  <path d="m12 9 6 6m0-6-6 6" />
                </svg>
              </button>
            </div>

            <p className="phone-helper-hint">
              Speak with Meera, our clinical AI assistant, who finds the right specialist and registers your appointment.
            </p>

            {errorMsg && (
              <p style={{ color: "#FF8E8E", fontSize: 13, textAlign: "center", marginTop: 10 }}>
                {errorMsg}
              </p>
            )}
          </div>
        ) : (
          /* ================= IN-CALL SCREEN (Clean Phone Interface) ================= */
          <div className="incall-view">
            <h3 className="incall-title">MyDoktor 24/7 · Meera AI</h3>
            <p className="incall-status">{statusText}</p>
            <p className="incall-timer">{callTimer}</p>

            {/* Pulsing Visualizer Orb */}
            <div
              id="phone-voice-orb"
              className={`orb-container ${phase === "ringing" ? "is-ringing" : ""}`}
            >
              <span className="orb-ring"></span>
              <span className="orb-ring"></span>
              <span className="orb-ring"></span>
              <span className="orb-avatar">M</span>
            </div>

            {/* Emergency Alert */}
            {emergencyAlert && (
              <div className="phone-alert-banner">
                ⚠️ Emergency red-flag symptoms reported. Call <b>108</b> immediately or visit the nearest ER.
              </div>
            )}


            {/* Call Controls */}
            <div className="incall-actions">
              <div className="incall-action-col">
                <button
                  className={`btn-circle btn-mute ${isMuted ? "is-muted" : ""}`}
                  onClick={toggleMute}
                  title="Mute"
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                  </svg>
                </button>
                <span>{isMuted ? "Unmute" : "Mute"}</span>
              </div>

              <div className="incall-action-col">
                <button className="btn-circle btn-end" onClick={endCall} title="End Call">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#fff">
                    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1a1 1 0 0 1-.56.9 11.5 11.5 0 0 0-2.66 1.85 1 1 0 0 1-1.41 0L.29 13.08a1 1 0 0 1 0-1.41C3.34 8.77 7.46 7 12 7s8.66 1.77 11.71 4.67a1 1 0 0 1 0 1.41l-2.48 2.49a1 1 0 0 1-1.41 0 11.3 11.3 0 0 0-2.66-1.85 1 1 0 0 1-.56-.9v-3.1A15 15 0 0 0 12 9z" />
                  </svg>
                </button>
                <span>End</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
