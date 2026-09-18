import React from "react";

export default function Details({
  lang,
  T,
  details,
  setDetails,
  next,
  back,
}) {
  return (
    <div className="step-content">
      <h3>{T.personalDetails[lang]}</h3>

      <input
        type="text"
        placeholder={T.name[lang]}
        value={details.name}
        onChange={(e) =>
          setDetails({ ...details, name: e.target.value })
        }
      />

      <input
        type="number"
        placeholder={T.age[lang]}
        value={details.age}
        onChange={(e) =>
          setDetails({ ...details, age: e.target.value })
        }
      />

      <select
        value={details.sex}
        onChange={(e) =>
          setDetails({ ...details, sex: e.target.value })
        }
      >
        <option value="">Select sex</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <div className="nav-buttons">
        <button onClick={back}>{T.back[lang]}</button>

        <button
          className="primary"
          onClick={() => {
            if (!details.name.trim())
              return alert("Please enter your name");
            if (!details.age || details.age < 1 || details.age > 120)
              return alert("Enter valid age");
            if (!details.sex)
              return alert("Please select sex");

            next();
          }}
        >
          {T.next[lang]}
        </button>
      </div>
    </div>
  );
}
