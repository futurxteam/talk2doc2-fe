import React, { useState } from "react";

const HABITS = [
  { key: "smoking", label: "Smoking" },
  { key: "alcohol", label: "Alcohol" },
  { key: "diabetes", label: "Diabetes" },
  { key: "hypertension", label: "Hypertension" },
  { key: "heart_disease", label: "Heart disease" },
  { key: "close_contact_with_infected", label: "Close contact with infected" },
  { key: "crowded_living_conditions", label: "Crowded living conditions" },
  { key: "lack_of_vaccination", label: "Lack of vaccination" },
  { key: "unsafe_water", label: "Unsafe water" },
];

export default function Habits({ lang, T, back, next }) {
  const [habits, setHabits] = useState(() =>
    Object.fromEntries(HABITS.map(h => [h.key, false]))
  );

  const toggleHabit = (key) => {
    setHabits((h) => ({ ...h, [key]: !h[key] }));
  };

  const handleNext = () => {
    const selectedHabits = Object.keys(habits).filter(k => habits[k]);
    next(selectedHabits);
  };

  return (
    <div className="step-content">
      <h2>{T?.habits?.[lang] || "Habits / Pre-existing conditions / Exposure"}</h2>

      {/* ===== Habits List ===== */}
      <div className="habits-list">
        {HABITS.map((h) => (
          <label
            key={h.key}
            className={`habit-item ${habits[h.key] ? "checked" : ""}`}
          >
            <input
              type="checkbox"
              checked={habits[h.key]}
              onChange={() => toggleHabit(h.key)}
            />
            <span>{h.label}</span>
          </label>
        ))}
      </div>

      {/* ===== Navigation ===== */}
      <div className="nav-buttons">
        <button onClick={back}>
          {T?.back?.[lang] || "Back"}
        </button>

        <button className="primary" onClick={handleNext}>
          {T?.next?.[lang] || "Next"}
        </button>
      </div>
    </div>
  );
}
