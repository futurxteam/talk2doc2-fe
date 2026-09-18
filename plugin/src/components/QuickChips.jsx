import React from 'react';

export default function QuickChips({ options, onSelect, disabled }) {
  if (!options || options.length === 0) return null;

  return (
    <div className="quick-chips-container">
      {options.map((opt) => (
        <button
          key={opt.id || opt}
          className="quick-chip-btn"
          disabled={disabled}
          onClick={() => onSelect(opt.id ? opt : { id: opt, label: opt })}
        >
          {opt.icon && <span className="chip-icon">{opt.icon}</span>}
          <span>{opt.label || opt}</span>
        </button>
      ))}
    </div>
  );
}
