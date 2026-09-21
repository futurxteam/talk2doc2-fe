import React, { useEffect, useRef, useState } from "react";
import {
  startSyndromicInterview,
  answerSyndromicQuestion,
  getPrimaryRegions,
  getSubParts,
  getSymptomsForPart,
} from "../pages/api";
import "./style/MedicalChatbot.css";
import NearbyClinics from "../pages/interview/NearbyClinics";
import { getCurrentUser } from "../api/usersApi";
import { useNavigate } from "react-router-dom";

export default function SyndromicChatbot({ back, onComplete, height = "600px" }) {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const isPatient = currentUser && currentUser.role === "PATIENT";

  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState("select_region");
  const [regions, setRegions] = useState([]);
  const [subParts, setSubParts] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [region, setRegion] = useState("");
  const [finalResult, setFinalResult] = useState(null);

  const [subPart, setSubPart] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [habits, setHabits] = useState([
    { key: "smoking", label: "Smoking", selected: false },
    { key: "alcohol", label: "Alcohol consumption", selected: false },
    { key: "diabetes", label: "Known Diabetes", selected: false },
    { key: "hypertension", label: "Hypertension", selected: false },
    { key: "heart_disease", label: "Heart Disease", selected: false },
    { key: "close_contact", label: "Close contact with infected", selected: false },
    { key: "crowded_living", label: "Crowded living conditions", selected: false },
    { key: "no_vaccination", label: "Lack of vaccination", selected: false },
    { key: "unsafe_water", label: "Unsafe drinking water", selected: false },
  ]);

  const [sessionId, setSessionId] = useState(null);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [batchAnswers, setBatchAnswers] = useState([]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // INIT
  useEffect(() => {
    getPrimaryRegions().then(setRegions);
    setMessages([{ from: "bot", text: "👋 Hello! Which body region is affected?" }]);
  }, []);

  // HELPERS
  const bot = (text) => setMessages((m) => [...m, { from: "bot", text }]);
  const user = (text) => setMessages((m) => [...m, { from: "user", text }]);

  // STEP HANDLERS
  const chooseRegion = async (r) => {
    user(r.label || r.name);
    setRegion(r.name);
    const parts = await getSubParts(r.name);
    setSubParts(parts || []);
    setStep("select_part");
    bot("Which part exactly?");
  };

  const choosePart = async (p) => {
    user(p.label || p.name);
    setSubPart(p.name);
    const s = await getSymptomsForPart(region, p.name);
    setSymptoms(s?.symptoms || []);
    setStep("select_symptoms");
    bot("Select all symptoms you're experiencing:");
  };

  const toggleSymptom = (s) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s.label)
        ? prev.filter((x) => x !== s.label)
        : [...prev, s.label]
    );
  };

  const confirmSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      bot("Please select at least one symptom.");
      return;
    }
    user(selectedSymptoms.join(", "));
    setStep("ask_age");
    bot("What is your age?");
  };

  const submitAge = (value) => {
    if (!value || isNaN(value) || value < 0 || value > 120) return;
    user(value);
    setAge(Number(value));
    setStep("ask_sex");
    bot("Biological sex?");
  };

  const submitSex = (s) => {
    user(s);
    setSex(s);
    setStep("ask_habits");
    bot("Do you have any of these conditions / habits?");
  };

  const toggleHabit = (key) => {
    setHabits((prev) =>
      prev.map((h) => (h.key === key ? { ...h, selected: !h.selected } : h))
    );
  };

  const submitHabits = async () => {
    const selected = habits.filter((h) => h.selected).map((h) => h.key);
    user(selected.length ? selected.join(", ") : "None");

    bot("Starting medical assessment...");

    const payload = {
      chiefComplaints: selectedSymptoms,
      bodyParts: [subPart],
      age: Number(age),
      sex,
      habits: selected,
    };

    const res = await startSyndromicInterview(payload);
    setSessionId(res.sessionId);
    setPendingQuestions(res.questions || []);
    setCurrentIndex(0);
    setBatchAnswers([]);

    if (res.questions?.length) {
      setStep("engine_questions");
      bot(res.questions[0].text);
    } else {
      bot("No further questions at this time.\nPlease consult a doctor.");
      setStep("done");
    }
  };

  const sendEngineAnswer = async (answer) => {
    const q = pendingQuestions[currentIndex];
    if (!q) return;

    user(answer);

    const newBatch = [...batchAnswers, { questionId: q.id, answer }];
    setBatchAnswers(newBatch);

    const nextIndex = currentIndex + 1;
    if (nextIndex < pendingQuestions.length) {
      setCurrentIndex(nextIndex);
      bot(pendingQuestions[nextIndex].text);
      return;
    }

    // Submit batch when all questions answered
    const res = await answerSyndromicQuestion({
      sessionId,
      answers: newBatch,
    });

    setBatchAnswers([]);

    if (res.done) {
      showFinal(res);
      return;
    }

    setPendingQuestions(res.questions || []);
    setCurrentIndex(0);

    if (res.questions?.length) {
      bot(res.questions[0].text);
    }
  };

  const showFinal = (res) => {
    setFinalResult(res);

    bot("✅ Assessment completed.");

    if (res.emergency) {
      bot("🚨 " + res.emergencyReason);
    }

    if (res.topDiagnosis) {
      bot(
        `🧠 Most likely: ${res.topDiagnosis.name} (${(res.topDiagnosis.score * 100).toFixed(1)}%)`
      );
    }

    bot("Would you like me to find doctors near you?");

    setStep("ask_doctors");
  };

  // RENDER CONTROLS
  const currentQuestion = pendingQuestions[currentIndex];

  const renderControls = () => {
    if (step === "select_region") {
      return (
        <div className="options-scrollable">
          {regions.map((r) => (
            <button key={r.name} className="chip" onClick={() => chooseRegion(r)}>
              {r.label || r.name}
            </button>
          ))}
        </div>
      );
    }
    if (step === "ask_doctors") {
      return (
        <div className="options-scrollable">
          <button
            className="chip"
            onClick={() => {
              user("Yes, show nearby doctors");
              setStep("show_doctors");
            }}
          >
            🏥 Yes, show nearby doctors
          </button>

          <button
            className="chip"
            onClick={() => {
              user("No, just show my results");
              bot("Alright. Here is your summary. You can consult a doctor anytime if symptoms persist.");
              setStep("done");
            }}
          >
            📄 No, just show results
          </button>
        </div>
      );
    }
    if (step === "show_doctors" && finalResult) {
      // Pick best specialty automatically
      const best = finalResult.results?.[0];
      const specialty = best?.category || "General Medicine";

      return (
        <div style={{ width: "100%", maxHeight: 300, overflowY: "auto" }}>
          <NearbyClinics
            specialty={specialty}
            assessmentId={finalResult._id}
          />
        </div>
      );
    }

    if (step === "select_part") {
      return (
        <div className="options-scrollable">
          {subParts.map((p) => (
            <button key={p.name} className="chip" onClick={() => choosePart(p)}>
              {p.label || p.name}
            </button>
          ))}
        </div>
      );
    }

    if (step === "select_symptoms") {
      return (
        <div className="options-container">
          <div className="options-scrollable">
            {symptoms.map((s) => (
              <div
                key={s.value}
                className={`chip ${selectedSymptoms.includes(s.label) ? "active" : ""}`}
                onClick={() => toggleSymptom(s)}
              >
                {s.label}
              </div>
            ))}
          </div>
          <button
            className="primary continue-btn"
            onClick={confirmSymptoms}
            disabled={selectedSymptoms.length === 0}
          >
            Continue {selectedSymptoms.length > 0 && `(${selectedSymptoms.length})`}
          </button>
        </div>
      );
    }

    if (step === "ask_age") {
      return (
        <div className="options-container">
          <input
            className="age-input"
            placeholder="Your age"
            type="number"
            min="0"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAge(e.target.value)}
            autoFocus
          />
          <button className="primary continue-btn" onClick={() => submitAge(age)}>
            Continue
          </button>
        </div>
      );
    }

    if (step === "ask_sex") {
      return (
        <div className="options-scrollable">
          <button className="chip" onClick={() => submitSex("male")}>Male</button>
          <button className="chip" onClick={() => submitSex("female")}>Female</button>
          <button className="chip" onClick={() => submitSex("other")}>Other</button>
        </div>
      );
    }

    if (step === "ask_habits") {
      return (
        <div className="options-container">
          <div className="options-scrollable habits-grid">
            {habits.map((h) => (
              <div
                key={h.key}
                className={`chip ${h.selected ? "active" : ""}`}
                onClick={() => toggleHabit(h.key)}
              >
                {h.label}
              </div>
            ))}
          </div>
          <button className="primary continue-btn" onClick={submitHabits}>
            Continue
          </button>
        </div>
      );
    }

    if (step === "engine_questions" && currentQuestion) {
      return (
        <div className="options-container">
          <div className="options-scrollable">
            {currentQuestion.type === "mcq" ? (
              currentQuestion.options?.map((opt) => (
                <button
                  key={opt.value}
                  className="chip"
                  onClick={() => sendEngineAnswer(opt.value)}
                >
                  {opt.label}
                </button>
              ))
            ) : (
              <>
                <button className="chip" onClick={() => sendEngineAnswer("yes")}>Yes</button>
                <button className="chip" onClick={() => sendEngineAnswer("no")}>No</button>
              </>
            )}
            <button className="chip" onClick={() => sendEngineAnswer("dont_know")}>
              Not sure / Don't know
            </button>
          </div>
        </div>
      );
    }

    return null;
  };
  // 🔒 Not logged in
  if (!currentUser) {
    return (
      <div className="chatbot-container" style={{ height }}>
        <div className="chatbot-header">
          <span>🩺 Medical Assistant</span>
          <button className="close-btn" onClick={back}>✕</button>
        </div>

        <div className="chat-window" style={{ textAlign: "center", padding: 20 }}>
          <h3>🔐 Login Required</h3>
          <p>Please login or signup to use the medical assistant.</p>

          <button
            className="primary"
            onClick={() => {
              navigate("/login?redirect=/");
            }}
          >
            Login / Signup
          </button>
        </div>
      </div>
    );
  }

  // ⛔ Logged in but not patient
  if (!isPatient) {
    return (
      <div className="chatbot-container" style={{ height }}>
        <div className="chatbot-header">
          <span>🩺 Medical Assistant</span>
          <button className="close-btn" onClick={back}>✕</button>
        </div>

        <div className="chat-window" style={{ textAlign: "center", padding: 20 }}>
          <h3>⛔ Access Restricted</h3>
          <p>
            This medical assistant is only available for patient accounts.
          </p>

          <p className="muted">
            Your current role: <b>{currentUser.role}</b>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbot-container" style={{ height }}>
      <div className="chatbot-header">
        <span>🩺 Medical Assistant</span>
        <button className="close-btn" onClick={back}>✕</button>
      </div>

      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            {m.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="answer-bar">{renderControls()}</div>
    </div>
  );
}