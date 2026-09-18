import React from "react";

export default function Intro({ lang, T, accepted, setAccepted, next }) {
  return (
    <div className="step-content center">
      <h2>{lang === "ml" ? "ഭാഷ തിരഞ്ഞെടുക്കുക" : "Select Language"}</h2>

      <div className="lang-buttons">
        <button
          onClick={() => next("en")}
          className={lang === "en" ? "selected" : ""}
        >
          English
        </button>

        <button
          onClick={() => next("ml")}
          className={lang === "ml" ? "selected" : ""}
        >
          മലയാളം
        </button>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        {T.acceptTerms[lang]}
      </label>

      <button
        disabled={!accepted}
        onClick={() => next()}
        className="primary"
      >
        {T.continue[lang]}
      </button>
    </div>
  );
}
