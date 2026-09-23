import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../config';
import {
  LuSend as Send,
  LuBot as Bot,
  LuUser as User,
  LuRotateCcw,
  LuRotateCcw as RotateCcw,
  LuCheck,
  LuCheck as Check,
  LuArrowRight as ArrowRight,
  LuMic as Mic,
  LuMicOff as MicOff,
  LuVolume2 as Volume2,
  LuVolumeX as VolumeX,
  LuLoader as Loader2,
  LuSettings as Settings,
  LuX as X,
  LuMapPin,
  LuAward,
  LuCalendar,
  LuClock,
  LuFilter,
  LuShield,
  LuRefreshCw
} from 'react-icons/lu';
import QuickChips from './QuickChips';
import DepartmentResult from './DepartmentResult';
import BookAppointmentWidget from '../../pages/BookAppointment';
import { saveAssessmentResult } from '../../api/usersApi';
import { matchFreeTextQuery, matchDurationQuery, matchSeverityQuery, isNegativeResponse, extractFullTriageIntent, loadSynonymsFromApi, detectFrontendLanguage } from '../../utils/symptomSynonyms';

/* ========================================================
   In-Chat Doctor List & Selection Component
   ======================================================== */
function InChatDoctorList({
  doctors = [],
  selectedDoctor = null,
  onSelectDoctor,
  onChangeDoctor,
  radius = 10,
  onChangeRadius,
  insurance = 'all',
  onChangeInsurance,
  availableInsurances = [],
  loading = false,
  isFallback = false,
  fallbackMessage = null,
  showInlineBooking = false,
  onToggleBooking,
  assessmentId = null,
  onMoveToUI = null
}) {
  const RADIUS_OPTIONS = [5, 10, 15, 25, 50];

  return (
    <div className="chatbox-doctor-section">
      {/* Filter Controls Bar */}
      <div className="chatbox-filter-controls">
        <span className="chatbox-filter-label">
          <LuMapPin size={13} /> Distance:
        </span>
        <div className="chatbox-radius-chips">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              className={`chatbox-radius-chip ${radius === r ? 'active' : ''}`}
              onClick={() => onChangeRadius(r)}
            >
              {r} km
            </button>
          ))}
        </div>

        <div className="chatbox-insurance-selector">
          <span className="chatbox-filter-label">
            <LuShield size={13} /> Insurance:
          </span>
          <select
            className="chatbox-insurance-select"
            value={insurance}
            onChange={(e) => onChangeInsurance(e.target.value)}
          >
            <option value="all">All Insurances</option>
            {availableInsurances.map((ins, i) => (
              <option key={i} value={ins}>
                {ins}
              </option>
            ))}
          </select>
        </div>

        {onMoveToUI && (
          <button
            type="button"
            className="chatbox-show-ui-btn"
            onClick={onMoveToUI}
            title="Move doctor list to panel below the chat"
          >
            📌 Show in UI
          </button>
        )}
      </div>

      {/* Status Bar */}
      <div className="chatbox-status-summary">
        <span>
          {loading
            ? '🔄 Finding doctors near you...'
            : `${doctors.length} doctor${doctors.length === 1 ? '' : 's'} within ${radius} km`}
        </span>
        {insurance !== 'all' && (
          <span style={{ color: '#0284c7', fontWeight: 600 }}>
            🛡️ {insurance}
          </span>
        )}
      </div>

      {isFallback && fallbackMessage && (
        <div style={{ background: '#fffbeb', color: '#b45309', padding: '8px 12px', borderRadius: 8, fontSize: '0.76rem', border: '1px solid #fde68a' }}>
          ℹ️ {fallbackMessage}
        </div>
      )}

      {/* Current Selected Doctor Card */}
      {selectedDoctor ? (
        <div className="chatbox-selected-doctor-card" id="chatbox-selected-doctor-card">
          <div className="chatbox-selected-header">
            <div className="chatbox-selected-badge">
              <LuCheck size={16} /> Current Selected Doctor
            </div>
            <button
              type="button"
              className="chatbox-change-doc-btn"
              onClick={onChangeDoctor}
              title="Change to another doctor"
            >
              <LuRotateCcw size={13} /> Change Doctor
            </button>
          </div>

          <div className="chatbox-doctor-card-top">
            <div className="chatbox-doc-avatar">
              {selectedDoctor.fullName?.replace('Dr.', '').trim().slice(0, 2).toUpperCase() || 'DR'}
            </div>
            <div className="chatbox-doc-info">
              <div className="chatbox-doc-name-row">
                <h4 className="chatbox-doc-name">
                  {selectedDoctor.fullName.startsWith('Dr.') ? selectedDoctor.fullName : `Dr. ${selectedDoctor.fullName}`}
                </h4>
              </div>
              <div className="chatbox-doc-specialty">{selectedDoctor.specialization}</div>
              <div className="chatbox-doc-hospital">
                🏥 {selectedDoctor.hospitalName || 'Partner Hospital'}
              </div>
            </div>
          </div>

          <div className="chatbox-doc-badges">
            {selectedDoctor.distanceKm && (
              <span className="chatbox-badge distance">
                <LuMapPin size={11} /> {selectedDoctor.distanceKm} km away
              </span>
            )}
            {selectedDoctor.yearsOfExperience > 0 && (
              <span className="chatbox-badge experience">
                <LuAward size={11} /> {selectedDoctor.yearsOfExperience} yrs exp
              </span>
            )}
            {selectedDoctor.consultationFee > 0 && (
              <span className="chatbox-badge fee">
                ₹{selectedDoctor.consultationFee}
              </span>
            )}
            {Array.isArray(selectedDoctor.acceptedInsurances) && selectedDoctor.acceptedInsurances.slice(0, 2).map((ins, idx) => (
              <span key={idx} className="chatbox-badge insurance-tag">
                🛡️ {ins}
              </span>
            ))}
          </div>

          <div className="chatbox-selected-actions">
            <button
              type="button"
              className="chatbox-book-appointment-btn"
              onClick={onToggleBooking}
            >
              <LuCalendar size={16} />
              {showInlineBooking ? 'Close Booking' : '📅 Book Appointment Now'}
            </button>

            {showInlineBooking && (
              <div className="chatbox-inline-booking-box">
                <BookAppointmentWidget
                  doctorId={selectedDoctor._id}
                  assessmentId={assessmentId}
                  onBooked={() => {
                    alert('Appointment booked successfully!');
                    onToggleBooking();
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Doctor list */
        <div className="chatbox-doctor-list">
          {doctors.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.82rem' }}>
              No doctors found within {radius} km. Try increasing the radius to 25 km or 50 km, or selecting "All Insurances".
            </div>
          )}

          {doctors.map((doc, idx) => {
            const initials = doc.fullName
              ? doc.fullName.replace('Dr.', '').trim().slice(0, 2).toUpperCase()
              : 'DR';

            return (
              <div
                key={doc._id || idx}
                className="chatbox-doctor-card"
                onClick={() => onSelectDoctor(doc)}
              >
                <div className="chatbox-doctor-card-top">
                  <div className="chatbox-doc-avatar">{initials}</div>
                  <div className="chatbox-doc-info">
                    <div className="chatbox-doc-name-row">
                      <h4 className="chatbox-doc-name">
                        #{idx + 1} {doc.fullName.startsWith('Dr.') ? doc.fullName : `Dr. ${doc.fullName}`}
                      </h4>
                    </div>
                    <div className="chatbox-doc-specialty">{doc.specialization}</div>
                    <div className="chatbox-doc-hospital">
                      🏥 {doc.hospitalName || 'Partner Hospital'}
                    </div>
                  </div>
                </div>

                <div className="chatbox-doc-badges">
                  {doc.distanceKm && (
                    <span className="chatbox-badge distance">
                      <LuMapPin size={11} /> {doc.distanceKm} km away
                    </span>
                  )}
                  {doc.yearsOfExperience > 0 && (
                    <span className="chatbox-badge experience">
                      <LuAward size={11} /> {doc.yearsOfExperience} yrs exp
                    </span>
                  )}
                  {doc.consultationFee > 0 && (
                    <span className="chatbox-badge fee">
                      ₹{doc.consultationFee}
                    </span>
                  )}
                  {Array.isArray(doc.acceptedInsurances) && doc.acceptedInsurances.slice(0, 2).map((ins, i) => (
                    <span key={i} className="chatbox-badge insurance-tag">
                      🛡️ {ins}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="chatbox-select-doc-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDoctor(doc);
                  }}
                >
                  <LuCheck size={14} /> Select This Doctor
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ChatBox({
  selectedBodyPart,
  onBodyPartSelect,
  bodyPartsData,
  followUpQuestions,
  decisionTrees,
  followUpProfiles = {},
  onRecommendation,
  onShowDoctorsInUI
}) {
  const [messages, setMessages] = useState([]);
  // Steps: 'body_area' | 'symptom_transition' | 'symptom' | 'tree_node' | 'duration' | 'severity' | 'result'
  const [currentStep, setCurrentStep] = useState('body_area');
  const [interactionMode, setInteractionMode] = useState('manual');
  // 'manual' | 'voice'

  const [voiceStatus, setVoiceStatus] = useState('idle');
  // 'idle' | 'listening' | 'thinking' | 'speaking'

  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Voice Customization Settings
  const [selectedVoiceUri, setSelectedVoiceUri] = useState(() => {
    return localStorage.getItem('talk2doc_voice_uri') || 'auto_us_female';
  });
  const [voiceSpeed, setVoiceSpeed] = useState(() => {
    return parseFloat(localStorage.getItem('talk2doc_voice_speed') || '0.88');
  });
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  const voiceModeRef = useRef(false);
  const voiceTranscriptRef = useRef('');
  const voiceProcessingRef = useRef(false);
  // Tracks detected conversation language ('english' | 'manglish' | 'malayalam_script')
  const convLangRef = useRef('english');
  const [understoodData, setUnderstoodData] = useState({
    bodyArea: null,
    symptomName: null,
    duration: null,
    severity: null,
    extraSymptoms: []
  });
  const [triageData, setTriageData] = useState({
    bodyArea: null,
    symptomId: null,
    symptomName: null,
    duration: null,
    severity: null,
    // Decision tree state
    treeId: null,
    currentNodeId: null,
    currentNode: null,
    answersMap: {},     // { nodeId: answer(s) }
    pendingMultiSelect: [],  // accumulates multi-select answers before confirm
    // Clinical follow-up profile state
    profileId: null,
    profileQuestionIndex: 0,
    profileAnswers: {}
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // In-Chat Doctor Suggestion & Selection State
  const [inChatDoctors, setInChatDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorRadius, setDoctorRadius] = useState(10);
  const [doctorInsurance, setDoctorInsurance] = useState('all');
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [isFallbackDoctors, setIsFallbackDoctors] = useState(false);
  const [fallbackDoctorMessage, setFallbackDoctorMessage] = useState(null);
  const [showInlineBooking, setShowInlineBooking] = useState(false);
  const [availableInsurances, setAvailableInsurances] = useState([
    'Star Health',
    'Care Health',
    'HDFC ERGO',
    'ICICI Lombard',
    'Max Bupa / Niva Bupa',
    'United India Insurance',
    'Medicare'
  ]);
  const [savedAssessmentId, setSavedAssessmentId] = useState(null);
  const userCoordsRef = useRef(null);
  const [userCoords, setUserCoords] = useState(null);

  // Controls whether doctor list renders inside chat vs. page UI
  const [showDoctorsInChat, setShowDoctorsInChat] = useState(true);

  const inChatDoctorsRef = useRef([]);
  useEffect(() => {
    inChatDoctorsRef.current = inChatDoctors;
  }, [inChatDoctors]);

  const selectedDoctorRef = useRef(null);
  useEffect(() => {
    selectedDoctorRef.current = selectedDoctor;
  }, [selectedDoctor]);

  const doctorRadiusRef = useRef(10);
  useEffect(() => {
    doctorRadiusRef.current = doctorRadius;
  }, [doctorRadius]);

  const doctorInsuranceRef = useRef('all');
  useEffect(() => {
    doctorInsuranceRef.current = doctorInsurance;
  }, [doctorInsurance]);

  // Voice Input & Output State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showAvatars, setShowAvatars] = useState(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const restartTimerRef = useRef(null);
  const currentStepRef = useRef('body_area');
  const triageDataRef = useRef(triageData);
  const messagesRef = useRef(messages);

  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    triageDataRef.current = triageData;
  }, [triageData]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const hasSavedTriageRef = useRef(false);

  const persistTriageReport = async (rec, currentData) => {
    if (!rec) return;
    const token = localStorage.getItem("token");
    const symptomName = rec.primarySymptom || rec.symptomName || currentData?.symptomName || "Clinical Evaluation";
    const bodyArea = rec.bodyAreaName || rec.bodyArea || currentData?.bodyArea || "";
    const department = rec.department || "General Medicine";
    const altDepartment = rec.altDepartment || rec.alternativeDepartment || "Primary Care / Internal Medicine";
    const urgency = rec.urgencyLevel || rec.urgency || (rec.emergency ? "EMERGENCY" : "ROUTINE");

    const payload = {
      emergency: !!rec.emergency,
      emergencyReason: rec.emergencyNotice || rec.reason || "",
      recommendation: `${department} (${urgency})`,
      department,
      alternativeDepartment: altDepartment,
      urgencyLevel: urgency,
      primarySymptom: symptomName,
      bodyArea,
      duration: rec.duration || currentData?.duration || "",
      severity: rec.severity || currentData?.severity || "",
      results: [
        {
          name: symptomName,
          department,
          alternativeDepartment: altDepartment,
          urgency,
          score: rec.triageScore || 100,
          advice: rec.advice || rec.patientAdvice || ""
        }
      ],
      collected: {
        bodyArea,
        primarySymptom: symptomName,
        duration: rec.duration || currentData?.duration,
        severity: rec.severity || currentData?.severity,
        followUpAnswers: currentData?.followUpAnswers || currentData?.profileAnswers || {},
        clinicalSummary: rec.clinicalSummary || rec.reason,
        advice: rec.advice || rec.patientAdvice,
        matchedKeywords: rec.matchedKeywords || []
      },
      reportType: "TRIAGE_EVALUATION",
      reportData: rec,
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem("talk2doc_latest_triage_report", JSON.stringify(payload));
    } catch (e) {
      console.warn("Could not save report to localStorage", e);
    }

    if (token) {
      try {
        const saveRes = await saveAssessmentResult(payload);
        if (saveRes?.assessment?._id || saveRes?._id) {
          setSavedAssessmentId(saveRes.assessment?._id || saveRes._id);
        }
        console.log("✅ Triage report persisted to patient account");
      } catch (err) {
        console.error("Failed to save triage report to patient account:", err);
      }
    }
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/auth/insurance-providers`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.providers) && data.providers.length > 0) {
          setAvailableInsurances(data.providers.map(p => typeof p === 'string' ? p : p.name || p));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadSynonymsFromApi(API_BASE_URL);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoicesList = () => {
        const v = window.speechSynthesis.getVoices() || [];
        if (v.length > 0) {
          setAvailableVoices(v);
        }
      };
      updateVoicesList();
      window.speechSynthesis.onvoiceschanged = updateVoicesList;
    }
  }, []);

  const updateCurrentStep = (step) => {
    currentStepRef.current = step;
    setCurrentStep(step);
  };

  const updateTriageData = (updater) => {
    setTriageData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      triageDataRef.current = next;
      return next;
    });
  };

  const messagesEndRef = useRef(null);
  const messagesBoxRef = useRef(null);
  const selectingAreaRef = useRef(false);

  // Text-To-Speech (Voice Output) with neural voice selection and console logging
  const speakAgent = (text) => {
    return new Promise((resolve) => {
      if (
        typeof window === 'undefined' ||
        !window.speechSynthesis ||
        !text
      ) {
        resolve();
        return;
      }

      // Clear any pending restart timers
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }

      // Stop recognition while speaking so AI does not hear itself
      isRecognizingRef.current = false;
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch { }
      recognitionRef.current = null;

      window.speechSynthesis.cancel();

      // Clean spoken text: strip markdown bold/italics, parentheticals, links, and emojis
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/\(.*?[0-9a-zA-Z].*?\)/g, '')
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\u2011-\u26FF|\uD83E[\uDD10-\uDDFF])/g, '')
        .replace(/[*_#`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      // 🔠 Strip Manglish and Malayalam script — TTS only speaks English
      // Remove Malayalam Unicode characters (U+0D00–U+0D7F)
      const englishOnly = cleanText
        .replace(/[\u0D00-\u0D7F]+/g, '')  // Remove Malayalam script
        .replace(/\b(ayyoo?|ayyo|enikku?|eniku|vedana|vedanikkunnu|vedanayo|pallu|thala|thalavedana|vayaru|vayar|vayattil|kazhuthu|nenju|nenjil|chardi|pani|sheenam|ksheenam|tharippu|veekkam|chori|chorichil|moothram|innu|inn|innumuthal|innale|ravile|ippol|kurachu|kure|neram|neramayi|divasam|divasamayi|bayankara|bhayankara|cheriya|cheruthaano|cheruthano|nallath|nalla|und|undu|illa|vannu|poyi|aayi|kayyu|kaalu|potti|odivu|aano|alla|kooduthal|sahikkan|sahikkan pattatha|sahikkan pattunnu|muthal|koluthipidutham|koluthal|chora|kazhikkan|urakkam|maravippu|kashtam|kashtamayi|pedikkenda|pedikkanda|namukku|kaanam|kandam|manasilayi|seri|sari|evide|avide|enthu|ethra|eppozh|eppol|prashnam|parayamo|parayunnu|parayunn|budhimuttu|budhimuttanallo|budhimuttundalle|kashtamanallo|kashtapedukayanalle|thudangiyathu|thudangiyittu|thudangi|eppozhanu|inno|atho|divasamo|pattatha|kashtamanallo|vedanikkunnu|ayyoo|manasilaayi|kandupidikkam|venam|venda|engane|valare|arinjhu|seri|sheri|ellaam|aakum|evide|muthal|und ennu|ennu ketto|ennu arinjhu|sheri aakum)\\b/gi, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      // If nothing English remains after stripping (pure Manglish input), skip TTS
      if (!englishOnly || englishOnly.length < 3) {
        resolve();
        return;
      }

      // 📢 Console print of AI agent voice text for testing
      console.log(
        '%c[AI Agent Voice Output]%c ' + cleanText,
        'background: #0284c7; color: white; padding: 3px 10px; border-radius: 4px; font-weight: bold; font-size: 13px;',
        'color: #0f172a; font-weight: 600; font-size: 13px;'
      );

      setVoiceStatus('speaking');

      const utterance = new SpeechSynthesisUtterance(englishOnly);
      utterance.lang = 'en-US';
      utterance.rate = voiceSpeed || 0.88; // User selected or default 0.88 slow pace
      utterance.pitch = 1.0;

      // Select voice based on user preference or automatic American voice
      const _voices = availableVoices.length > 0 ? availableVoices : (window.speechSynthesis.getVoices() || []);
      const isUkVoice = v => /uk|british|gb\b|en[-_]gb/i.test((v.name || '') + ' ' + (v.lang || ''));
      const americanVoices = _voices.filter(v => !isUkVoice(v));

      let chosenVoice = null;

      // 1. Check if user selected a specific system voice
      if (
        selectedVoiceUri &&
        selectedVoiceUri !== 'auto_us_female' &&
        selectedVoiceUri !== 'auto_us_male' &&
        selectedVoiceUri !== 'auto_in_english'
      ) {
        chosenVoice = _voices.find(v => v.voiceURI === selectedVoiceUri || v.name === selectedVoiceUri);
      }

      // 2. Persona shortcuts
      if (!chosenVoice) {
        if (selectedVoiceUri === 'auto_us_male') {
          chosenVoice = americanVoices.find(v => /guy|david|mark|george|male/i.test(v.name) && /en[-_]us/i.test(v.lang))
            || americanVoices.find(v => /male/i.test(v.name))
            || americanVoices[0];
        } else if (selectedVoiceUri === 'auto_in_english') {
          chosenVoice = _voices.find(v => /en[-_]in/i.test(v.lang) || /india/i.test(v.name))
            || americanVoices[0];
        } else {
          // Default: auto_us_female (crisp, soothing American English)
          const _voicePref = [
            v => /natural|neural|online/i.test(v.name) && /en[-_]us/i.test(v.lang) && /jenny|aria|michelle|female/i.test(v.name),
            v => /natural|neural|online/i.test(v.name) && /en[-_]us/i.test(v.lang),
            v => /google/i.test(v.name) && (/us\b|united states/i.test(v.name) || /en[-_]us/i.test(v.lang)),
            v => /en[-_]us/i.test(v.lang) && /zira|samantha|eva|susan/i.test(v.name),
            v => /en[-_]us/i.test(v.lang),
            v => /google/i.test(v.name),
            v => /en/i.test(v.lang)
          ];
          for (const _test of _voicePref) {
            const _m = americanVoices.find(_test);
            if (_m) { chosenVoice = _m; break; }
          }
        }
      }

      if (!chosenVoice && _voices.length > 0) {
        chosenVoice = americanVoices[0] || _voices.find(v => /en[-_]us/i.test(v.lang)) || _voices[0];
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
      }

      console.log(
        '%c[TTS Voice Engine]%c ' + (utterance.voice ? utterance.voice.name + ' (' + utterance.voice.lang + ')' : 'Default Browser Voice') + ' @ ' + utterance.rate + 'x',
        'background: #10b981; color: white; padding: 2px 8px; border-radius: 3px; font-size: 11px;',
        'color: #059669; font-size: 11px;'
      );

      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          clearTimeout(safetyTimer);
          resolve();

          // After AI finishes speaking, update voice status to listening and restart recognition
          if (voiceModeRef.current && currentStepRef.current !== 'result') {
            setVoiceStatus('listening');
            if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
            restartTimerRef.current = setTimeout(() => {
              if (
                voiceModeRef.current &&
                currentStepRef.current !== 'result' &&
                !isRecognizingRef.current
              ) {
                startAgentListening();
              }
            }, 300);
          } else {
            setVoiceStatus('idle');
          }
        }
      };

      const maxWait = Math.min(cleanText.length * 90 + 2000, 8000);
      const safetyTimer = setTimeout(finish, maxWait);

      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
    });
  };

  const startAgentListening = () => {
    if (!voiceModeRef.current) return;
    if (currentStepRef.current === 'result') return;

    // Clear any pending restart timer
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    // Already actively listening — DO NOT START AGAIN (prevents glitch loop)
    if (isRecognizingRef.current) {
      return;
    }

    // If speech synthesis is actively speaking, wait for it to finish
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      restartTimerRef.current = setTimeout(() => startAgentListening(), 350);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Voice recognition is not supported in this browser.'
      );
      return;
    }

    if (voiceProcessingRef.current) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();

      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        isRecognizingRef.current = true;
        setVoiceStatus('listening');
        setIsListening(true);
        setVoiceTranscript('');
        voiceTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        transcript = transcript.trim();
        setVoiceTranscript(transcript);
        voiceTranscriptRef.current = transcript;
      };

      recognition.onerror = (event) => {
        // 'no-speech' is a harmless silence pause by the user — let onend handle clean restart
        if (event.error === 'no-speech') {
          return;
        }

        console.warn(
          '[Talk2Doc Voice] Speech recognition error:',
          event.error
        );

        isRecognizingRef.current = false;

        if (event.error === 'not-allowed') {
          setIsListening(false);
          setSpeechError('Microphone permission denied.');
          setVoiceStatus('idle');
        }
      };

      recognition.onend = () => {
        isRecognizingRef.current = false;
        setIsListening(false);

        const transcript = voiceTranscriptRef.current?.trim();

        if (
          transcript &&
          voiceModeRef.current &&
          !voiceProcessingRef.current
        ) {
          processVoiceInput(transcript);
        } else if (
          voiceModeRef.current &&
          currentStepRef.current !== 'result' &&
          !voiceProcessingRef.current &&
          !isRecognizingRef.current &&
          !(window.speechSynthesis && window.speechSynthesis.speaking)
        ) {
          // Restart after silence pause so microphone stays ready
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (
              voiceModeRef.current &&
              currentStepRef.current !== 'result' &&
              !voiceProcessingRef.current &&
              !isRecognizingRef.current &&
              !(window.speechSynthesis && window.speechSynthesis.speaking)
            ) {
              startAgentListening();
            }
          }, 300);
        }
      };

      recognitionRef.current = recognition;
      isRecognizingRef.current = true;
      recognition.start();

    } catch (error) {
      isRecognizingRef.current = false;
      setIsListening(false);
      console.warn('[Talk2Doc Voice] Start failed:', error);
      if (voiceModeRef.current && currentStepRef.current !== 'result') {
        if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
        restartTimerRef.current = setTimeout(() => startAgentListening(), 500);
      }
    }
  };

  const processVoiceInput = async (text) => {
    if (currentStepRef.current === 'result' || currentStep === 'result') {
      return;
    }
    if (!text?.trim()) {
      if (voiceModeRef.current && !isRecognizingRef.current) {
        startAgentListening();
      }
      return;
    }

    if (voiceProcessingRef.current) return;

    // Clear any restart timer
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    // Stop recognition during AI processing
    isRecognizingRef.current = false;
    try { recognitionRef.current?.abort(); } catch { }
    recognitionRef.current = null;

    voiceProcessingRef.current = true;
    setVoiceStatus('thinking');
    setIsAiProcessing(true);

    try {
      await processUserInput(text, {
        source: 'voice'
      });
    } finally {
      voiceProcessingRef.current = false;
      setIsAiProcessing(false);

      // If speech synthesis has already finished or didn't speak, resume listening immediately
      if (
        voiceModeRef.current &&
        currentStepRef.current !== 'result' &&
        !isRecognizingRef.current
      ) {
        if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
          setVoiceStatus('listening');
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (
              voiceModeRef.current &&
              currentStepRef.current !== 'result' &&
              !isRecognizingRef.current
            ) {
              startAgentListening();
            }
          }, 350);
        }
      }
    }
  };

  const switchToVoiceMode = async () => {
    if (interactionMode === 'voice') return;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    voiceModeRef.current = true;
    voiceProcessingRef.current = false;

    setInteractionMode('voice');
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';
    setSpeechError(null);

    // If diagnosis is already completed, DO NOT start over or speak greeting!
    if (currentStepRef.current === 'result' || recommendation) {
      setVoiceStatus('idle');
      return;
    }

    // If already in progress, keep existing messages and current step!
    if (messages.length > 1 || currentStep !== 'body_area') {
      setTimeout(() => {
        if (voiceModeRef.current && !isRecognizingRef.current) {
          startAgentListening();
        }
      }, 300);
      return;
    }

    // Brand new initial conversation
    const greeting =
      "Hey! Don't worry at all, I'm right here with you. Tell me what's going on or how you're feeling today — take your time, in any words you like.";

    const initialMsgs = [
      {
        id: Date.now(),
        sender: 'bot',
        text: greeting
      }
    ];

    messagesRef.current = initialMsgs;
    setMessages(initialMsgs);

    try {
      // speakAgent auto-starts listening when it finishes!
      await speakAgent(greeting);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      if (voiceModeRef.current && !isRecognizingRef.current) {
        startAgentListening();
      }
    }
  };

  const exitVoiceMode = () => {
    voiceModeRef.current = false;
    voiceProcessingRef.current = false;

    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    isRecognizingRef.current = false;

    try {
      recognitionRef.current?.abort();
    } catch { }
    recognitionRef.current = null;

    window.speechSynthesis?.cancel();

    setIsListening(false);
    setVoiceStatus('idle');
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';

    setInteractionMode('manual');
  };

  // Speech-To-Text (Voice Input)


  useEffect(() => {
    // Scroll within the chat container only — don't use scrollIntoView which scrolls the whole page
    const box = messagesBoxRef.current;
    if (box) {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (onRecommendation) {
      onRecommendation(recommendation);
    }
    if (recommendation && (currentStep === 'result' || currentStep === 'doctor_selection' || currentStep === 'doctor_selected') && !hasSavedTriageRef.current) {
      hasSavedTriageRef.current = true;
      persistTriageReport(recommendation, triageDataRef.current || triageData);
    }
  }, [recommendation, currentStep]);

  useEffect(() => {
    if (messages.length === 0) {
      initChat();
    }
  }, [bodyPartsData]);

  // Sync with SVG BodyMap selection safely without duplicate loop
  useEffect(() => {
    if (
      selectedBodyPart &&
      currentStep === 'body_area' &&
      !triageDataRef.current.symptomId &&
      selectedBodyPart !== triageData.bodyArea &&
      selectedBodyPart !== triageDataRef.current.bodyArea &&
      !selectingAreaRef.current
    ) {
      handleSelectBodyArea(selectedBodyPart, true, true);
    }
  }, [selectedBodyPart]);

  const initChat = () => {
    hasSavedTriageRef.current = false;
    voiceModeRef.current = false;
    voiceProcessingRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch { }

    window.speechSynthesis?.cancel();

    selectingAreaRef.current = false;
    setInteractionMode('manual');
    setVoiceStatus('idle');
    setIsListening(false);

    setVoiceTranscript('');
    voiceTranscriptRef.current = '';
    convLangRef.current = 'english';

    setUnderstoodData({
      bodyArea: null,
      symptomName: null,
      duration: null,
      severity: null,
      extraSymptoms: []
    });

    const initialGreeting =
      'Hello! I am talk2doc, your medical specialty advisor. Where are you experiencing discomfort? You can tap a body part on the interactive diagram or select from the options below.';

    const initialMsgs = [
      {
        id: 1,
        sender: 'bot',
        text: initialGreeting
      }
    ];

    messagesRef.current = initialMsgs;
    setMessages(initialMsgs);

    updateCurrentStep('body_area');

    const initialTriage = {
      bodyArea: null,
      symptomId: null,
      symptomName: null,
      duration: null,
      severity: null,
      treeId: null,
      currentNodeId: null,
      currentNode: null,
      answersMap: {},
      pendingMultiSelect: [],
      profileId: null,
      profileQuestionIndex: 0,
      profileAnswers: {}
    };

    updateTriageData(initialTriage);
    setRecommendation(null);
    setInChatDoctors([]);
    setSelectedDoctor(null);
    setDoctorRadius(10);
    setDoctorInsurance('all');
    setShowInlineBooking(false);
    setIsFallbackDoctors(false);
    setFallbackDoctorMessage(null);
    setSavedAssessmentId(null);
    setShowDoctorsInChat(true);
    if (onShowDoctorsInUI) onShowDoctorsInUI(false);
  };

  const addBotMessage = (text, extra = {}, options = {}) => {
    const { speakMessage = false } = options;

    console.log(
      '%c[AI Agent Voice / Reply]%c ' + text,
      'background: #0284c7; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 12px;',
      'color: #0f172a; font-weight: 600; font-size: 13px;'
    );

    const newMsg = {
      id: Date.now() + Math.random(),
      sender: 'bot',
      text,
      ...extra
    };

    messagesRef.current = [...messagesRef.current, newMsg];
    setMessages(prev => [...prev, newMsg]);

    // Only speak if speakMessage is explicitly true.
    // In voice mode, callers that use await speakAgent handle speech themselves, preventing double speech.
    if (speakMessage === true) {
      speakAgent(text);
    }
  };

  /* ========================================================
     In-Chat Doctor Fetch & State Management Helpers
     ======================================================== */
  const fetchInChatDoctors = async (dept, radiusKm = 10, insurance = 'all') => {
    const targetDept = dept || recommendation?.department || "General Medicine";
    setLoadingDoctors(true);
    setDoctorRadius(radiusKm);
    setDoctorInsurance(insurance);

    const queryNearby = async (lat, lng) => {
      try {
        const url = `${API_BASE_URL}/api/user/nearby?lat=${lat}&lng=${lng}&specialty=${encodeURIComponent(targetDept)}&radius=${radiusKm}&insurance=${encodeURIComponent(insurance)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.groups) {
          const list = Object.values(data.groups).flat();
          setInChatDoctors(list);
          setIsFallbackDoctors(Boolean(data.isFallback));
          setFallbackDoctorMessage(data.fallbackMessage || null);
          return list;
        }
      } catch (err) {
        console.warn('Nearby fetch failed:', err);
      }
      return null;
    };

    const fallbackTriageDocs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/triage/doctors?department=${encodeURIComponent(targetDept)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.doctors)) {
          const docs = data.doctors.map(d => ({
            ...d,
            distanceKm: d.distanceKm || 'Nearby',
            acceptedInsurances: d.acceptedInsurances || []
          }));
          const filtered = (insurance && insurance !== 'all')
            ? docs.filter(d => (d.acceptedInsurances || []).some(ins => ins.toLowerCase().includes(insurance.toLowerCase())))
            : docs;
          setInChatDoctors(filtered);
          setIsFallbackDoctors(Boolean(data.isFallback));
          setFallbackDoctorMessage(data.fallbackMessage || null);
          return filtered;
        }
      } catch (err) {
        console.error('Triage doctors fallback error:', err);
      }
      return [];
    };

    try {
      if (userCoordsRef.current) {
        const list = await queryNearby(userCoordsRef.current.lat, userCoordsRef.current.lng);
        if (!list || list.length === 0) {
          await fallbackTriageDocs();
        }
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            userCoordsRef.current = coords;
            setUserCoords(coords);
            const list = await queryNearby(coords.lat, coords.lng);
            if (!list || list.length === 0) {
              await fallbackTriageDocs();
            }
          },
          async () => {
            await fallbackTriageDocs();
          },
          { timeout: 5000, enableHighAccuracy: false }
        );
      } else {
        await fallbackTriageDocs();
      }
    } finally {
      setLoadingDoctors(false);
    }
  };

  const scrollToSelectedDoctor = () => {
    setTimeout(() => {
      const el = document.getElementById('chatbox-selected-doctor-card');
      const container = messagesBoxRef.current;
      if (el && container) {
        const elRect = el.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop = elRect.top - containerRect.top + container.scrollTop;
        container.scrollTo({
          top: Math.max(0, relativeTop - 15),
          behavior: 'smooth'
        });
      } else if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  const handleSelectDoctor = (doc, autoOpenBooking = false) => {
    setSelectedDoctor(doc);
    updateCurrentStep('doctor_selected');
    if (autoOpenBooking) {
      setShowInlineBooking(true);
    }
    const docName = doc.fullName.startsWith('Dr.') ? doc.fullName : `Dr. ${doc.fullName}`;
    const botMsg = `Selected ${docName} (${doc.specialization} at ${doc.hospitalName || 'Partner Hospital'}). You can book an appointment below or say 'change doctor' to pick another doctor.`;
    addBotMessage(botMsg);
    if (voiceModeRef.current) {
      speakAgent(`Selected ${docName}. Say 'book appointment' or 'change doctor'.`);
    }
    scrollToSelectedDoctor();
  };

  const handleChangeDoctor = () => {
    setSelectedDoctor(null);
    setShowInlineBooking(false);
    updateCurrentStep('doctor_selection');
    const botMsg = `Switched back to doctor suggestions. You can select another doctor, change the distance, or filter by insurance.`;
    addBotMessage(botMsg);
    if (voiceModeRef.current) {
      speakAgent(`Switched back to doctor list. Please choose another doctor.`);
    }
  };

  const handleChangeRadius = (newRadius) => {
    setDoctorRadius(newRadius);
    fetchInChatDoctors(recommendation?.department, newRadius, doctorInsuranceRef.current);
    addBotMessage(`Updated radius to ${newRadius} km. Finding doctors near you...`);
    if (voiceModeRef.current) {
      speakAgent(`Updated radius to ${newRadius} kilometers.`);
    }
  };

  const handleChangeInsurance = (newInsurance) => {
    setDoctorInsurance(newInsurance);
    fetchInChatDoctors(recommendation?.department, doctorRadiusRef.current, newInsurance);
    addBotMessage(`Filtering doctors by insurance: ${newInsurance === 'all' ? 'All Providers' : newInsurance}...`);
    if (voiceModeRef.current) {
      speakAgent(`Filtered by ${newInsurance === 'all' ? 'all insurances' : newInsurance}.`);
    }
  };

  const presentTriageAndDoctors = async (rec, resultHeading, finalMessage) => {
    setRecommendation(rec);
    updateCurrentStep('doctor_selection');
    setSelectedDoctor(null);
    setShowInlineBooking(false);

    const newMsg = {
      id: Date.now(),
      sender: 'bot',
      text: resultHeading,
      isResultCard: true,
      recommendation: rec,
      lang: convLangRef.current
    };
    messagesRef.current = [...messagesRef.current, newMsg];
    setMessages(prev => [...prev, newMsg]);

    // Fetch doctors with default 10 km
    await fetchInChatDoctors(rec.department, 10, 'all');

    if (voiceModeRef.current) {
      const speech = `${finalMessage || `Based on your symptoms, I recommend consulting ${rec.department}.`} I found doctors nearby within 10 kilometers. You can say 'select doctor 1', say a doctor's name, or change the distance.`;
      await speakAgent(speech);
    }
  };

  // Intent parsing helpers for doctor selection, radius, and insurance
  const isChangeDoctorIntent = (q) => {
    const l = q.toLowerCase();
    return (
      l.includes('change doctor') ||
      l.includes('switch doctor') ||
      l.includes('different doctor') ||
      l.includes('another doctor') ||
      l.includes('choose other') ||
      l.includes('select other') ||
      l.includes('back to doctors') ||
      l.includes('show doctors')
    );
  };

  const matchRadiusIntent = (q) => {
    const l = q.toLowerCase();
    const m = l.match(/(?:radius|distance|within|nearby|range)\s*(?:of|is|to|=)?\s*(\d+)/i) ||
              l.match(/(\d+)\s*(?:km|kilometers|kms)/i);
    if (m && m[1]) {
      const val = parseInt(m[1], 10);
      if (val >= 1 && val <= 100) return val;
    }
    return null;
  };

  const matchInsuranceIntent = (q, providerList = []) => {
    const l = q.toLowerCase();
    if (l.includes('all insurance') || l.includes('clear insurance') || l.includes('any insurance') || l.includes('no insurance')) {
      return 'all';
    }
    const m = l.match(/(?:insurance|covered by|accepting|filter by insurance)\s*(?:is|to|:)?\s*([a-zA-Z0-9\s]+)/i);
    const candidate = m ? m[1].trim() : l;
    for (const p of providerList) {
      if (candidate.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(candidate.toLowerCase())) {
        return p;
      }
    }
    if (m && m[1].trim().length >= 3) {
      return m[1].trim();
    }
    return null;
  };

  const matchDoctorSelectIntent = (q, doctorList = []) => {
    const l = q.toLowerCase();
    const numMatch = l.match(/(?:doctor|option|number|#|select|choose)\s*(\d+)/i) ||
                     l.match(/^(\d+)$/);
    if (numMatch && numMatch[1]) {
      const idx = parseInt(numMatch[1], 10) - 1;
      if (idx >= 0 && idx < doctorList.length) {
        return doctorList[idx];
      }
    }
    if (l.includes('first') || l.includes('1st')) return doctorList[0] || null;
    if (l.includes('second') || l.includes('2nd')) return doctorList[1] || null;
    if (l.includes('third') || l.includes('3rd')) return doctorList[2] || null;
    if (l.includes('fourth') || l.includes('4th')) return doctorList[3] || null;
    if (l.includes('fifth') || l.includes('5th')) return doctorList[4] || null;

    for (const doc of doctorList) {
      const name = (doc.fullName || '').toLowerCase().replace(/^dr\.?\s*/i, '').trim();
      const parts = name.split(/\s+/).filter(p => p.length >= 3);
      if (l.includes(name) || parts.some(p => l.includes(p))) {
        return doc;
      }
    }
    return null;
  };

  const isBookAppointmentIntent = (q) => {
    const l = q.toLowerCase();
    return (
      l.includes('book appointment') ||
      l.includes('book slot') ||
      l.includes('schedule appointment') ||
      l.includes('book now') ||
      l.includes('book with doctor')
    );
  };

  const addUserMessage = (text) => {
    const newMsg = { id: Date.now() + Math.random(), sender: 'user', text };
    messagesRef.current = [...messagesRef.current, newMsg];
    setMessages(prev => [...prev, newMsg]);
  };

  const resolveFollowUpProfile = (symptomId, symptomName = '') => {
    if (!symptomId && !symptomName) return null;
    const sId = (symptomId || '').toLowerCase();
    const sName = (symptomName || '').toLowerCase();
    if (followUpProfiles[sId]) return { profileId: sId, profile: followUpProfiles[sId] };
    if (sId.includes('diarrhea') || sId.includes('loose_motion') || sName.includes('loose') || sName.includes('diarrhea')) {
      if (followUpProfiles.diarrhea) return { profileId: 'diarrhea', profile: followUpProfiles.diarrhea };
    }
    if (sId.includes('tinnitus') || sName.includes('ringing') || sName.includes('tinnitus') || (sName.includes('ear') && (sName.includes('buzz') || sName.includes('ring')))) {
      if (followUpProfiles.tinnitus) return { profileId: 'tinnitus', profile: followUpProfiles.tinnitus };
    }
    if (sId.includes('urinary_urgency') || sId.includes('urinary_frequency') || (sName.includes('frequent') && sName.includes('urin'))) {
      if (followUpProfiles.urinary_frequency) return { profileId: 'urinary_frequency', profile: followUpProfiles.urinary_frequency };
    }
    if (sId.includes('burning_urination') || (sName.includes('burning') && sName.includes('urin')) || (sName.includes('pain') && sName.includes('urin'))) {
      if (followUpProfiles.burning_urination) return { profileId: 'burning_urination', profile: followUpProfiles.burning_urination };
    }
    if (sId.includes('jaundice') || sName.includes('jaundice') || sName.includes('yellow')) {
      if (followUpProfiles.jaundice) return { profileId: 'jaundice', profile: followUpProfiles.jaundice };
    }
    if (sId.includes('tooth') || sId.includes('dental') || sName.includes('tooth') || sName.includes('dental')) {
      if (followUpProfiles.toothache) return { profileId: 'toothache', profile: followUpProfiles.toothache };
    }
    if (sId.includes('fever') || sName.includes('fever') || sName.includes('temperature')) {
      if (followUpProfiles.fever) return { profileId: 'fever', profile: followUpProfiles.fever };
    }
    if (sId.includes('constipation') || sName.includes('constipat')) {
      if (followUpProfiles.constipation) return { profileId: 'constipation', profile: followUpProfiles.constipation };
    }
    if (sId.includes('chest_pain') || sName.includes('chest pain') || sName.includes('pressure')) {
      if (followUpProfiles.chest_pain) return { profileId: 'chest_pain', profile: followUpProfiles.chest_pain };
    }
    if (sId.includes('skin_rash') || sId.includes('hives') || sName.includes('rash') || sName.includes('itching')) {
      if (followUpProfiles.skin_rash) return { profileId: 'skin_rash', profile: followUpProfiles.skin_rash };
    }
    if (sId.includes('cough') || sName.includes('cough')) {
      if (followUpProfiles.persistent_cough) return { profileId: 'persistent_cough', profile: followUpProfiles.persistent_cough };
    }
    for (const [pKey, pVal] of Object.entries(followUpProfiles || {})) {
      if (sId === pKey || sName.includes(pKey)) return { profileId: pKey, profile: pVal };
    }
    return null;
  };

  const askProfileQuestion = (profile, qIndex) => {
    const questionObj = profile?.questions?.[qIndex];
    if (!questionObj) return;

    const lang = convLangRef.current;
    let questionText = questionObj.question;
    if (lang === 'manglish' && questionObj.manglish) {
      questionText = questionObj.manglish;
    } else if (lang === 'malayalam_script' && questionObj.malayalam) {
      questionText = questionObj.malayalam;
    }

    addBotMessage(questionText, {}, { speakMessage: false });
    if (voiceModeRef.current) {
      speakAgent(questionObj.question);
    }
    updateCurrentStep('profile_question');
  };

  // Direct 1-tap route to General Medicine if input is messy or user is unsure
  const handleDirectGeneralMedicine = () => {
    addUserMessage('Recommend General Medicine consultation');
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const rec = {
        department: 'General Medicine',
        altDepartment: 'Primary Care / Internal Medicine',
        bodyAreaName: 'General / Multi-System',
        symptomName: 'General Clinical Evaluation',
        urgency: 'ROUTINE',
        duration: 'Not specified',
        severity: 'moderate',
        reason: 'When symptoms involve multiple areas or are difficult to categorize, a General Medicine physician provides a thorough initial physical checkup and baseline diagnostic screening to guide appropriate care.',
        advice: 'Schedule a routine consultation with a general physician or internist for an overall health assessment.'
      };
      presentTriageAndDoctors(rec, 'Based on your selection, here is your recommended specialty department for consultation:');
    }, 350);
  };

  // When user picks a body area
  const handleSelectBodyArea = (partId, fromSvg = false, skipUserMsg = false, skipBotMsg = false) => {
    selectingAreaRef.current = true;
    const displayName = bodyPartsData?.[partId]?.displayName || partId;

    if (!fromSvg && onBodyPartSelect) {
      onBodyPartSelect(partId);
    }

    updateTriageData(prev => ({ ...prev, bodyArea: partId }));
    if (!skipUserMsg && !fromSvg) {
      addUserMessage(`Discomfort in: ${displayName}`);
    }

    if (skipBotMsg) {
      updateCurrentStep('symptom');
      selectingAreaRef.current = false;
      return;
    }

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const lang = convLangRef.current;
      let bodyAreaQuestion;
      if (lang === 'manglish') {
        bodyAreaQuestion = `Manasilayi. ${displayName} sambandhichu enthanu budhimuttu ennu parayamo?`;
      } else if (lang === 'malayalam_script') {
        bodyAreaQuestion = `മനസ്സിലായി. ${displayName} ഭാഗത്ത് എന്താണ് ബുദ്ധിമുട്ട് എന്ന് പറയാമോ?`;
      } else {
        bodyAreaQuestion = `Got it. What specific type of symptom or problem are you experiencing in your ${displayName}?`;
      }
      addBotMessage(bodyAreaQuestion);
      updateCurrentStep('symptom');
      selectingAreaRef.current = false;
    }, 350);
  };

  // After symptom is chosen
  const handleSelectSymptom = (symptom) => {
    updateTriageData(prev => ({ ...prev, symptomId: symptom.id, symptomName: symptom.label }));
    addUserMessage(symptom.label);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Check if this symptom has a decision tree
      if (symptom.hasDecisionTree && symptom.decisionTreeId) {
        const tree = decisionTrees?.[symptom.decisionTreeId];
        if (tree) {
          const startNodeId = tree.startNode;
          const startNode = tree.nodes[startNodeId];
          updateTriageData(prev => ({
            ...prev,
            treeId: symptom.decisionTreeId,
            currentNodeId: startNodeId,
            currentNode: startNode,
            answersMap: {},
            pendingMultiSelect: []
          }));
          addBotMessage(startNode.question);
          updateCurrentStep('tree_node');
          return;
        }
      }

      // Check if this symptom has a clinical follow-up profile that does NOT require duration
      const resolvedProfile = resolveFollowUpProfile(symptom.id, symptom.label);
      if (resolvedProfile?.profile?.requiresDuration === false && resolvedProfile.profile.questions?.length > 0) {
        updateTriageData(prev => ({
          ...prev,
          profileId: resolvedProfile.profileId,
          profileQuestionIndex: 0,
          profileAnswers: {}
        }));
        askProfileQuestion(resolvedProfile.profile, 0);
        return;
      }

      // No tree (or requires duration) - proceed to duration step
      const lang = convLangRef.current;
      let durationQuestion;
      if (lang === 'manglish') {
        durationQuestion = 'Ithu thudangiyittu ethra naalayi / ethra samayamayi?';
      } else if (lang === 'malayalam_script') {
        durationQuestion = 'ഇത് തുടങ്ങിയിട്ട് എത്ര സമയമായി / എത്ര നാളായി?';
      } else {
        durationQuestion = followUpQuestions?.duration?.question || 'How long have you been experiencing this problem?';
      }
      addBotMessage(durationQuestion);
      updateCurrentStep('duration');
    }, 350);
  };

  // Decision Tree Navigation
  const advanceTree = (
    newAnswersMap,
    answeredNodeId,
    newTriage
  ) => {
    const tree = decisionTrees?.[newTriage.treeId];

    if (!tree) {
      submitTriage(
        newTriage.bodyArea,
        newTriage.symptomId,
        newTriage.treeId,
        newAnswersMap
      );
      return;
    }

    const node = tree.nodes[answeredNodeId];
    const logic = node?.logic || {};

    let next = null;

    if (node?.type === 'multi_select') {
      const selected = (
        newAnswersMap[answeredNodeId] || []
      ).filter(a => a !== 'none');

      if (
        selected.length > 0 &&
        logic.if_any_except_none
      ) {
        next = logic.if_any_except_none;
      } else if (
        selected.length === 0 &&
        logic.if_none_or_only_none
      ) {
        next = logic.if_none_or_only_none;
      } else if (
        logic.if_2_or_more_except_none &&
        selected.length >= 2
      ) {
        next = logic.if_2_or_more_except_none;
      } else if (
        logic.if_less_than_2_or_only_none &&
        selected.length < 2
      ) {
        next = logic.if_less_than_2_or_only_none;
      }
    } else if (node?.type === 'single_select') {
      const answer = newAnswersMap[answeredNodeId];
      next = logic[answer] || null;
    }

    if (!next) {
      submitTriage(
        newTriage.bodyArea,
        newTriage.symptomId,
        newTriage.treeId,
        newAnswersMap
      );
      return;
    }

    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);

      if (tree.outcomes[next]) {
        submitTriage(
          newTriage.bodyArea,
          newTriage.symptomId,
          newTriage.treeId,
          newAnswersMap
        );
        return;
      }

      const nextNode = tree.nodes[next];

      if (!nextNode) {
        submitTriage(
          newTriage.bodyArea,
          newTriage.symptomId,
          newTriage.treeId,
          newAnswersMap
        );
        return;
      }

      setTriageData(prev => ({
        ...prev,
        currentNodeId: next,
        currentNode: nextNode,
        answersMap: newAnswersMap,
        pendingMultiSelect: []
      }));

      addBotMessage(
        nextNode.question,
        {},
        {
          speakMessage: false  // Voice mode uses explicit speakAgent() below
        }
      );

      if (voiceModeRef.current) {
        await speakAgent(nextNode.question);
      }

      updateCurrentStep('tree_node');
    }, 400);
  };

  // Single-select chip click in a tree node
  const handleTreeSingleSelect = (optionId, optionLabel) => {
    addUserMessage(optionLabel);
    const { treeId, currentNodeId, answersMap, bodyArea, symptomId } = triageData;
    const newAnswersMap = { ...answersMap, [currentNodeId]: optionId };

    setTriageData(prev => ({ ...prev, answersMap: newAnswersMap }));
    advanceTree(newAnswersMap, currentNodeId, { treeId, bodyArea, symptomId });
  };

  // Multi-select: toggle a chip
  const toggleMultiSelectOption = (optionId) => {
    setTriageData(prev => {
      let pending = [...prev.pendingMultiSelect];
      if (optionId === 'none') {
        pending = pending.includes('none') ? [] : ['none'];
      } else {
        pending = pending.filter(x => x !== 'none');
        if (pending.includes(optionId)) {
          pending = pending.filter(x => x !== optionId);
        } else {
          pending.push(optionId);
        }
      }
      return { ...prev, pendingMultiSelect: pending };
    });
  };

  // Multi-select: confirm button
  const confirmMultiSelect = () => {
    const { treeId, currentNodeId, answersMap, pendingMultiSelect, currentNode, bodyArea, symptomId } = triageData;
    if (pendingMultiSelect.length === 0) return;

    const labels = pendingMultiSelect.map(id => {
      const opt = currentNode?.options?.find(o => o.id === id);
      return opt?.label || id;
    });
    addUserMessage(labels.join(', '));

    const newAnswersMap = { ...answersMap, [currentNodeId]: pendingMultiSelect };
    setTriageData(prev => ({ ...prev, answersMap: newAnswersMap, pendingMultiSelect: [] }));
    advanceTree(newAnswersMap, currentNodeId, { treeId, bodyArea, symptomId });
  };

  // Final API calls
  const submitTriage = async (bodyArea, symptomId, treeId, answersMap) => {
    updateCurrentStep('loading');
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyArea, symptomId, treeId, answersMap })
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.success && data.recommendation) {
        const finalMessage =
          `Based on what you've told me, I recommend consulting ${data.recommendation.department}.`;

        presentTriageAndDoctors(data.recommendation, `Based on your responses, here is your recommended specialty:`, finalMessage);
      } else {
        throw new Error('Fallback to General Medicine');
      }
    } catch (err) {
      setIsTyping(false);
      const fallbackRec = {
        department: 'General Medicine',
        altDepartment: 'Primary Care / Internal Medicine',
        bodyAreaName: bodyArea || 'Head & Neck',
        symptomArea: triageData.symptomName ? undefined : (bodyArea || 'Head & Neck'),
        symptomName: triageData.symptomName || 'Headache / General Symptoms',
        urgency: 'ROUTINE',
        reason: 'When symptoms are mixed or non-emergency, a General Medicine physician performs initial clinical examination and baseline tests to initiate care or recommend appropriate sub-specialists.',
        advice: 'Consult a primary care physician / internist for clinical evaluation.'
      };
      presentTriageAndDoctors(fallbackRec, 'Based on your symptoms, here is your recommended specialty department for consultation:');
    }
  };
  const finishVoiceConsultation = () => {
    voiceModeRef.current = false;
    voiceProcessingRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch { }

    setIsListening(false);
    setVoiceStatus('idle');
    setInteractionMode('manual');
  };
  // userTyped: the raw text the user typed (shown in bubble), vs durationOpt.label (stored as data)
  // skipUserMsg: true when processUserInput already added the user bubble (avoids duplicate)
  const handleSelectDuration = (durationOpt, userTyped = null, skipUserMsg = false) => {
    return new Promise((resolve) => {
      const updatedTriage = {
        ...triageDataRef.current,
        duration: durationOpt.label
      };
      updateTriageData(updatedTriage);

      // Only add user bubble if not already added by processUserInput
      if (!skipUserMsg) {
        addUserMessage(userTyped || durationOpt.label);
      }
      setIsTyping(true);

      setTimeout(async () => {
        setIsTyping(false);

        // Check if this symptom has a clinical follow-up profile
        const resolved = resolveFollowUpProfile(updatedTriage.symptomId, updatedTriage.symptomName);
        if (resolved?.profile?.questions?.length > 0) {
          updateTriageData(prev => ({
            ...prev,
            profileId: resolved.profileId,
            profileQuestionIndex: 0,
            profileAnswers: {}
          }));
          askProfileQuestion(resolved.profile, 0);
          resolve();
          return;
        }

        if (resolved?.profile && resolved.profile.requiresSeverity === false) {
          // Direct recommendation without generic severity
          await handleSelectSeverity({ id: 'N/A', label: 'Not applicable' }, null, true);
          resolve();
          return;
        }

        // Chat bubble: show in conversation language (Manglish/Malayalam/English)
        const lang = convLangRef.current;
        let severityQuestion;
        if (lang === 'manglish') {
          severityQuestion = 'Vedana engane und — cheruthano, idatharam aano, atho sahikkan pattatha bayankara vedana aano?';
        } else if (lang === 'malayalam_script') {
          severityQuestion = 'വേദന എങ്ങനെയുണ്ട് — ചെറുതാണോ, ഇടത്തരം ആണോ, അതോ സഹിക്കാൻ പറ്റാത്ത അതികഠിനമായ വേദനയാണോ?';
        } else {
          severityQuestion = followUpQuestions?.severity?.question || 'How severe is the discomfort?';
        }

        // TTS: always English — browser TTS cannot read Manglish or Malayalam script
        const severityQuestionTTS = followUpQuestions?.severity?.question || 'How severe is the discomfort?';

        addBotMessage(severityQuestion, {}, { speakMessage: false });

        if (voiceModeRef.current) {
          await speakAgent(severityQuestionTTS); // English only for TTS
        }

        updateCurrentStep('severity');
        resolve();
      }, 350);
    });
  };
  const handleSelectSeverity = async (severityOpt, userTyped = null, skipUserMsg = false) => {
    const updatedData = { ...triageDataRef.current, severity: severityOpt.id };
    updateTriageData(updatedData);
    // Only add user bubble if not already added by processUserInput
    if (!skipUserMsg) {
      addUserMessage(userTyped || severityOpt.label);
    }
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyArea: updatedData.bodyArea,
          symptomId: updatedData.symptomId,
          duration: updatedData.duration,
          severity: severityOpt.id,
          profileAnswers: updatedData.profileAnswers || {}
        })
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.success && data.recommendation) {
        const finalMessage =
          `Based on your symptoms, I recommend consulting ${data.recommendation.department}.`;

        const lang = convLangRef.current;
        let resultHeading;
        if (lang === 'manglish') {
          resultHeading = `${data.recommendation.bodyAreaName || 'Ee bhaagathe'} sambandhichu ningalude lakshanangal vechu, ningal kaanenda specialty department ithaanu:`;
        } else if (lang === 'malayalam_script') {
          resultHeading = `${data.recommendation.bodyAreaName || ''} ഭാഗത്തെ നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിലയിരുത്തി, നിങ്ങൾ കാണേണ്ട വിഭാഗം ഇതാ താഴെ നൽകുന്നു:`;
        } else {
          resultHeading = `Based on your symptoms in ${data.recommendation.bodyAreaName}, here is your recommended specialty department for consultation:`;
        }

        presentTriageAndDoctors(data.recommendation, resultHeading, finalMessage);
      } else {
        throw new Error('Fallback to General Medicine');
      }
    } catch (err) {
      setIsTyping(false);
      const fallbackRec = {
        department: 'General Medicine',
        altDepartment: 'Primary Care / Internal Medicine',
        bodyAreaName: triageDataRef.current.bodyArea || 'General Area',
        symptomArea: undefined,
        symptomName: triageDataRef.current.symptomName || 'Reported Symptoms',
        duration: triageDataRef.current.duration || 'Not specified',
        severity: severityOpt.id,
        urgency: severityOpt.id === 'severe' ? 'PRIORITY' : 'ROUTINE',
        reason: 'A primary care evaluation will assist in comprehensive triaging and examination of your symptoms.',
        advice: 'Please consult a registered general physician.'
      };
      const lang = convLangRef.current;
      let fallbackHeading;
      if (lang === 'manglish') {
        fallbackHeading = 'Ningalude lakshanangal vechu, ningal kaanenda specialty department ithaanu:';
      } else if (lang === 'malayalam_script') {
        fallbackHeading = 'നിങ്ങളുടെ ലക്ഷണങ്ങൾ വിലയിരുത്തി, നിങ്ങൾ കാണേണ്ട വിഭാഗം താഴെ നൽകുന്നു:';
      } else {
        fallbackHeading = 'Based on your symptoms, here is your recommended specialty department for consultation:';
      }
      presentTriageAndDoctors(fallbackRec, fallbackHeading);
    }
  };

  const handleSelectProfileOption = async (option, questionObj, userTyped = null, skipUserMsg = false) => {
    const curProfileId = triageDataRef.current.profileId;
    const curAnswers = { ...(triageDataRef.current.profileAnswers || {}), [questionObj.id]: option.id };

    const isRedFlag = Boolean(option.redFlag || option.urgency === 'EMERGENCY');

    const updatedData = {
      ...triageDataRef.current,
      profileAnswers: curAnswers,
      isEmergency: isRedFlag || triageDataRef.current.isEmergency
    };
    updateTriageData(updatedData);

    const lang = convLangRef.current;
    const displayLabel = (lang === 'manglish' && option.manglish)
      ? option.manglish
      : (lang === 'malayalam_script' && option.malayalam)
        ? option.malayalam
        : (option.label || option.id);

    if (!skipUserMsg) {
      addUserMessage(userTyped || displayLabel);
    }
    setIsTyping(true);

    const profile = followUpProfiles?.[curProfileId];
    const nextQIndex = (triageDataRef.current.profileQuestionIndex || 0) + 1;

    setTimeout(async () => {
      setIsTyping(false);

      if (profile && profile.questions && nextQIndex < profile.questions.length) {
        updateTriageData(prev => ({
          ...prev,
          profileQuestionIndex: nextQIndex,
          profileAnswers: curAnswers
        }));
        askProfileQuestion(profile, nextQIndex);
      } else {
        if (profile?.requiresSeverity) {
          const sLang = convLangRef.current;
          let severityQuestion;
          if (sLang === 'manglish') {
            severityQuestion = 'Vedana engane und — cheruthano, idatharam aano, atho sahikkan pattatha bayankara vedana aano?';
          } else if (sLang === 'malayalam_script') {
            severityQuestion = 'വേദന എങ്ങനെയുണ്ട് — ചെറുതാണോ, ഇടത്തരം ആണോ, അതോ സഹിക്കാൻ പറ്റാത്ത അതികഠിനമായ വേദനയാണോ?';
          } else {
            severityQuestion = followUpQuestions?.severity?.question || 'How severe is the discomfort?';
          }
          addBotMessage(severityQuestion, {}, { speakMessage: false });
          if (voiceModeRef.current) {
            await speakAgent(severityQuestion);
          }
          updateCurrentStep('severity');
        } else {
          // Direct recommendation
          await handleSelectSeverity(
            { id: isRedFlag ? 'severe' : 'N/A', label: isRedFlag ? 'Severe' : 'N/A' },
            null,
            true
          );
        }
      }
    }, 350);
  };
  const handleVoiceMultiSelect = (
    selectedOptionIds,
    source = 'voice'
  ) => {
    if (!selectedOptionIds?.length) return;

    const {
      treeId,
      currentNodeId,
      answersMap,
      bodyArea,
      symptomId,
      currentNode
    } = triageData;

    const labels = selectedOptionIds.map((id) => {
      const option = currentNode?.options?.find(
        (o) => o.id === id
      );

      return option?.label || id;
    });

    // Show what the user said/selected
    addUserMessage(labels.join(', '));

    const newAnswersMap = {
      ...answersMap,
      [currentNodeId]: selectedOptionIds
    };

    setTriageData((prev) => ({
      ...prev,
      answersMap: newAnswersMap,
      pendingMultiSelect: []
    }));

    advanceTree(
      newAnswersMap,
      currentNodeId,
      {
        treeId,
        bodyArea,
        symptomId
      }
    );
  };
  // One-Shot Complete Triage: when user gives full sentence with symptom + duration + severity
  const handleOneShotCompleteTriage = async (intent, source = 'manual') => {
    const { symptomId, durationLabel, durationId, severityId, bodyArea } = intent;
    if (!symptomId) return false;

    console.log('[Talk2Doc] One-shot complete triage triggered:', { symptomId, durationId, severityId, bodyArea });

    setIsAiProcessing(true);
    setIsTyping(true);

    let targetAreaKey = bodyArea || triageDataRef.current.bodyArea;
    let foundSymptom = null;

    if (targetAreaKey && bodyPartsData?.[targetAreaKey]) {
      foundSymptom = bodyPartsData[targetAreaKey]?.symptoms?.find(s => s.id === symptomId);
    }
    if (!foundSymptom) {
      for (const [aKey, aVal] of Object.entries(bodyPartsData || {})) {
        const s = aVal?.symptoms?.find(sym => sym.id === symptomId);
        if (s) {
          foundSymptom = s;
          targetAreaKey = aKey;
          break;
        }
      }
    }

    const finalLabel = foundSymptom?.label || intent.symptomLabel || symptomId;
    const finalAreaKey = targetAreaKey || 'general';
    const finalDuration = durationLabel || (durationId === 'hours' ? 'Hours to a day' : durationId === 'days' ? '1 to 3 days' : durationId === 'weeks' ? '1 to 4 weeks' : 'Chronic');
    const finalSeverity = severityId || 'moderate';

    updateTriageData(prev => ({
      ...prev,
      bodyArea: finalAreaKey,
      symptomId,
      symptomName: finalLabel,
      duration: finalDuration,
      severity: finalSeverity
    }));

    if (onBodyPartSelect && finalAreaKey) {
      onBodyPartSelect(finalAreaKey);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyArea: finalAreaKey,
          symptomId,
          duration: finalDuration,
          severity: finalSeverity
        })
      });

      const data = await res.json();
      setIsAiProcessing(false);
      setIsTyping(false);

      if (data.success && data.recommendation) {
        const rec = data.recommendation;

        const informalAcks = [
          `Oh bless you, I hear you — dealing with ${finalLabel} ${finalDuration.toLowerCase().includes('since') ? finalDuration : 'for ' + finalDuration} sounds really exhausting! Don't worry at all, I've got everything I need to get you sorted out.`,
          `Aww, so sorry you're going through that ${finalLabel}! That must be really uncomfortable. I've taken note of everything — here is the best doctor for you:`,
          `Oh gosh, having ${finalLabel} for ${finalDuration} is no fun at all. Hang in there! Based on everything you told me, here is exactly who you should see:`
        ];
        const ackText = informalAcks[Math.floor(Math.random() * informalAcks.length)];
        const spokenMessage = `Alright! You should definitely see a ${rec.department} specialist for this. ${rec.advice ? rec.advice : ''} Don't worry at all, you'll be in good hands!`;

        await presentTriageAndDoctors(rec, ackText, spokenMessage);
        return true;
      }
    } catch (err) {
      console.warn('[Talk2Doc] One-shot recommend failed:', err);
      setIsAiProcessing(false);
      setIsTyping(false);
    }
    return false;
  };

  const processUserInput = async (
    rawQuery,
    { source = 'manual' } = {}
  ) => {
    if (!rawQuery || !rawQuery.trim()) {
      return;
    }

    const query = rawQuery.trim();

    // Update detected conversation language (maintain language stickiness for Malayalam & Manglish)
    const detectedLang = detectFrontendLanguage(query);
    if (detectedLang === 'malayalam_script' || detectedLang === 'manglish') {
      convLangRef.current = detectedLang;
    } else {
      // If currently in Manglish or Malayalam, only revert to English if user explicitly asked for English
      const qLower = query.toLowerCase();
      if (
        qLower.includes('in english') ||
        qLower.includes('speak english') ||
        qLower.includes('switch to english') ||
        qLower.includes('talk in english')
      ) {
        convLangRef.current = 'english';
      }
      // Otherwise preserve convLangRef.current!
    }

    console.log(
      `[Talk2Doc] Processing ${source} input:`,
      query
    );

    addUserMessage(query);

    // ==========================================
    // 0. ONE-SHOT COMPLETE TRIAGE (symptom + duration + severity)
    // ==========================================
    if (currentStepRef.current === 'body_area' || currentStepRef.current === null) {
      const fullIntent = extractFullTriageIntent(query);
      if (fullIntent?.isComplete) {
        console.log('[Talk2Doc] One-shot full triage detected from text:', fullIntent);
        const handled = await handleOneShotCompleteTriage(fullIntent, source);
        if (handled) return;
      }
    }

    // ==========================================
    // 1. DURATION
    // ==========================================
    const stepNow = currentStepRef.current;
    const triageNow = triageDataRef.current;

    // ==========================================
    // 0B. DOCTOR SELECTION & MANAGEMENT
    // ==========================================
    if (stepNow === 'doctor_selection' || stepNow === 'doctor_selected') {
      const qL = query.toLowerCase();

      // 0. "Show in UI" — move doctor list to page-level panel below chat
      if (
        qL.includes('show in ui') ||
        qL.includes('show outside') ||
        qL.includes('show below') ||
        qL.includes('show in page') ||
        qL.includes('show panel')
      ) {
        setShowDoctorsInChat(false);
        if (onShowDoctorsInUI) onShowDoctorsInUI(true);
        addBotMessage('Doctor list is now shown in the panel below the chat. Scroll down to see all nearby doctors.');
        if (source === 'voice' || voiceModeRef.current) {
          await speakAgent('Moved the doctor list to the panel below. Please scroll down to view it.');
        }
        return;
      }

      // 0b. "Show in chat" — bring doctor list back into chat
      if (
        qL.includes('show in chat') ||
        qL.includes('back in chat') ||
        qL.includes('show here') ||
        qL.includes('show inside')
      ) {
        setShowDoctorsInChat(true);
        if (onShowDoctorsInUI) onShowDoctorsInUI(false);
        addBotMessage('Doctor list is now shown right here in the chat.');
        return;
      }

      // 1. Change Doctor intent
      if (isChangeDoctorIntent(query)) {
        handleChangeDoctor();
        return;
      }

      // 2. Doctor Selection by name, number, or ordinal
      const matchedDoc = matchDoctorSelectIntent(query, inChatDoctorsRef.current);
      if (matchedDoc) {
        const wantsBooking = query.toLowerCase().includes('book');
        handleSelectDoctor(matchedDoc, wantsBooking);
        return;
      }

      // 3. Radius intent ("radius 20km", "within 15 km", etc.)
      const radiusVal = matchRadiusIntent(query);
      if (radiusVal) {
        handleChangeRadius(radiusVal);
        return;
      }

      // 4. Insurance intent ("insurance Star Health", "filter by Medicare", etc.)
      const insVal = matchInsuranceIntent(query, availableInsurances);
      if (insVal) {
        handleChangeInsurance(insVal);
        return;
      }

      // 5. Book Appointment intent
      if (isBookAppointmentIntent(query)) {
        if (selectedDoctorRef.current) {
          setShowInlineBooking(true);
          scrollToSelectedDoctor();
          const docName = selectedDoctorRef.current.fullName;
          addBotMessage(`Opening appointment booking for ${docName}. Select your preferred date and time slot.`);
          if (source === 'voice' || voiceModeRef.current) {
            await speakAgent(`Opening appointment booking for ${docName}.`);
          }
        } else if (inChatDoctorsRef.current.length > 0) {
          addBotMessage(`Please select a doctor first (e.g. "select 1" or click "Select This Doctor").`);
          if (source === 'voice' || voiceModeRef.current) {
            await speakAgent(`Please select a doctor first, for example say select doctor 1.`);
          }
        }
        return;
      }

      // Fallback helpful guidance in doctor selection mode
      const guidance = `You can select a doctor by typing their name or number (e.g. "select 1"), change search distance (e.g. "radius 20km"), filter insurance (e.g. "insurance Star Health"), or type "show in UI" to view the doctor list in the panel below.`;
      addBotMessage(guidance);
      if (source === 'voice' || voiceModeRef.current) {
        await speakAgent(`You can select a doctor by saying doctor 1, or change distance by saying radius 20 kilometers.`);
      }
      return;
    }

    if (stepNow === 'duration') {
      const durId = matchDurationQuery(query);

      if (durId) {
        const opt =
          followUpQuestions?.duration?.options?.find(
            o => o.id === durId
          ) || {
            id: durId,
            label: query
          };

        await handleSelectDuration(opt, query, true); // skipUserMsg=true: processUserInput already added the bubble
        return;
      }

      // ── AI Fallback for duration ──
      setIsTyping(true);
      try {
        const aiRes = await fetch(`${API_BASE_URL}/api/ai/understand-symptoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            currentStep: 'duration',
            currentContext: {
              bodyArea: triageNow.bodyArea,
              symptomId: triageNow.symptomId,
              symptomName: triageNow.symptomName,
              duration: triageNow.duration,
              severity: triageNow.severity
            }
          })
        });
        const aiData = await aiRes.json();
        const aiDurId = aiData?.extracted?.durationId;
        if (aiDurId) {
          setIsTyping(false);
          const opt = followUpQuestions?.duration?.options?.find(o => o.id === aiDurId)
            || { id: aiDurId, label: aiData?.extracted?.duration || aiDurId };
          await handleSelectDuration(opt, query, true); // skipUserMsg=true: processUserInput already added the bubble
          return;
        }
      } catch { /* AI unavailable, fall through */ }

      setIsTyping(false);
      addBotMessage(
        `Hmm, I didn't catch that — did you mean today, yesterday, a few days, or longer? You can also tap a button below.`,
        {},
        { speakMessage: false }
      );
      return;
    }

    // ==========================================
    // 1.5. CLINICAL PROFILE QUESTION
    // ==========================================
    if (stepNow === 'profile_question') {
      const profile = followUpProfiles?.[triageNow.profileId];
      const qIndex = triageNow.profileQuestionIndex || 0;
      const currQ = profile?.questions?.[qIndex];
      if (currQ) {
        const qLower = query.toLowerCase();
        const matchedOpt = currQ.options?.find(o =>
          (o.label && qLower.includes(o.label.toLowerCase())) ||
          (o.manglish && qLower.includes(o.manglish.toLowerCase())) ||
          (o.malayalam && qLower.includes(o.malayalam.toLowerCase())) ||
          (o.id && qLower.includes(o.id.toLowerCase()))
        );
        if (matchedOpt) {
          await handleSelectProfileOption(matchedOpt, currQ, query, true);
          return;
        }

        if (qLower.includes('no') || qLower.includes('none') || qLower.includes('illa') || qLower.includes('onnumilla') || qLower.includes('nothing') || qLower.includes('never')) {
          const noneOpt = currQ.options?.find(o => o.id === 'none' || o.id.includes('none') || o.id === 'rf_none');
          if (noneOpt) {
            await handleSelectProfileOption(noneOpt, currQ, query, true);
            return;
          }
        }
        if (qLower.includes('blood') || qLower.includes('raktham') || qLower.includes('chora')) {
          const bloodOpt = currQ.options?.find(o => o.id.includes('blood') || o.id.includes('chora'));
          if (bloodOpt) {
            await handleSelectProfileOption(bloodOpt, currQ, query, true);
            return;
          }
        }
        if (qLower.includes('fever') || qLower.includes('pani') || qLower.includes('chard')) {
          const feverOpt = currQ.options?.find(o => o.id.includes('fever') || o.id.includes('pani'));
          if (feverOpt) {
            await handleSelectProfileOption(feverOpt, currQ, query, true);
            return;
          }
        }
        if (qLower.includes('dizz') || qLower.includes('chuttal') || qLower.includes('ksheenam') || qLower.includes('weak')) {
          const dehyOpt = currQ.options?.find(o => o.id.includes('fluids') || o.id.includes('dehydration') || o.id.includes('weak'));
          if (dehyOpt) {
            await handleSelectProfileOption(dehyOpt, currQ, query, true);
            return;
          }
        }

        const numMatch = qLower.match(/\b(\d+)\b/);
        if (numMatch) {
          const n = parseInt(numMatch[1], 10);
          if (n <= 3) {
            const opt = currQ.options?.find(o => o.id === '1_to_3' || o.id.includes('mild') || o.id.includes('1-3') || o.id.includes('occasional'));
            if (opt) { await handleSelectProfileOption(opt, currQ, query, true); return; }
          } else if (n <= 6) {
            const opt = currQ.options?.find(o => o.id === '4_to_6' || o.id.includes('mod') || o.id.includes('4-6') || o.id.includes('constant'));
            if (opt) { await handleSelectProfileOption(opt, currQ, query, true); return; }
          } else {
            const opt = currQ.options?.find(o => o.id === '7_plus' || o.id.includes('severe') || o.id.includes('6') || o.id.includes('pulsatile'));
            if (opt) { await handleSelectProfileOption(opt, currQ, query, true); return; }
          }
        }

        if (currQ.options && currQ.options.length > 0) {
          await handleSelectProfileOption(currQ.options[0], currQ, query, true);
          return;
        }
      }
    }

    // ==========================================
    // 2. SEVERITY
    // ==========================================
    if (stepNow === 'severity') {
      const sevId = matchSeverityQuery(query);

      if (sevId) {
        const opt =
          followUpQuestions?.severity?.options?.find(
            o => o.id === sevId
          ) || {
            id: sevId,
            label: query
          };

        await handleSelectSeverity(opt, query, true); // skipUserMsg=true: processUserInput already added the bubble
        return;
      }

      // ── AI Fallback for severity ──
      setIsTyping(true);
      try {
        const aiRes = await fetch(`${API_BASE_URL}/api/ai/understand-symptoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: query,
            currentStep: 'severity',
            currentContext: {
              bodyArea: triageNow.bodyArea,
              symptomId: triageNow.symptomId,
              symptomName: triageNow.symptomName,
              duration: triageNow.duration,
              severity: triageNow.severity
            }
          })
        });
        const aiData = await aiRes.json();
        const aiSevId = aiData?.extracted?.severityId;
        if (aiSevId) {
          setIsTyping(false);
          const opt = followUpQuestions?.severity?.options?.find(o => o.id === aiSevId)
            || { id: aiSevId, label: aiData?.extracted?.severity || aiSevId };
          await handleSelectSeverity(opt, query, true); // skipUserMsg=true: processUserInput already added the bubble
          return;
        }
      } catch { /* AI unavailable, fall through */ }

      setIsTyping(false);
      addBotMessage(
        `I didn't catch that — is the pain mild, moderate, or severe? You can tap a button below.`,
        {},
        { speakMessage: false }
      );
      return;
    }


    // ==========================================
    // 3. DECISION TREE
    // ==========================================
    if (stepNow === 'tree_node') {
      const qLower = query.toLowerCase();

      // Single select
      if (triageNow.currentNode?.type === 'single_select') {
        const matchedOpt = triageNow.currentNode?.options?.find(
          o =>
            qLower.includes(o.label.toLowerCase()) ||
            (o.id === 'none' && (qLower.includes('no') || qLower.includes('none') || qLower.includes('neither')))
        );

        if (matchedOpt) {
          handleTreeSingleSelect(matchedOpt.id, matchedOpt.label);
          return;
        }
      }

      // Multi-select
      if (triageNow.currentNode?.type === 'multi_select') {
        const matchedIds =
          triageNow.currentNode.options
            ?.filter(option => qLower.includes(option.label.toLowerCase()))
            .map(option => option.id) || [];

        if (matchedIds.length > 0) {
          handleVoiceMultiSelect(matchedIds, source);
          return;
        }
      }
    }

    // ==========================================
    // 4. AI CLINICAL EXTRACTION
    // ==========================================
    setIsAiProcessing(true);
    setIsTyping(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/ai/understand-symptoms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: query,
            currentStep: currentStepRef.current,
            currentContext: {
              bodyArea: triageDataRef.current.bodyArea,
              symptomId: triageDataRef.current.symptomId,
              symptomName: triageDataRef.current.symptomName,
              duration: triageDataRef.current.duration,
              severity: triageDataRef.current.severity,
              treeId: triageDataRef.current.treeId,
              currentNodeId: triageDataRef.current.currentNodeId,
              answersMap: triageDataRef.current.answersMap,
              recentConversation: messagesRef.current
                .slice(-6)
                .map(m => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  text: m.text
                }))
            }
          })
        }
      );

      const data = await res.json();

      console.log('[Talk2Doc] AI response:', data);

      setIsAiProcessing(false);
      setIsTyping(false);

      // ========================================
      // AI SUCCESS
      // ========================================
      if (data.success && data.extracted) {
        const {
          bodyArea,
          symptomId,
          durationId,
          severityId,
          symptomName,
          duration,
          severity,
          extraSymptoms
        } = data.extracted;

        setUnderstoodData(prev => ({
          bodyArea: bodyArea || prev.bodyArea || triageDataRef.current.bodyArea,
          symptomName: symptomName || prev.symptomName || triageDataRef.current.symptomName,
          duration: duration || prev.duration || triageDataRef.current.duration,
          severity: severity || prev.severity || triageDataRef.current.severity,
          extraSymptoms: extraSymptoms?.length ? extraSymptoms : prev.extraSymptoms
        }));

        // One-shot triage if full information is already extracted
        if ((symptomId || triageDataRef.current.symptomId) && durationId && severityId) {
          const handled = await handleOneShotCompleteTriage({
            symptomId: symptomId || triageDataRef.current.symptomId,
            symptomLabel: symptomName || triageDataRef.current.symptomName,
            bodyArea: bodyArea || triageDataRef.current.bodyArea,
            durationId,
            durationLabel: duration || durationId,
            severityId
          }, source);
          if (handled) return;
        }

        // Spoken or text reply — speak EXACTLY ONCE
        if (data.conversationalReply) {
          addBotMessage(data.conversationalReply, {}, { speakMessage: false });
          if (source === 'voice' || voiceModeRef.current) {
            await speakAgent(data.conversationalReply);
          }
        }

        // Decision tree answer
        if (
          data.decisionAnswer?.selectedOptionIds?.length > 0 &&
          currentStepRef.current === 'tree_node'
        ) {
          const selectedIds = data.decisionAnswer.selectedOptionIds;

          if (triageDataRef.current.currentNode?.type === 'multi_select') {
            handleVoiceMultiSelect(selectedIds, source);
          } else {
            const selectedId = selectedIds[0];
            const option = triageDataRef.current.currentNode?.options?.find(o => o.id === selectedId);
            handleTreeSingleSelect(selectedId, option?.label || selectedId);
          }
          return;
        }

        // Symptom + Body Area
        if (symptomId) {
          let targetAreaKey = bodyArea || triageDataRef.current.bodyArea;
          let foundSymptom = null;

          if (targetAreaKey && bodyPartsData?.[targetAreaKey]) {
            foundSymptom = bodyPartsData[targetAreaKey]?.symptoms?.find(s => s.id === symptomId);
          }

          if (!foundSymptom) {
            for (const [aKey, aVal] of Object.entries(bodyPartsData || {})) {
              const s = aVal?.symptoms?.find(sym => sym.id === symptomId);
              if (s) {
                foundSymptom = s;
                targetAreaKey = aKey;
                break;
              }
            }
          }

          if (!foundSymptom) {
            targetAreaKey = targetAreaKey || 'general';
            foundSymptom = {
              id: symptomId,
              label: symptomName || symptomId
            };
          }

          if (foundSymptom) {
            updateTriageData(prev => ({
              ...prev,
              bodyArea: targetAreaKey,
              symptomId: foundSymptom.id,
              symptomName: foundSymptom.label,
              duration: duration || durationId || prev.duration,
              severity: severity || severityId || prev.severity
            }));

            if (onBodyPartSelect && targetAreaKey) {
              selectingAreaRef.current = true;
              onBodyPartSelect(targetAreaKey);
              setTimeout(() => {
                selectingAreaRef.current = false;
              }, 800);
            }

            // Decision tree
            if (foundSymptom.hasDecisionTree && foundSymptom.decisionTreeId) {
              const tree = decisionTrees?.[foundSymptom.decisionTreeId];
              if (tree) {
                const startNodeId = tree.startNode;
                const startNode = tree.nodes[startNodeId];
                updateTriageData(prev => ({
                  ...prev,
                  treeId: foundSymptom.decisionTreeId,
                  currentNodeId: startNodeId,
                  currentNode: startNode,
                  answersMap: {},
                  pendingMultiSelect: []
                }));
                // Only ask tree question if conversationalReply was not already given
                if (!data.conversationalReply) {
                  addBotMessage(startNode.question, {}, { speakMessage: false });
                  if (source === 'voice' || voiceModeRef.current) {
                    await speakAgent(startNode.question);
                  }
                }
                updateCurrentStep('tree_node');
                return;
              }
            }

            // Clinical profile check if no decision tree
            const resolvedProf = resolveFollowUpProfile(foundSymptom.id, foundSymptom.label);
            if (resolvedProf?.profile?.requiresDuration === false && resolvedProf.profile.questions?.length > 0) {
              updateTriageData(prev => ({
                ...prev,
                profileId: resolvedProf.profileId,
                profileQuestionIndex: 0,
                profileAnswers: {}
              }));
              if (!data.conversationalReply) {
                askProfileQuestion(resolvedProf.profile, 0);
              } else {
                updateCurrentStep('profile_question');
              }
              return;
            }

            // No decision tree
            if (durationId) {
              const durationOpt = followUpQuestions?.duration?.options?.find(o => o.id === durationId) || { id: durationId, label: duration || durationId };
              if (!data.conversationalReply) {
                await handleSelectDuration(durationOpt, null, true);
                return;
              } else {
                updateTriageData(prev => ({ ...prev, duration: durationOpt.label }));
                const resolved = resolveFollowUpProfile(foundSymptom.id, foundSymptom.label);
                if (resolved?.profile?.questions?.length > 0) {
                  updateTriageData(prev => ({
                    ...prev,
                    profileId: resolved.profileId,
                    profileQuestionIndex: 0,
                    profileAnswers: {}
                  }));
                  updateCurrentStep('profile_question');
                  return;
                }
                if (resolved?.profile && resolved.profile.requiresSeverity === false) {
                  await handleSelectSeverity({ id: 'N/A', label: 'Not applicable' }, null, true);
                  return;
                }
                updateCurrentStep('severity');
                return;
              }
            }

            // Only ask duration question if conversationalReply was not already provided!
            if (!data.conversationalReply) {
              const durationQuestion =
                followUpQuestions?.duration?.question ||
                'How long have you been experiencing this problem?';

              addBotMessage(durationQuestion, {}, { speakMessage: false });
              if (source === 'voice' || voiceModeRef.current) {
                await speakAgent(durationQuestion);
              }
            }
            updateCurrentStep('duration');
            return;
          }
        }

        // Duration answer when currently in duration step or indicated by AI
        if ((currentStepRef.current === 'duration' || data.nextStep === 'severity') && durationId) {
          const opt = followUpQuestions?.duration?.options?.find(o => o.id === durationId) || { id: durationId, label: duration || durationId };
          await handleSelectDuration(opt, null, true);
          return;
        }

        // Severity answer when currently in severity step or indicated by AI
        if ((currentStepRef.current === 'severity' || data.nextStep === 'result') && severityId) {
          const opt = followUpQuestions?.severity?.options?.find(o => o.id === severityId) || { id: severityId, label: severity || severityId };
          await handleSelectSeverity(opt, null, true);
          return;
        }

        // Body area only
        if (bodyArea && (currentStepRef.current === 'body_area' || !triageDataRef.current.bodyArea)) {
          // Silently set body area and advance step to 'symptom' without posting system chat messages
          selectingAreaRef.current = true;
          updateTriageData(prev => ({ ...prev, bodyArea }));
          updateCurrentStep('symptom');
          if (onBodyPartSelect) {
            onBodyPartSelect(bodyArea);
          }
          setTimeout(() => {
            selectingAreaRef.current = false;
          }, 800);
          return;
        }
      }
    } catch (err) {
      console.warn('[Talk2Doc] AI understand failed:', err);
      setIsAiProcessing(false);
      setIsTyping(false);
    }

    // ==========================================
    // 5. LOCAL FALLBACK
    // ==========================================

    const match =
      matchFreeTextQuery(query);

    if (
      match.matchedType ===
      'general'
    ) {

      handleDirectGeneralMedicine();

      return;
    }

    if (
      match.matchedType ===
      'symptom'
    ) {

      const area =
        bodyPartsData?.[
        match.bodyArea
        ];

      const foundSymptom =
        area?.symptoms?.find(
          s =>
            s.id ===
            match.symptomId
        );

      const symptomLabel =
        foundSymptom?.label ||
        match.symptomId;

      const areaName =
        area?.displayName ||
        match.bodyArea;

      setTriageData(prev => ({
        ...prev,

        bodyArea:
          match.bodyArea,

        symptomId:
          match.symptomId,

        symptomName:
          symptomLabel
      }));

      if (onBodyPartSelect) {
        onBodyPartSelect(
          match.bodyArea
        );
      }

      const reply =
        `Understood: Detected "${symptomLabel}" in ${areaName}.`;

      addBotMessage(
        reply,
        {},
        {
          speakMessage: false  // Voice mode uses explicit speakAgent() below
        }
      );

      if (
        source === 'voice'
      ) {
        await speakAgent(reply);
      }

      if (
        foundSymptom?.hasDecisionTree &&
        foundSymptom?.decisionTreeId
      ) {

        const tree =
          decisionTrees?.[
          foundSymptom
            .decisionTreeId
          ];

        if (tree) {

          const startNodeId =
            tree.startNode;

          const startNode =
            tree.nodes[startNodeId];

          setTriageData(prev => ({
            ...prev,

            treeId:
              foundSymptom
                .decisionTreeId,

            currentNodeId:
              startNodeId,

            currentNode:
              startNode,

            answersMap: {},

            pendingMultiSelect: []
          }));

          addBotMessage(
            startNode.question,
            {},
            {
              speakMessage: false  // Voice mode uses explicit speakAgent() below
            }
          );

          if (
            source === 'voice'
          ) {
            await speakAgent(
              startNode.question
            );
          }

          updateCurrentStep('tree_node');

          return;
        }
      }

      const durationQuestion =
        followUpQuestions
          ?.duration
          ?.question ||
        'How long have you been experiencing this problem?';

      addBotMessage(
        durationQuestion,
        {},
        {
          speakMessage: false  // Voice mode uses explicit speakAgent() below
        }
      );

      if (
        source === 'voice'
      ) {
        await speakAgent(
          durationQuestion
        );
      }

      updateCurrentStep('duration');

      return;
    }

    if (
      match.matchedType ===
      'body_area'
    ) {
      selectingAreaRef.current = true;
      updateTriageData(prev => ({ ...prev, bodyArea: match.bodyArea }));
      updateCurrentStep('symptom');
      if (onBodyPartSelect) {
        onBodyPartSelect(match.bodyArea);
      }
      setTimeout(() => {
        selectingAreaRef.current = false;
      }, 800);

      const lang = convLangRef.current;
      const displayName = bodyPartsData?.[match.bodyArea]?.displayName || match.bodyArea;
      let askMsg;
      if (lang === 'manglish') {
        askMsg = `Manasilayi. ${displayName} sambandhichu enthanu budhimuttu ennu parayamo?`;
      } else if (lang === 'malayalam_script') {
        askMsg = `മനസ്സിലായി. ${displayName} ഭാഗത്ത് എന്താണ് ബുദ്ധിമുട്ട് എന്ന് പറയാമോ?`;
      } else {
        askMsg = `Understood. What specific trouble or symptom are you experiencing with your ${displayName}?`;
      }
      addBotMessage(askMsg);

      return;
    }

    // ==========================================
    // 6. NOTHING UNDERSTOOD
    // ==========================================

    const clarification =
      `I couldn't quite understand that. Please tell me what symptom you're experiencing.`;

    addBotMessage(
      clarification,
      {},
      {
        speakMessage: false  // Voice mode uses explicit speakAgent() below
      }
    );

    if (
      source === 'voice'
    ) {
      await speakAgent(
        clarification
      );

      if (
        voiceModeRef.current
      ) {

      }
    }
  };


  const handleTextSubmit = async (e) => {
    e.preventDefault();

    if (
      !inputText.trim() ||
      isTyping ||
      isAiProcessing ||
      currentStep === 'result' ||
      currentStepRef.current === 'result'
    ) {
      return;
    }

    const query = inputText.trim();

    setInputText('');

    await processUserInput(query, {
      source: 'manual'
    });
  };



  // Derived state for chip rendering
  const activeSymptoms = triageData.bodyArea ? bodyPartsData?.[triageData.bodyArea]?.symptoms || [] : [];
  const bodyAreaChips = [
    ...Object.entries(bodyPartsData || {}).map(([key, val]) => ({ id: key, label: val.displayName || key })),
    { id: 'general', label: 'Unsure / General (General Medicine)' }
  ];
  const currentNodeOptions = triageData.currentNode?.options || [];
  const currentNodeType = triageData.currentNode?.type;

  return (
    <div className="chatbox-card">
      <div className="chatbox-header">
        <div className="chatbox-header-title">
          <div className="bot-avatar-badge">
            <Bot size={20} />
          </div>

          <div>
            <h3>
              {interactionMode === 'voice'
                ? 'Talk2Doc Voice'
                : 'talk2doc Assistant'}
            </h3>

            <span className="online-indicator">
              <span className="online-dot"></span>

              {interactionMode === 'voice'
                ? voiceStatus === 'listening'
                  ? "I'm listening..."
                  : voiceStatus === 'thinking'
                    ? 'Understanding you...'
                    : voiceStatus === 'speaking'
                      ? 'Talk2Doc is speaking...'
                      : 'Ready when you are'
                : 'Ready for consultation triage'}
            </span>
          </div>
        </div>

        <div className="chatbox-header-actions">
          {interactionMode === 'manual' && (
            <button
              type="button"
              className={`avatar-toggle-pill ${showAvatars ? 'active' : ''}`}
              onClick={() => setShowAvatars(prev => !prev)}
              title={showAvatars ? 'Hide message avatars' : 'Show message avatars'}
            >
              <User size={13} />
              <span>{showAvatars ? 'Avatars On' : 'Avatars Off'}</span>
            </button>
          )}

          {interactionMode === 'voice' && (
            <div className="voice-header-btn-group">
              <button
                type="button"
                className="voice-settings-btn"
                onClick={() => setShowVoiceSettings(true)}
                title="Change AI Voice Type & Speed"
              >
                <Settings size={13} />
                <span>Voice Settings</span>
              </button>
              <button
                type="button"
                className="voice-exit-btn"
                onClick={exitVoiceMode}
                title="Exit voice consultation"
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="interaction-switch">
        <button
          type="button"
          className={`interaction-option ${interactionMode === 'manual' ? 'active' : ''
            }`}
          onClick={() => {
            if (interactionMode === 'voice') {
              exitVoiceMode();
            } else {
              setInteractionMode('manual');
            }
          }}        >
          <div className="interaction-icon">✍️</div>

          <div>
            <strong>Type & Select</strong>
            <span>Text, body map and options</span>
          </div>
        </button>

        <button
          type="button"
          className={`interaction-option ${interactionMode === 'voice' ? 'active' : ''
            }`}
          onClick={switchToVoiceMode}
        >
          <div className="interaction-icon">🎙️</div>

          <div>
            <strong>Talk2Doc Voice</strong>
            <span>Hands-free consultation</span>
          </div>
        </button>
      </div>

      {interactionMode === 'manual' && (
        <>
          <div className="chatbox-messages" ref={messagesBoxRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                {showAvatars && (
                  <div className="message-avatar">
                    {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                )}
                <div className="message-content">
                  <p>{msg.text}</p>
                  {msg.isResultCard && (
                    <>
                      <DepartmentResult recommendation={msg.recommendation} onReset={initChat} lang={msg.lang || convLangRef.current} />
                      {showDoctorsInChat && (
                        <InChatDoctorList
                          doctors={inChatDoctors}
                          selectedDoctor={selectedDoctor}
                          onSelectDoctor={handleSelectDoctor}
                          onChangeDoctor={handleChangeDoctor}
                          radius={doctorRadius}
                          onChangeRadius={handleChangeRadius}
                          insurance={doctorInsurance}
                          onChangeInsurance={handleChangeInsurance}
                          availableInsurances={availableInsurances}
                          loading={loadingDoctors}
                          isFallback={isFallbackDoctors}
                          fallbackMessage={fallbackDoctorMessage}
                          showInlineBooking={showInlineBooking}
                          onToggleBooking={() => setShowInlineBooking(prev => !prev)}
                          assessmentId={savedAssessmentId}
                          onMoveToUI={() => {
                            setShowDoctorsInChat(false);
                            if (onShowDoctorsInUI) onShowDoctorsInUI(true);
                            addBotMessage('Doctor list moved to the panel below the chat. Scroll down to view all nearby doctors. Type "show in chat" to bring it back here.');
                          }}
                        />
                      )}
                      {!showDoctorsInChat && (
                        <div className="chatbox-ui-mode-notice">
                          📋 Doctor list moved to the panel below the chat. Type <strong>"show in chat"</strong> to bring it back.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot typing">
                {showAvatars && (
                  <div className="message-avatar"><Bot size={16} /></div>
                )}
                <div className="typing-bubble">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
          </div>

          {/* Options Tray */}
          <div className="chatbox-chips-tray">
            {currentStep === 'body_area' && (
              <div className="step-prompt">
                <span className="step-label">Select Area or Click Body Map:</span>
                <QuickChips options={bodyAreaChips} onSelect={(opt) => handleSelectBodyArea(opt.id)} />
              </div>
            )}

            {currentStep === 'symptom' && (
              <div className="step-prompt">
                <span className="step-label">Select Symptom in {bodyPartsData?.[triageData.bodyArea]?.displayName}:</span>
                <QuickChips options={activeSymptoms} onSelect={handleSelectSymptom} />
              </div>
            )}

            {/* Decision Tree Node */}
            {currentStep === 'tree_node' && currentNodeType === 'single_select' && (
              <div className="step-prompt">
                <span className="step-label">Select one:</span>
                <QuickChips
                  options={currentNodeOptions}
                  onSelect={(opt) => handleTreeSingleSelect(opt.id, opt.label)}
                />
              </div>
            )}

            {currentStep === 'tree_node' && currentNodeType === 'multi_select' && (
              <div className="step-prompt">
                <span className="step-label">Select all that apply, then confirm:</span>
                <div className="multi-select-chips">
                  {currentNodeOptions.map(opt => {
                    const isSelected = triageData.pendingMultiSelect.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        className={`chip multi-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleMultiSelectOption(opt.id)}
                      >
                        <span className="chip-check">
                          {isSelected ? <Check size={12} strokeWidth={3} /> : null}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="confirm-multi-btn"
                  onClick={confirmMultiSelect}
                  disabled={triageData.pendingMultiSelect.length === 0}
                >
                  <span>Confirm Selection</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}

            {currentStep === 'duration' && (
              <div className="step-prompt">
                <span className="step-label">Select Duration:</span>
                <QuickChips options={followUpQuestions?.duration?.options || []} onSelect={handleSelectDuration} />
              </div>
            )}

            {currentStep === 'profile_question' && (() => {
              const profile = followUpProfiles?.[triageData.profileId];
              const currQ = profile?.questions?.[triageData.profileQuestionIndex || 0];
              if (!currQ) return null;
              const lang = convLangRef.current;
              const options = (currQ.options || []).map(opt => ({
                id: opt.id,
                label: (lang === 'manglish' && opt.manglish) ? opt.manglish : (lang === 'malayalam_script' && opt.malayalam) ? opt.malayalam : opt.label,
                rawOpt: opt
              }));
              return (
                <div className="step-prompt">
                  <span className="step-label">Select Option:</span>
                  <QuickChips
                    options={options}
                    onSelect={(opt) => handleSelectProfileOption(opt.rawOpt || opt, currQ)}
                  />
                </div>
              );
            })()}

            {currentStep === 'severity' && (
              <div className="step-prompt">
                <span className="step-label">Select Severity:</span>
                <QuickChips options={followUpQuestions?.severity?.options || []} onSelect={handleSelectSeverity} />
              </div>
            )}

            {currentStep === 'doctor_selection' && (
              <div className="step-prompt">
                <span className="step-label">📍 Distance:</span>
                <div className="chatbox-radius-chips">
                  {[5, 10, 15, 25, 50].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`chatbox-radius-chip ${doctorRadius === r ? 'active' : ''}`}
                      onClick={() => handleChangeRadius(r)}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'doctor_selected' && (
              <div className="chatbox-selected-prompt-actions">
                <button
                  type="button"
                  className={`chatbox-action-pill book ${showInlineBooking ? 'active' : ''}`}
                  onClick={() => {
                    setShowInlineBooking(prev => {
                      const next = !prev;
                      if (next) scrollToSelectedDoctor();
                      return next;
                    });
                  }}
                >
                  <LuCalendar size={15} />
                  <span>{showInlineBooking ? 'Close Booking' : 'Book Appointment'}</span>
                </button>
                <button
                  type="button"
                  className="chatbox-action-pill change"
                  onClick={handleChangeDoctor}
                >
                  <LuRotateCcw size={15} />
                  <span>Change Doctor</span>
                </button>
                <button
                  type="button"
                  className="chatbox-action-pill reset"
                  onClick={initChat}
                >
                  <LuRefreshCw size={15} />
                  <span>Start Over</span>
                </button>
              </div>
            )}
          </div>

          {isListening && (
            <div className="chatbox-listening-banner">
              <span>🔴 Listening... Speak naturally (e.g. "I have a severe headache since yesterday")</span>
            </div>
          )}
          {speechError && (
            <div style={{ background: '#fffbeb', color: '#b45309', padding: '6px 14px', fontSize: '0.76rem', borderTop: '1px solid #fde68a' }}>
              <span>⚠️ {speechError}</span>
            </div>
          )}
          <form className={`chatbox-input-form ${currentStep === 'result' ? 'disabled-completed' : ''}`} onSubmit={handleTextSubmit}>
            <input
              type="text"
              placeholder={
                currentStep === 'doctor_selection'
                  ? 'Type doctor name, "select 1", "radius 20km", "insurance Star Health"...'
                  : currentStep === 'doctor_selected'
                    ? 'Type "book appointment", "change doctor", or "radius 15km"...'
                    : currentStep === 'result'
                      ? (convLangRef.current === 'malayalam' || convLangRef.current === 'malayalam_script'
                          ? "കൺസൾട്ടേഷൻ പൂർത്തിയായി. വീണ്ടും തുടങ്ങാൻ 'Start Over' ക്ലിക്ക് ചെയ്യുക."
                          : convLangRef.current === 'manglish'
                            ? "Consultation kazhinju. Vere chothikkan 'Start Over' click cheyyuka."
                            : "Consultation complete. Click 'Start Over' to assess another symptom.")
                      : isListening
                        ? 'Listening to speech... Speak now'
                        : currentStep === 'body_area'
                          ? 'Type or speak: "severe headache since yesterday", "fever"...'
                          : 'Type, speak, or click an option above...'
              }
              value={currentStep === 'result' ? '' : inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTyping || isAiProcessing || currentStep === 'result'}
            />

            <button type="submit" disabled={!inputText.trim() || isTyping || isAiProcessing || currentStep === 'result'} title={currentStep === 'result' ? "Consultation complete" : "Send message"}>
              {isAiProcessing ? <Loader2 size={16} className="duo-spin" /> : <Send size={16} />}
            </button>
          </form>
        </>
      )}
      {interactionMode === 'voice' && (
        <div className="voice-agent">
          <div className="voice-agent-main">

            {/* ═══ GLOWING WIREFRAME SPHERE ═══ */}
            <div
              className={`voice-agent-orb ${voiceStatus}`}
              onClick={() => {
                if (isListening) {
                  try { recognitionRef.current?.stop(); } catch { }
                  setIsListening(false);
                  isRecognizingRef.current = false;
                  setVoiceStatus('idle');
                } else {
                  window.speechSynthesis?.cancel();
                  setVoiceStatus('listening');
                  startAgentListening();
                }
              }}
              title={isListening ? 'Tap to pause listening' : 'Tap to speak'}
            >
              <div className="voice-agent-ring ring-one"></div>
              <div className="voice-agent-ring ring-two"></div>
              <div className="sphere-ring r-eq"></div>
              <div className="sphere-ring r-m30"></div>
              <div className="sphere-ring r-p30"></div>
              <div className="sphere-ring r-vert"></div>
              <div className="voice-agent-core">
                {voiceStatus === 'listening' ? <Mic size={22} /> :
                  voiceStatus === 'speaking' ? <Volume2 size={22} /> :
                    voiceStatus === 'thinking' ? <Loader2 size={20} className="duo-spin" /> :
                      <Bot size={20} />}
              </div>
            </div>

            <p className="voice-agent-status-title">
              {voiceStatus === 'listening' ? "I'm listening..." :
                voiceStatus === 'thinking' ? 'One moment...' :
                  voiceStatus === 'speaking' ? 'Talk2Doc is speaking...' :
                    currentStep === 'doctor_selected' ? 'Doctor Selected!' :
                    currentStep === 'doctor_selection' ? 'Select Your Doctor' :
                    currentStep === 'result' ? 'All done!' : 'Tap the sphere or speak'}
            </p>
            <p className="voice-agent-status-text">
              {voiceTranscript
                ? `"${voiceTranscript}"`
                : voiceStatus === 'listening'
                  ? (currentStep === 'doctor_selection'
                      ? 'Say "select doctor 1", doctor name, or "radius 20km"'
                      : currentStep === 'doctor_selected'
                        ? 'Say "book appointment" or "change doctor"'
                        : 'Speak naturally — I understand simple words too!')
                  : voiceStatus === 'thinking'
                    ? 'Analyzing what you said...'
                    : voiceStatus === 'speaking'
                      ? 'Listen for the next question...'
                      : 'Tap below or say your symptom anytime.'}
            </p>

            {(currentStep === 'result' || currentStep === 'doctor_selection' || currentStep === 'doctor_selected') && recommendation ? (
              <div className="voice-result-container" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <DepartmentResult recommendation={recommendation} onReset={initChat} lang={convLangRef.current} />
                <InChatDoctorList
                  doctors={inChatDoctors}
                  selectedDoctor={selectedDoctor}
                  onSelectDoctor={handleSelectDoctor}
                  onChangeDoctor={handleChangeDoctor}
                  radius={doctorRadius}
                  onChangeRadius={handleChangeRadius}
                  insurance={doctorInsurance}
                  onChangeInsurance={handleChangeInsurance}
                  availableInsurances={availableInsurances}
                  loading={loadingDoctors}
                  isFallback={isFallbackDoctors}
                  fallbackMessage={fallbackDoctorMessage}
                  showInlineBooking={showInlineBooking}
                  onToggleBooking={() => setShowInlineBooking(prev => !prev)}
                  assessmentId={savedAssessmentId}
                />
              </div>
            ) : (
              <div className="voice-options-panel">
                {currentStep === 'body_area' && (
                  <>
                    <p className="voice-options-label">Where does it hurt?</p>
                    <div className="voice-option-chips">
                      {bodyAreaChips.map((opt, idx) => (
                        <button key={`${opt.id}-${idx}`} type="button"
                          className="voice-option-chip"
                          onClick={() => handleSelectBodyArea(opt.id)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {currentStep === 'symptom' && (
                  <>
                    <p className="voice-options-label">What kind of problem in {bodyPartsData?.[triageData.bodyArea]?.displayName}?</p>
                    <div className="voice-option-chips">
                      {activeSymptoms.map(symp => (
                        <button key={symp.id} type="button"
                          className="voice-option-chip"
                          onClick={() => handleSelectSymptom(symp)}>
                          {symp.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {currentStep === 'tree_node' && currentNodeType === 'single_select' && (
                  <>
                    <p className="voice-options-label">Choose one:</p>
                    <div className="voice-option-chips">
                      {currentNodeOptions.map(opt => (
                        <button key={opt.id} type="button"
                          className="voice-option-chip"
                          onClick={() => handleTreeSingleSelect(opt.id, opt.label)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {currentStep === 'tree_node' && currentNodeType === 'multi_select' && (
                  <>
                    <p className="voice-options-label">Select all that apply:</p>
                    <div className="voice-option-chips">
                      {currentNodeOptions.map(opt => {
                        const isSel = triageData.pendingMultiSelect.includes(opt.id);
                        return (
                          <button key={opt.id} type="button"
                            className={`voice-option-chip ${isSel ? 'selected' : ''}`}
                            onClick={() => toggleMultiSelectOption(opt.id)}>
                            {isSel && <Check size={12} />} {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" className="voice-confirm-chip"
                      onClick={confirmMultiSelect}
                      disabled={triageData.pendingMultiSelect.length === 0}>
                      <Check size={15} /> Confirm
                    </button>
                  </>
                )}
                {currentStep === 'duration' && (
                  <>
                    <p className="voice-options-label">How long has this been going on?</p>
                    <div className="voice-option-chips">
                      {(followUpQuestions?.duration?.options || []).map(opt => (
                        <button key={opt.id} type="button"
                          className="voice-option-chip"
                          onClick={() => handleSelectDuration(opt)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {currentStep === 'profile_question' && (() => {
                  const profile = followUpProfiles?.[triageData.profileId];
                  const currQ = profile?.questions?.[triageData.profileQuestionIndex || 0];
                  if (!currQ) return null;
                  const lang = convLangRef.current;
                  return (
                    <>
                      <p className="voice-options-label">{currQ.question}</p>
                      <div className="voice-option-chips">
                        {(currQ.options || []).map(opt => {
                          const lbl = (lang === 'manglish' && opt.manglish) ? opt.manglish : (lang === 'malayalam_script' && opt.malayalam) ? opt.malayalam : opt.label;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              className={`voice-option-chip ${opt.redFlag ? 'severity-severe' : ''}`}
                              onClick={() => handleSelectProfileOption(opt, currQ)}
                            >
                              {lbl}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
                {currentStep === 'severity' && (
                  <>
                    <p className="voice-options-label">How bad does it feel?</p>
                    <div className="voice-option-chips">
                      {(followUpQuestions?.severity?.options || []).map(opt => (
                        <button key={opt.id} type="button"
                          className={`voice-option-chip severity-${opt.id}`}
                          onClick={() => handleSelectSeverity(opt)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="voice-agent-footer">
            <div
              className={`voice-agent-mic ${isListening ? 'active' : ''} ${currentStep === 'result' ? 'disabled' : ''}`}
              onClick={() => {
                if (currentStep === 'result') return;
                if (isListening) {
                  try { recognitionRef.current?.stop(); } catch { }
                  setIsListening(false);
                  isRecognizingRef.current = false;
                  setVoiceStatus('idle');
                } else {
                  window.speechSynthesis?.cancel();
                  setVoiceStatus('listening');
                  startAgentListening();
                }
              }}
              title={currentStep === 'result' ? "Consultation complete - Click Start Over" : (isListening ? "Click to pause listening" : "Click to speak")}
            >
              {isListening ? <Mic size={22} /> : <MicOff size={22} />}
            </div>

            <div className="voice-footer-meta">
              <span>
                {currentStep === 'result'
                  ? (convLangRef.current === 'malayalam' || convLangRef.current === 'malayalam_script'
                      ? 'കൺസൾട്ടേഷൻ പൂർത്തിയായി • പുതിയ വിലയിരുത്തലിനായി Start Over അമർത്തുക'
                      : convLangRef.current === 'manglish'
                        ? 'Consultation kazhinju • Start Over click cheyyuka'
                        : 'Consultation complete • Tap Start Over to assess another symptom')
                  : isListening
                    ? 'Listening automatically... Speak naturally'
                    : voiceStatus === 'speaking'
                      ? 'Talk2Doc is speaking...'
                      : 'Hands-free AI consultation • Tap mic or speak'}
              </span>
              {speechError && (
                <span className="voice-error-text">⚠️ {speechError}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ VOICE CUSTOMIZATION MODAL ═══ */}
      {showVoiceSettings && (
        <div className="voice-settings-overlay" onClick={() => setShowVoiceSettings(false)}>
          <div className="voice-settings-modal" onClick={e => e.stopPropagation()}>
            <div className="voice-settings-header">
              <div className="voice-settings-title-group">
                <Volume2 size={18} />
                <h4>Voice Settings</h4>
              </div>
              <button
                type="button"
                className="voice-settings-close"
                onClick={() => setShowVoiceSettings(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="voice-settings-body">
              <div className="voice-setting-field">
                <label className="voice-setting-label">AI Voice Accent & Persona</label>
                <select
                  className="voice-setting-select"
                  value={selectedVoiceUri}
                  onChange={(e) => {
                    setSelectedVoiceUri(e.target.value);
                    localStorage.setItem('talk2doc_voice_uri', e.target.value);
                  }}
                >
                  <optgroup label="⭐ Recommended American Accents">
                    <option value="auto_us_female">🇺🇸 American Female (Google US / Jenny - Calm & Soothing)</option>
                    <option value="auto_us_male">🇺🇸 American Male (David / Guy - Clear & Warm)</option>
                  </optgroup>
                  <optgroup label="🌍 Regional Accents">
                    <option value="auto_in_english">🇮🇳 Indian English (Natural)</option>
                  </optgroup>
                  {availableVoices.length > 0 && (
                    <optgroup label="💻 All Installed Browser Voices">
                      {availableVoices.map((v, i) => (
                        <option key={v.voiceURI || `${v.name}-${i}`} value={v.voiceURI || v.name}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div className="voice-setting-field">
                <div className="voice-speed-header">
                  <label className="voice-setting-label">
                    Speaking Speed: <strong>{voiceSpeed.toFixed(2)}x</strong>
                  </label>
                  <span className="voice-speed-hint">
                    {voiceSpeed < 0.85 ? 'Extra Slow & Gentle' : voiceSpeed <= 0.92 ? 'Relaxed Slow (Recommended)' : 'Standard Pace'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.70"
                  max="1.15"
                  step="0.05"
                  value={voiceSpeed}
                  onChange={(e) => {
                    const spd = parseFloat(e.target.value);
                    setVoiceSpeed(spd);
                    localStorage.setItem('talk2doc_voice_speed', spd.toString());
                  }}
                  className="voice-speed-slider"
                />
                <div className="voice-speed-labels">
                  <span>0.70x (Slow)</span>
                  <span className="preset-active">0.88x (Ideal)</span>
                  <span>1.15x (Fast)</span>
                </div>
              </div>

              <div className="voice-preview-box">
                <button
                  type="button"
                  className="voice-test-btn"
                  onClick={() => {
                    speakAgent("Hello! I'm Talk2Doc, your personal medical companion. Take your time, I'm right here with you.");
                  }}
                >
                  <Volume2 size={16} />
                  <span>Test Voice Sample</span>
                </button>
              </div>
            </div>

            <div className="voice-settings-footer">
              <button
                type="button"
                className="voice-save-btn"
                onClick={() => setShowVoiceSettings(false)}
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}