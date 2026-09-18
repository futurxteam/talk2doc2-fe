import React from "react";
import "../style/Results.css";  // Isolated styles – no conflicts with other pages
import NearbyClinics from "./NearbyClinics";
import { saveAssessmentResult } from "../../api/usersApi";
import { getCurrentUser } from "../../api/usersApi";
import { useNavigate } from "react-router-dom";

export default function Results({ payload, restart }) {
  const [openMapFor, setOpenMapFor] = React.useState(null);
const hasSavedRef = React.useRef(false);

const navigate = useNavigate();
const user = getCurrentUser();
const isPatient = user && user.role === "PATIENT";
React.useEffect(() => {
  if (!payload) return;

  // ⛔ Only PATIENT can save
  if (!isPatient) return;

  // ⛔ Prevent double save
  if (hasSavedRef.current) return;

  hasSavedRef.current = true;

  saveAssessmentResult(payload).catch((err) => {
    console.error("Failed to save assessment:", err);
  });
}, [payload, isPatient]);


if (!payload) return <p>Analyzing…</p>;

// 🚨 Not logged in or not patient
if (!isPatient) {
  return (
    <div className="results-page">
      <h2>Login Required</h2>
      <p>
        Please login or signup to save your assessment and view nearby doctors.
      </p>

      <button
        className="primary large"
        onClick={() => {
          // Save assessment temporarily
          sessionStorage.setItem("pendingAssessment", JSON.stringify(payload));

          // Redirect to login
navigate("/login?redirect=/interview");
        }}
      >
        Login / Signup
      </button>
    </div>
  );
}
// 🔥 HARD-CODED CATEGORY NORMALIZATION (UI ONLY)

const CATEGORY_MAP = {
  // Cardiology
  cardiovascular: "Cardiology",
  cerebrovascular: "Cardiology",
  vascular: "Cardiology",

  // Neurology
  neurological: "Neurology",
  neurocognitive: "Neurology",
  neurodevelopmental: "Neurology",
  neuropsychiatric: "Neurology",
  neuromuscular_genetic: "Neurology",
  neurological_autoimmune: "Neurology",
  neurological_autonomic: "Neurology",
  neurological_cranial_nerve: "Neurology",
  neurological_degenerative: "Neurology",
  neurological_demyelinating: "Neurology",
  neurological_genetic: "Neurology",
  neurological_headache_disorder: "Neurology",
  neurological_infectious: "Neurology",
  neurological_miscellaneous: "Neurology",
  neurological_movement_disorder: "Neurology",
  neurological_myopathy: "Neurology",
  neurological_neurodevelopmental: "Neurology",
  neurological_neuromuscular_junction: "Neurology",
  neurological_pain_disorder: "Neurology",
  neurological_paralysis: "Neurology",
  neurological_peripheral_nerve: "Neurology",
  neurological_procedural: "Neurology",
  neurological_secondary: "Neurology",
  neurological_seizure_disorder: "Neurology",
  neurological_sequelae: "Neurology",
  neurological_sleep_disorder: "Neurology",
  neurological_spinal: "Neurology",
  neurological_structural: "Neurology",
  neurological_toxic: "Neurology",
  neurological_vascular: "Neurology",

  // Orthopedics / MSK
  bone: "Orthopedics",
  cartilage: "Orthopedics",
  musculoskeletal: "Orthopedics",
  spine: "Orthopedics",
  soft_tissue: "Orthopedics",

  // Rheumatology
  connective_tissue: "Rheumatology",

  // ENT
  ear_disorder: "ENT",
  ear_vestibular_disorder: "ENT",
  inner_ear_disorder: "ENT",
  secondary_vestibular_disorder: "ENT",
  otolaryngology: "ENT",

  // Eye
  ophthalmic: "Ophthalmology",

  // Skin
  dermatological: "Dermatology",

  // Gastro / Liver
  gastrointestinal: "Gastroenterology",
  hepatobiliary: "Hepatology",

  // Lungs
  respiratory: "Pulmonology",

  // Blood
  hematological: "Hematology",
  lymphatic: "Hematology",

  // Immune
  immunological: "Immunology",

  // Infection
  infectious: "Infectious Diseases",

  // Endocrine / Metabolic
  endocrine: "Endocrinology",
  endocrine_metabolic: "Endocrinology",
  metabolic: "Endocrinology",

  // Psychiatry
  psychiatric: "Psychiatry",
  mental_behavioral: "Psychiatry",
  psychotic_disorder: "Psychiatry",
  mood_disorder: "Psychiatry",
  substance_related: "Psychiatry",
  substance_related_disorder: "Psychiatry",

  // Fallback
  other: "General Medicine",
};

const normalizeCategory = (raw) => {
  if (!raw) return "General Medicine";

  const k = String(raw)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_");

  return CATEGORY_MAP[k] || "General Medicine";
};

  const {
    emergency = false,
    emergencyReason = "",
    recommendation = "",
    results = [],
    collected = {},
    activeSyndromes = [],
  } = payload;
// Group diseases by category
const grouped = results.reduce((acc, d) => {
  const cleanCategory = normalizeCategory(d.category);

  if (!acc[cleanCategory]) acc[cleanCategory] = [];
  acc[cleanCategory].push(d);

  return acc;
}, {});


  const { selectedSymptoms = [], riskFactors = {}, answers = {} } = collected;

  // Humanize snake_case / underscore strings
  const humanize = (str) => {
    if (!str) return "";
    return str
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Format arrays into comma-separated lists
  const formatList = (arr) => {
    if (!arr || arr.length === 0) return "None reported";
    return arr.map(humanize).join(", ");
  };

  // Visual confidence class only
  const getConfidenceClass = (score) => {
    if (score >= 0.80) return "high";
    if (score >= 0.50) return "medium";
    if (score >= 0.30) return "low";
    return "very-low";
  };

  // Dynamically extract meaningful positive answers
  const positiveTriggers = Object.entries(answers)
    .map(([qid, answer]) => {
      const normalized = String(answer).trim().toLowerCase();

      // Yes/No questions
      if (normalized === "yes") {
        const cleanId = qid.replace(/^q_/, "");
        // Special readable phrasing for known critical questions
        const specialMap = {
          onset_timing: "Rapid onset of symptoms",
          food_exposure: "Symptoms started after eating suspicious food",
          neurological_symptoms: "Presence of neurological symptoms",
          descending_paralysis: "Descending pattern of weakness/paralysis",
          home_canned_food: "Consumption of home-canned or improperly stored food",
        };
        return specialMap[cleanId] || humanize(cleanId);
      }

      // MCQ positive values
      if (normalized === "within_hours" && qid === "q_onset_timing") {
        return "Symptoms began within a few hours";
      }

      return null;
    })
    .filter(Boolean);

  const symptomsText = formatList(selectedSymptoms);

  const risksText =
    Object.keys(riskFactors)
      .filter((key) => riskFactors[key] === "yes")
      .map(humanize)
      .join(", ") || "None reported";

  return (
    <div className="results-page">
      <h2>Assessment Results</h2>

      {/* Emergency Alert */}
      {emergency && emergencyReason && (
        <div className="alert-danger large">
          <div className="emergency-icon">🚨 Emergency</div>
          <strong>{emergencyReason}</strong>
          <p className="emergency-advice">
            Please seek immediate medical attention or contact emergency services right away.
          </p>
        </div>
      )}

      {/* Introduction */}
      <p className="muted">
        The predictive system has analyzed your symptoms and responses. 
        Below are the conditions that matched your input patterns.
        <strong> This is not a medical diagnosis — always consult a healthcare professional.</strong>
      </p>

      {/* Matched Conditions */}
      {results.length > 0 ? (
        <>
         <h3>Possible Condition Groups</h3>

{Object.entries(grouped).map(([category, diseases]) => (
  <div key={category} className="category-block">
    <div className="category-header">
      <h3>🩺 {humanize(category)}</h3>

      <button
        className="btn-secondary"
      onClick={() => {
  setOpenMapFor(openMapFor === category ? null : category);
}}

      >
        📍 Find Nearby {humanize(category)} Doctors
      </button>
    </div>

    <div className="results-grid">
      {diseases.map((d) => (
        <div
          key={d.icd || d.name}
          className={`diagnosis-card ${getConfidenceClass(d.score || 0)} neutral`}
        >
          <h4>{humanize(d.name)}</h4>
          <p className="confidence">
            Match Strength: {Math.round((d.score || 0) * 100)}%
          </p>
        </div>
      ))}
    </div>
    {openMapFor === category && (
  <div style={{ marginTop: 12 }}>
<NearbyClinics specialty={category} assessmentId={payload?._id} />
  </div>
)}

  </div>
))}

        </>
      ) : (
        <div className="diagnosis-card neutral">
          <h3>No Specific Conditions Matched</h3>
          <p>Your responses did not strongly align with any tracked medical patterns.</p>
        </div>
      )}

      {/* Basis for Assessment */}
      <div className="reasoning-section">
        <h3>Basis for This Assessment</h3>
        <ul>
          {positiveTriggers.length > 0 && (
            <li>
              <strong>Key positive responses:</strong> {positiveTriggers.join("; ")}.
            </li>
          )}
          {selectedSymptoms.length > 0 && (
            <li>
              <strong>Symptoms considered:</strong> {symptomsText}.
            </li>
          )}
          {Object.keys(riskFactors).some((k) => riskFactors[k] === "yes") && (
            <li>
              <strong>Risk factors noted:</strong> {risksText}.
            </li>
          )}
          {positiveTriggers.length === 0 &&
           selectedSymptoms.length === 0 &&
           !Object.keys(riskFactors).some((k) => riskFactors[k] === "yes") && (
            <li>No strong positive indicators were identified from your answers.</li>
          )}
          {emergency && (
            <li className="red-flag-note">
              ⚠️ A critical safety rule (red flag) was triggered, leading to an emergency alert.
            </li>
          )}
        </ul>
      </div>

      {/* Recommendation */}
      {recommendation && (
        <div className="recommendation large">
          <strong>Next Steps:</strong> {recommendation}
        </div>
      )}

      {/* Active Pathways */}
      {activeSyndromes.length > 0 && (
        <div className="pathway-info">
          <strong>Assessment pathway used:</strong> {activeSyndromes.map(humanize).join(", ")}
        </div>
      )}

      {/* Debug */}
      <details className="debug-section">
        <summary>👨‍💻 View full assessment data (for developers)</summary>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
      </details>

      <button className="primary large" onClick={restart}>
        Start New Assessment
      </button>
    </div>
  );
}