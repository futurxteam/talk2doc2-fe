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

const LABELS = {
  english: {
    routine: 'Routine Consultation',
    priority: 'Priority — Specialist Recommended',
    emergency: 'Emergency — Immediate Care Required',
    recommendedSpecialty: 'Recommended Specialty',
    alternative: 'Alternative:',
    symptomLocation: 'Symptom Location:',
    primarySymptom: 'Primary Symptom:',
    duration: 'Duration:',
    severity: 'Severity:',
    whyChosen: 'Why this department was chosen',
    primaryIndication: 'Primary Indication',
    specialistScope: 'Specialist Scope',
    clinicalContext: 'Context',
    guidanceTitle: 'Guidance & Next Steps',
    viewDoctors: 'View Matching Doctors Below',
    startOver: 'Start Over',
    criticalAlert: 'CRITICAL MEDICAL ALERT',
    disclaimer: 'Note: talk2doc provides specialty navigation and triage, not formal medical diagnosis. In case of severe emergency, contact local emergency services immediately.'
  },
  manglish: {
    routine: 'Routine Consultation (Sadharana)',
    priority: 'Priority — Specialist Doctor-e Kaanuka',
    emergency: 'Emergency — Udane Chikitsa Theduka',
    recommendedSpecialty: 'Nirdheshikkunna Specialty Doctor',
    alternative: 'Matte Specialty:',
    symptomLocation: 'Budhimuttulla Bhaagam:',
    primarySymptom: 'Pradhaana Lakshanam:',
    duration: 'Ethra Kaalamaayi:',
    severity: 'Theevratha:',
    whyChosen: 'Endhukondaanu ee specialty nirdheshichathu',
    primaryIndication: 'Pradhaana Kaaranam',
    specialistScope: 'Specialist Paridhi',
    clinicalContext: 'Rogavivaram',
    guidanceTitle: 'Doctor Nirdheshangalum Adutha Padiyum',
    viewDoctors: 'Matching Doctors-e Thaazhe Kaanuka',
    startOver: 'Veendum Thudanguka',
    criticalAlert: 'CRITICAL MEDICAL ALERT',
    disclaimer: 'Note: talk2doc specialty navigation mathramaanu nalkunnathu, formal medical diagnosis alla. Emergency aayathil udane emergency hospital-il poyikoluka.'
  },
  malayalam_script: {
    routine: 'സാധാരണ പരിശോധന (Routine)',
    priority: 'മുൻഗണനയുള്ള പരിശോധന (Priority)',
    emergency: 'അത്യാഹിതം — ഉടൻ ചികിത്സ തേടുക',
    recommendedSpecialty: 'ശുപാർശ ചെയ്യുന്ന വിഭാഗം',
    alternative: 'മറ്റ് വിഭാഗം:',
    symptomLocation: 'ബാധിച്ച ഭാഗം:',
    primarySymptom: 'പ്രധാന ലക്ഷണം:',
    duration: 'എത്ര നാളായി:',
    severity: 'തീവ്രത:',
    whyChosen: 'എന്തുകൊണ്ട് ഈ വിഭാഗം ശുപാർശ ചെയ്തു',
    primaryIndication: 'പ്രാഥമിക കാരണം',
    specialistScope: 'സ്പെഷ്യലിസ്റ്റിന്റെ പരിധി',
    clinicalContext: 'രോഗവിവരം',
    guidanceTitle: 'ചികിത്സാ നിർദ്ദേശങ്ങളും തുടർനടപടികളും',
    viewDoctors: 'ലഭ്യമായ ഡോക്ടർമാരെ താഴെ കാണുക',
    startOver: 'വീണ്ടും തുടങ്ങുക',
    criticalAlert: 'അടിയന്തര മുന്നറിയിപ്പ്',
    disclaimer: 'കുറിപ്പ്: Talk2Doc സ്പെഷ്യലിസ്റ്റ് ഗൈഡൻസ് മാത്രമാണ് നൽകുന്നത്, ഔദ്യോഗിക രോഗനിർണയമല്ല. അടിയന്തര സാഹചര്യങ്ങളിൽ ഉടൻ തന്നെ അടുത്തുള്ള ആശുപത്രിയിൽ ചികിത്സ തേടുക.'
  }
};

export default function DepartmentResult({ recommendation, onReset, lang = 'english' }) {
  if (!recommendation) return null;

  const t = LABELS[lang] || LABELS.english;

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
          <span>{t.emergency}</span>
        </div>
      );
    }
    if (urgency === 'PRIORITY') {
      return (
        <div className="urgency-badge priority">
          <LuTriangleAlert size={15} />
          <span>{t.priority}</span>
        </div>
      );
    }
    return (
      <div className="urgency-badge routine">
        <LuCircleCheck size={15} />
        <span>{t.routine}</span>
      </div>
    );
  };

  return (
    <div className={`department-result-card ${isEmergency ? 'emergency-card' : ''}`}>
      {isEmergency && (
        <div className="emergency-alert-banner">
          <LuShieldAlert size={24} className="alert-icon" />
          <div className="emergency-text">
            <strong>{t.criticalAlert}</strong>
            <p>{emergencyNotice}</p>
          </div>
        </div>
      )}

      <div className="result-header">
        <div className="result-header-top">
          {renderUrgencyBadge()}
          <div className="specialty-badge">
            <LuStethoscope size={15} />
            <span>{t.recommendedSpecialty}</span>
          </div>
        </div>

        <h2 className="department-title">{department}</h2>
        {altDepartment && (
          <div className="alt-department-pill">
            <span>{t.alternative}</span> <strong>{altDepartment}</strong>
          </div>
        )}
      </div>

      <div className="result-summary-grid">
        <div className="summary-item">
          <span className="summary-label">{t.symptomLocation}</span>
          <span className="summary-val">{displayArea}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">{t.primarySymptom}</span>
          <span className="summary-val">{symptomName}</span>
        </div>
        {duration && (
          <div className="summary-item">
            <span className="summary-label"><LuClock size={12} className="inline-icon" />{t.duration}</span>
            <span className="summary-val">{duration}</span>
          </div>
        )}
        {severity && (
          <div className="summary-item">
            <span className="summary-label"><LuActivity size={12} className="inline-icon" />{t.severity}</span>
            <span className={`summary-val severity-tag ${severity}`}>
              {severity.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="result-section why-section">
        <div className="section-title">
          <LuCircleCheck size={18} className="title-icon icon-blue" />
          <span>{t.whyChosen}</span>
        </div>

        <div className="why-clinical-grid">
          <div className="why-item">
            <span className="why-item-badge">{t.primaryIndication}</span>
            <p><strong>{symptomName}</strong> localized in the <strong>{displayArea}</strong> region directly indicates evaluation by <strong>{department}</strong> specialists.</p>
          </div>

          <div className="why-item">
            <span className="why-item-badge">{t.specialistScope}</span>
            <p>{reason}</p>
          </div>

          {(duration || severity) && (
            <div className="why-item">
              <span className="why-item-badge">{t.clinicalContext}</span>
              <p>
                {duration ? `Reported progression: ${duration}. ` : ''}
                {severity ? `Assessed as ${severity.toUpperCase()} intensity, matching ${urgency === 'EMERGENCY' ? 'urgent emergency intervention' : urgency === 'PRIORITY' ? 'prompt specialist consultation' : 'routine examination'}.` : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="result-section advice-section">
        <div className="section-title">
          <LuTriangleAlert size={16} className="title-icon icon-amber" />
          <span>{t.guidanceTitle}</span>
        </div>
        <p className="section-text">{advice}</p>
      </div>

      {/* Action Buttons Row */}
      <div className="result-actions-row">
        <button className="view-specialists-btn" onClick={handleScrollToDoctors}>
          <LuCalendar size={16} />
          <span>{t.viewDoctors}</span>
          <LuArrowDown size={14} />
        </button>

        <button className="reset-btn" onClick={onReset}>
          <LuRotateCcw size={15} />
          <span>{t.startOver}</span>
        </button>
      </div>

      <div className="disclaimer-note">
        {t.disclaimer}
      </div>
    </div>
  );
}
