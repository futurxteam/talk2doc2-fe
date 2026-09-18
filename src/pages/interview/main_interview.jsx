import React, { useEffect, useState } from "react";
import { getPrimaryRegions, getSubParts, getSymptomsForPart } from "../api";
import BodyMap from "../../components/BodyMap";

/* SVG → Backend Region mapping */
const SVG_TO_REGION_NAME = {
  head_and_neck: "Head & Neck",
  chest: "Chest",
  abdomen: "Upper Abdomen",
  lower_abdomen: "Lower Abdomen / Pelvis",
  left_arm: "Upper Limb",
  right_arm: "Upper Limb",
  left_leg: "Lower Limb",
  right_leg: "Lower Limb",
};


export default function MainInterview({
  selectedBodyParts = [],
  setSelectedBodyParts,
  selectedSymptoms = [],
  setSelectedSymptoms,
  next,
  back,
}) {
  const [regions, setRegions] = useState([]);
  const [region, setRegion] = useState("");
  const [subParts, setSubParts] = useState([]);
  const [subPart, setSubPart] = useState("");
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    getPrimaryRegions().then(setRegions);
  }, []);

  useEffect(() => {
    if (region) getSubParts(region).then(setSubParts);
  }, [region]);


  useEffect(() => {
  setSubPart("");
  setSymptoms([]);
}, [region]);
const [popupRegionName, setPopupRegionName] = useState("");

const [popupOpen, setPopupOpen] = useState(false);
const [popupSubParts, setPopupSubParts] = useState([]);
const [popupRegion, setPopupRegion] = useState(null); // region object from DB
const [popupSelectedParts, setPopupSelectedParts] = useState([]);
const handleBodyMapSelect = async (svgPartId) => {
  const regionName = SVG_TO_REGION_NAME[svgPartId];
  if (!regionName) return;

  const parts = await getSubParts(regionName);

  setPopupRegionName(regionName);   // ✅ store separately
  setPopupSubParts(parts);
  setPopupSelectedParts([]);
  setPopupOpen(true);
};



function getSymptomsFromSelection(region, selectedSubParts) {
  const all = [];

  selectedSubParts.forEach(p => {
    const s = region.part[p];
    if (!s) return;
    all.push(...s.split(",").map(x => x.trim()));
  });

  return [...new Set(all)]; // unique
}

return (
  <div className="step-content">

    {/* ================== TOP 2-COLUMN LAYOUT ================== */}
    <div className="body-select-layout">

      {/* ===== LEFT: BODY MAP ===== */}
      <div className="bodymap-panel">
        <BodyMap onSelect={handleBodyMapSelect} />
      </div>

      {/* ===== RIGHT: SELECTORS ===== */}
      <div className="selector-panel">

        <h3>Select affected area</h3>

        {/* ===== REGION SELECT ===== */}
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="">Select region</option>
          {regions.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>

        {/* ===== SUB PART SELECT ===== */}
        {subParts.length > 0 && (
          <select
            value={subPart}
            onChange={async (e) => {
              const part = e.target.value;
              setSubPart(part);
              if (!part || !region) return;

              const res = await getSymptomsForPart(region, part);
              setSymptoms(res?.symptoms || []);
              setSelectedBodyParts(prev => [...new Set([...prev, part])]);
            }}
          >
            <option value="">Select part</option>
            {subParts.map((p) => (
              <option key={p.name} value={p.name}>
                {p.label}
              </option>
            ))}
          </select>
        )}

        <div className="info-row muted">
          Or click directly on the body diagram to choose multiple areas.
        </div>

      </div>
    </div>

    {/* ================== POPUP (UNCHANGED) ================== */}
    {popupOpen && (
      <SubPartPopup
        region={popupRegionName}
        parts={popupSubParts}
        selected={popupSelectedParts}
        setSelected={setPopupSelectedParts}
        onClose={() => setPopupOpen(false)}
        onConfirm={async () => {

          // Save selected parts
          setSelectedBodyParts(prev => [
            ...new Set([...prev, ...popupSelectedParts])
          ]);

          // Fetch symptoms
          let allSymptoms = [];

          for (const sub of popupSelectedParts) {
            const res = await getSymptomsForPart(popupRegionName, sub);
            if (res?.symptoms) {
              allSymptoms.push(...res.symptoms);
            }
          }

          // Deduplicate
          const unique = Array.from(
            new Map(allSymptoms.map(s => [s.value, s])).values()
          );

          setSymptoms(unique);
          setPopupOpen(false);
        }}
      />
    )}

    {/* ================== SYMPTOMS PICKER ================== */}
    {symptoms.length > 0 && (
      <div className="chief-complaint-box">
        <h4>Select your problems</h4>

        <div className="symptom-grid">
          {symptoms.map((s) => {
            const active = selectedSymptoms.includes(s.label);

            return (
              <div
                key={s.value}
                className={"symptom " + (active ? "selected" : "")}
                onClick={() => {
                  setSelectedSymptoms(prev =>
                    prev.includes(s.label)
                      ? prev.filter(x => x !== s.label)
                      : [...prev, s.label]
                  );
                }}
              >
                {s.label}
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* ================== SELECTED SUMMARY BOX ================== */}
    {selectedSymptoms.length > 0 && (
      <div className="selected-summary-box">
        <h4>Selected complaints</h4>

        <div className="selected-tags">
          {selectedSymptoms.map((s) => (
            <span key={s} className="tag">
              {s}
              <button
                onClick={() =>
                  setSelectedSymptoms(prev => prev.filter(x => x !== s))
                }
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    )}

    {/* ================== NAV ================== */}
    <div className="nav-buttons">
      <button onClick={back}>Back</button>
      <button
        onClick={next}
        className="primary"
        disabled={selectedSymptoms.length === 0}
      >
        Continue
      </button>
    </div>

  </div>
);

}
function SubPartPopup({ region, parts, selected, setSelected, onClose, onConfirm }) {
  return (
<div className="popup-overlay">
  <div className="popup-box">
    <h3>{region}</h3>
    <p>Select affected areas:</p>

    {/* 👇 SCROLL CONTAINER */}
    <div className="popup-list">
      {parts.map((p) => (
        <label key={p.name} className="checkbox-row">
          <input
            type="checkbox"
            checked={selected.includes(p.name)}
            onChange={() =>
              setSelected(prev =>
                prev.includes(p.name)
                  ? prev.filter(x => x !== p.name)
                  : [...prev, p.name]
              )
            }
          />
          {p.label}
        </label>
      ))}
    </div>

    {/* 👇 ALWAYS VISIBLE */}
    <div className="popup-actions">
      <button onClick={onClose}>Cancel</button>
      <button className="primary" onClick={onConfirm}>Confirm</button>
    </div>
  </div>
</div>

  );
}
