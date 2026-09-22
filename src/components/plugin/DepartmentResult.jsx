import React from 'react';
import { 
  LuStethoscope, 
  LuTriangleAlert, 
  LuRotateCcw, 
  LuCircleCheck, 
  LuClock, 
  LuActivity, 
  LuShieldAlert,
  LuArrowDown,
  LuCalendar
} from 'react-icons/lu';

export default function DepartmentResult({ recommendation, onReset }) {
  if (!recommendation) return null;

  const {
    department,
    altDepartment,
    reason,
    advice,
    isEmergency,
    emergencyNotice,
    urgency,
    bodyAreaName,
    symptomArea,
    symptomName,
    duration,
    severity
  } = recommendation;

  // Prefer the specific symptom location over the broad body area category
  const displayArea = symptomArea || bodyAreaName;

  const handleScrollToDoctors = () => {
    const el = document.querySelector('.doctors-triage-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderUrgencyBadge = () => {
    if (!urgency) return null;
    if (urgency === 'EMERGENCY') {
      return (
        <div className="urgency-badge emergency">
          <LuShieldAlert size={15} />
          <span>Emergency — Immediate Care Required</span>
        </div>
      );
    }
    if (urgency === 'PRIORITY') {
      return (
        <div className="urgency-badge priority">
          <LuTriangleAlert size={15} />
          <span>Priority — Specialist Recommended</span>
        </div>
      );
    }
    return (
      <div className="urgency-badge routine">
        <LuCircleCheck size={15} />
        <span>Routine Consultation</span>
      </div>
    );
  };

  return (
    <div className={`department-result-card ${isEmergency ? 'emergency-card' : ''}`}>
      {isEmergency && (
        <div className="emergency-alert-banner">
          <LuShieldAlert size={24} className="alert-icon" />
          <div className="emergency-text">
            <strong>CRITICAL MEDICAL ALERT</strong>
            <p>{emergencyNotice}</p>
          </div>
        </div>
      )}

      <div className="result-header">
        <div className="result-header-top">
          {renderUrgencyBadge()}
          <div className="specialty-badge">
            <LuStethoscope size={15} />
            <span>Recommended Specialty</span>
          </div>
        </div>

        <h2 className="department-title">{department}</h2>
        {altDepartment && (
          <div className="alt-department-pill">
            <span>Alternative:</span> <strong>{altDepartment}</strong>
          </div>
        )}
      </div>

      <div className="result-summary-grid">
        <div className="summary-item">
          <span className="summary-label">Symptom Location:</span>
          <span className="summary-val">{displayArea}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Primary Symptom:</span>
          <span className="summary-val">{symptomName}</span>
        </div>
        {duration && (
          <div className="summary-item">
            <span className="summary-label"><LuClock size={12} className="inline-icon" />Duration:</span>
            <span className="summary-val">{duration}</span>
          </div>
        )}
        {severity && (
          <div className="summary-item">
            <span className="summary-label"><LuActivity size={12} className="inline-icon" />Severity:</span>
            <span className={`summary-val severity-tag ${severity}`}>
              {severity.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="result-section why-section">
        <div className="section-title">
          <LuCircleCheck size={18} className="title-icon icon-blue" />
          <span>Why this department was chosen</span>
        </div>
        
        <div className="why-clinical-grid">
          <div className="why-item">
            <span className="why-item-badge">Primary Indication</span>
            <p><strong>{symptomName}</strong> localized in the <strong>{displayArea}</strong> region directly indicates clinical evaluation by <strong>{department}</strong> specialists.</p>
          </div>

          <div className="why-item">
            <span className="why-item-badge">Specialist Scope</span>
            <p>{reason}</p>
          </div>

          {(duration || severity) && (
            <div className="why-item">
              <span className="why-item-badge">Clinical Context</span>
              <p>
                {duration ? `Reported progression: ${duration}. ` : ''}
                {severity ? `Assessed as ${severity.toUpperCase()} intensity, matching ${urgency === 'EMERGENCY' ? 'urgent emergency intervention' : urgency === 'PRIORITY' ? 'prompt specialist consultation' : 'routine clinical examination'}.` : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="result-section advice-section">
        <div className="section-title">
          <LuTriangleAlert size={16} className="title-icon icon-amber" />
          <span>Clinical Guidance & Next Steps</span>
        </div>
        <p className="section-text">{advice}</p>
      </div>

      {/* Action Buttons Row */}
      <div className="result-actions-row">
        <button className="view-specialists-btn" onClick={handleScrollToDoctors}>
          <LuCalendar size={16} />
          <span>View Matching Doctors Below</span>
          <LuArrowDown size={14} />
        </button>

        <button className="reset-btn" onClick={onReset}>
          <LuRotateCcw size={15} />
          <span>Start Over</span>
        </button>
      </div>

      <div className="disclaimer-note">
        Note: talk2doc provides specialty navigation and clinical triage, not formal medical diagnosis. In case of severe emergency, contact local emergency services immediately.
      </div>
    </div>
  );
}
