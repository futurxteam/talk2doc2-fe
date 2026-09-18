import React, { useEffect, useState } from "react";
import {
  startSyndromicInterview,
  answerSyndromicQuestion,
} from "../api";

export default function Questionnaire({ payload, back, onComplete }) {
  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [emergency, setEmergency] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState(null);

  /* =============================
     START ENGINE
   ============================= */
  useEffect(() => {
    if (!payload?.chiefComplaints?.length || !payload?.bodyParts?.length) {
      back();
      return;
    }

    let cancelled = false;
    setLoading(true);

    startSyndromicInterview(payload)
      .then((res) => {
        if (cancelled) return;
        setSessionId(res.sessionId);
        setQuestions(res.questions || []);
        setEmergency(res.emergency || false);
        setEmergencyReason(res.emergencyReason || null);
      })
      .catch((err) => {
        console.error("Failed to start syndromic interview", err);
        back();
      })
      .finally(() => !cancelled && setLoading(false));

    return () => (cancelled = true);
  }, [payload]);

  /* =============================
     HANDLE ANSWER CHANGE
   ============================= */
  const handleAnswerChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  /* =============================
     SUBMIT ANSWERS (BATCH)
   ============================= */
  const handleNext = async () => {
    const batch = questions
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({
        questionId: q.id,
        answer: answers[q.id],
      }));

    if (!batch.length) return;

    setLoading(true);
    try {
      const res = await answerSyndromicQuestion({
        sessionId,
        answers: batch,
      });

      setAnswers({}); // Clear answers for next batch

      if (res.done) {
        onComplete(res);
        return;
      }

      setQuestions(res.questions || []);
      setEmergency(res.emergency || false);
      setEmergencyReason(res.emergencyReason || null);
    } catch (err) {
      console.error("Failed to submit answers", err);
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     GO BACK
   ============================= */
  const handleBack = async () => {
    setLoading(true);
    try {
      const res = await answerSyndromicQuestion({
        sessionId,
        action: "go_back",
      });

      setAnswers({});
      setQuestions(res.questions || []);
      setEmergency(res.emergency || false);
      setEmergencyReason(res.emergencyReason || null);
    } catch (err) {
      console.error("Failed to go back", err);
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     UI STATES
   ============================= */
  if (loading) return <p>Loading…</p>;
  if (!questions.length) return <p>Finalizing diagnosis…</p>;

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="step-content">
      <h2>Please answer the following questions</h2>

      {/* ⚠️ Emergency Banner */}
      {emergency && emergencyReason && (
        <div className="alert-danger">⚠️ {emergencyReason}</div>
      )}

      {questions.map((q, index) => (
        <div
          key={`${q.id}-${q.syndrome || "global"}-${index}`} // ← UNIQUE KEY FIX
          className="question-box"
        >
          <div className="question-title">
            {q.text}
            {/* Optional: Show syndrome origin for debugging */}
            {process.env.NODE_ENV === "development" && q.syndrome && (
              <small style={{ color: "#666", marginLeft: "8px" }}>
                ({q.syndrome})
              </small>
            )}
          </div>

          {q.type === "yesno" ? (
            <div className="yesno-row">
              <button
                className={`btn-yes ${answers[q.id] === "yes" ? "active" : ""}`}
                onClick={() => handleAnswerChange(q.id, "yes")}
              >
                Yes
              </button>
              <button
                className={`btn-no ${answers[q.id] === "no" ? "active" : ""}`}
                onClick={() => handleAnswerChange(q.id, "no")}
              >
                No
              </button>
              <button
                className={`btn-dont_know ${
                  answers[q.id] === "dont_know" ? "active" : ""
                }`}
                onClick={() => handleAnswerChange(q.id, "dont_know")}
              >
                Don’t know
              </button>
            </div>
          ) : (
            <div className="options">
              {q.options?.map((opt) => (
                <label key={opt.value} className="mcq-label">
                  <input
                    type="radio"
                    name={q.id} // Groups radios per question
                    checked={answers[q.id] === opt.value}
                    onChange={() => handleAnswerChange(q.id, opt.value)}
                  />
                  {opt.label}
                </label>
              ))}

                <label className="mcq-label dont-know">
      <input
        type="radio"
        name={q.id}
        checked={answers[q.id] === "dont_know"}
        onChange={() => handleAnswerChange(q.id, "dont_know")}
      />
      Don’t know
    </label>

            </div>
          )}
        </div>
      ))}

      <div className="nav-buttons nav-buttons--mt">
        <button onClick={handleBack} disabled={loading}>
          Back
        </button>
        <button
          className="primary"
          onClick={handleNext}
          disabled={!allAnswered || loading}
        >
          {loading ? "Submitting..." : "Next"}
        </button>
      </div>
    </div>
  );
}