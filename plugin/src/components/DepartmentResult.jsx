import React from 'react';
import { Stethoscope, AlertTriangle, RotateCcw, CheckCircle2, Clock, Activity, ShieldAlert } from 'lucide-react';

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
    symptomName,
    duration,
    severity
  } = recommendation;

  const renderUrgencyBadge = () => {
    if (!urgency) return null;
    if (urgency === 'EMERGENCY') {
      return (
        <div className="urgency-badge emergency">
          <ShieldAlert size={14} />
          <span>Emergency — Immediate Care Required</span>
        </div>
      );
    }
    if (urgency === 'PRIORITY') {
      return (
        <div className="urgency-badge priority">
          <AlertTriangle size={14} />
          <span>Priority — Specialist Recommended</span>
        </div>
      );
    }
    return (
      <div className="urgency-badge routine">
        <CheckCircle2 size={14} />
        <span>Routine Consultation</span>
      </div>
    );
  };

  return (
    <div className={`department-result-card ${isEmergency ? 'emergency-card' : ''}`}>
      {isEmergency && (
        <div className="emergency-alert-banner">
          <ShieldAlert size={22} className="alert-icon" />
          <div>
            <strong>URGENT MEDICAL NOTICE</strong>
            <p>{emergencyNotice}</p>
          </div>
        </div>
      )}

      <div className="result-header">
        {renderUrgencyBadge()}
        <div className="specialty-badge">
          <Stethoscope size={18} />
          <span>Recommended Specialty</span>
        </div>
        <h2 className="department-title">{department}</h2>
        {altDepartment && (
          <span className="alt-department">Alternative / Secondary: {altDepartment}</span>
        )}
      </div>

      <div className="result-summary-grid">
        <div className="summary-item">
          <span className="summary-label">Reported Area:</span>
          <span className="summary-val">{bodyAreaName}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Primary Symptom:</span>
          <span className="summary-val">{symptomName}</span>
        </div>
        {duration && (
          <div className="summary-item">
            <span className="summary-label"><Clock size={12} style={{ display: 'inline', marginRight: 4 }} />Duration:</span>
            <span className="summary-val">{duration}</span>
          </div>
        )}
        {severity && (
          <div className="summary-item">
            <span className="summary-label"><Activity size={12} style={{ display: 'inline', marginRight: 4 }} />Severity:</span>
            <span className={`summary-val severity-tag ${severity}`}>
              {severity.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="result-section">
        <div className="section-title">
          <CheckCircle2 size={16} color="#0284c7" />
          <span>Why this department?</span>
        </div>
        <p className="section-text">{reason}</p>
      </div>

      <div className="result-section">
        <div className="section-title">
          <AlertTriangle size={16} color="#f59e0b" />
          <span>Clinical Guidance & Next Steps</span>
        </div>
        <p className="section-text">{advice}</p>
      </div>

      <div className="disclaimer-note">
        Note: talk2doc provides specialty navigation, not clinical diagnosis. In case of life-threatening emergencies, seek immediate emergency medical care.
      </div>

      <button className="reset-btn" onClick={onReset}>
        <RotateCcw size={16} />
        <span>Start New Consultation Check</span>
      </button>
    </div>
  );
}
