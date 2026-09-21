import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../config';
import { 
  LuSend, 
  LuBot, 
  LuUser, 
  LuRotateCcw, 
  LuCheck, 
  LuArrowRight, 
  LuArrowLeft,
  LuSparkles,
  LuShieldCheck,
  LuHeartHandshake,
  LuMic,
  LuMicOff,
  LuVolume2,
  LuVolumeX,
  LuLoader
} from 'react-icons/lu';
import DepartmentResult from './DepartmentResult';
import { matchFreeTextQuery, matchDurationQuery, matchSeverityQuery } from '../../utils/symptomSynonyms';

const STEP_PROGRESS = {
  body_area: 25,
  symptom_transition: 40,
  symptom: 50,
  tree_node: 75,
  duration: 80,
  severity: 90,
  result: 100
};

const STEP_LABELS = {
  body_area: 'Step 1 of 4 • Discomfort Area',
  symptom: 'Step 2 of 4 • Primary Symptom',
  tree_node: 'Step 3 of 4 • Clinical Assessment',
  duration: 'Step 3 of 4 • Duration',
  severity: 'Step 3 of 4 • Severity',
  result: 'Step 4 of 4 • Department Recommendation'
};

const BODY_PART_ICONS = {
  head_and_neck: '🧠',
  chest: '🫀',
  abdomen: '🩺',
  lower_abdomen: '🚻',
  left_arm: '💪',
  right_arm: '💪',
  left_leg: '🦵',
  right_leg: '🦵',
  skin: '🧴',
  back: '🦴',
  general: '🏥'
};

export default function ChatBox({
  selectedBodyPart,
  onBodyPartSelect,
  bodyPartsData,
  followUpQuestions,
  decisionTrees,
  onRecommendation
}) {
  const [currentStep, setCurrentStep] = useState('body_area');
  const [currentPrompt, setCurrentPrompt] = useState('Where are you experiencing discomfort? Select an area below or tap the interactive body diagram.');
  const [triageData, setTriageData] = useState({
    bodyArea: null,
    symptomId: null,
    symptomName: null,
    duration: null,
    severity: null,
    treeId: null,
    currentNodeId: null,
    currentNode: null,
    answersMap: {},
    pendingMultiSelect: []
  });

  const [historyStack, setHistoryStack] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [recommendation, setRecommendation] = useState(null);

  // Voice Input & Output State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const containerRef = useRef(null);

  // Text-To-Speech (Voice Output)
  const speak = (text) => {
    if (!isSpeechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Remove emojis, markdown stars, brackets
      const cleanText = text
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        .replace(/[*_#`]/g, '')
        .trim();
      if (!cleanText) return;
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
    }
  };

  // Speech-To-Text (Voice Input)
  const startVoiceInput = () => {
    setSpeechError(null);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Voice recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
      setTimeout(() => setSpeechError(null), 4500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser settings.');
          setTimeout(() => setSpeechError(null), 4500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
  };

  useEffect(() => {
    if (onRecommendation) {
      onRecommendation(recommendation);
    }
  }, [recommendation]);

  // Sync with SVG BodyMap selection
  useEffect(() => {
    if (
      selectedBodyPart &&
      currentStep === 'body_area' &&
      selectedBodyPart !== triageData.bodyArea
    ) {
      handleSelectBodyArea(selectedBodyPart);
    }
  }, [selectedBodyPart]);

  const pushHistory = (stateSnapshot) => {
    setHistoryStack(prev => [...prev, stateSnapshot]);
  };

  const handleGoBack = () => {
    if (historyStack.length === 0 || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      const prevSnapshot = historyStack[historyStack.length - 1];
      setHistoryStack(prev => prev.slice(0, -1));
      setCurrentStep(prevSnapshot.currentStep);
      setCurrentPrompt(prevSnapshot.currentPrompt);
      setTriageData(prevSnapshot.triageData);
      setSelectedOptionId(null);
      if (prevSnapshot.currentStep !== 'result') {
        setRecommendation(null);
      }
      setIsTransitioning(false);
      speak(prevSnapshot.currentPrompt);
    }, 200);
  };

  const initChat = () => {
    if (isListening) stopVoiceInput();
    window.speechSynthesis?.cancel();
    setIsTransitioning(true);
    setTimeout(() => {
      const initialPrompt = 'Where are you experiencing discomfort? Select an area below or tap the interactive body diagram.';
      setCurrentStep('body_area');
      setCurrentPrompt(initialPrompt);
      setTriageData({
        bodyArea: null, symptomId: null, symptomName: null,
        duration: null, severity: null,
        treeId: null, currentNodeId: null, currentNode: null,
        answersMap: {}, pendingMultiSelect: []
      });
      setHistoryStack([]);
      setSelectedOptionId(null);
      setRecommendation(null);
      setIsTransitioning(false);
      speak(initialPrompt);
    }, 200);
  };

  const transitionTo = (nextStep, nextPrompt, nextDataUpdate = {}) => {
    speak(nextPrompt);
    setIsTransitioning(true);
    setTimeout(() => {
      pushHistory({
        currentStep,
        currentPrompt,
        triageData: { ...triageData }
      });
      setCurrentStep(nextStep);
      setCurrentPrompt(nextPrompt);
      setTriageData(prev => ({ ...prev, ...nextDataUpdate }));
      setSelectedOptionId(null);
      setIsTransitioning(false);
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 220);
  };

  // Direct 1-tap route to General Medicine
  const handleDirectGeneralMedicine = () => {
    setSelectedOptionId('general');
    const rec = {
      department: 'General Medicine',
      altDepartment: 'Primary Care / Internal Medicine',
      bodyAreaName: 'General / Multi-System',
      symptomName: 'General Clinical Evaluation',
      urgency: 'ROUTINE',
      duration: 'Not specified',
      severity: 'moderate',
      reason: 'When symptoms are non-localized or multi-systemic, a General Medicine physician performs a thorough physical evaluation, routine diagnostics, and coordinates specialty triage.',
      advice: 'Schedule an appointment with a primary care doctor or internist for comprehensive assessment.'
    };
    setRecommendation(rec);
    transitionTo('result', 'Based on your selection, here is your recommended clinical specialty:', {
      bodyArea: 'general',
      symptomName: 'General Symptoms'
    });
  };

  // Area Selection
  const handleSelectBodyArea = (partId) => {
    if (partId === 'general') {
      handleDirectGeneralMedicine();
      return;
    }
    setSelectedOptionId(partId);
    const area = bodyPartsData?.[partId];
    const displayName = area?.displayName || partId.replaceAll('_', ' ');
    if (onBodyPartSelect) onBodyPartSelect(partId);

    transitionTo(
      'symptom',
      `What specific symptom are you experiencing in your ${displayName}?`,
      { bodyArea: partId }
    );
  };

  // Symptom Selection
  const handleSelectSymptom = (symptom) => {
    setSelectedOptionId(symptom.id);
    const sId = symptom.id;
    const sLabel = symptom.label || sId;
    const hasTree = Boolean(symptom.hasDecisionTree && symptom.decisionTreeId && decisionTrees?.[symptom.decisionTreeId]);

    if (hasTree) {
      const tree = decisionTrees[symptom.decisionTreeId];
      const startNode = tree?.nodes?.[tree.startNode];
      if (startNode) {
        transitionTo('tree_node', startNode.question, {
          symptomId: sId,
          symptomName: sLabel,
          treeId: symptom.decisionTreeId,
          currentNodeId: tree.startNode,
          currentNode: startNode,
          answersMap: {},
          pendingMultiSelect: []
        });
        return;
      }
    }

    // Default duration question
    transitionTo(
      'duration',
      followUpQuestions?.duration?.question || 'How long have you been experiencing this discomfort?',
      { symptomId: sId, symptomName: sLabel }
    );
  };

  // Decision tree step
  const advanceTree = (newAnswersMap, answeredNodeId, newTriage) => {
    const tree = decisionTrees?.[newTriage.treeId];
    if (!tree) return;

    const node = tree.nodes[answeredNodeId];
    const logic = node?.logic || {};
    let next = null;

    if (node?.type === 'multi_select') {
      const selected = (newAnswersMap[answeredNodeId] || []).filter(a => a !== 'none');
      if (selected.length > 0 && logic.if_any_except_none) next = logic.if_any_except_none;
      else if (selected.length === 0 && logic.if_none_or_only_none) next = logic.if_none_or_only_none;
      else if (logic.if_2_or_more_except_none && selected.length >= 2) next = logic.if_2_or_more_except_none;
      else if (logic.if_less_than_2_or_only_none && selected.length < 2) next = logic.if_less_than_2_or_only_none;
    } else if (node?.type === 'single_select') {
      const answer = newAnswersMap[answeredNodeId];
      next = logic[answer] || null;
    }

    if (!next || tree.outcomes?.[next]) {
      submitTriage(newTriage.bodyArea, newTriage.symptomId, newTriage.treeId, newAnswersMap);
      return;
    }

    const nextNode = tree.nodes[next];
    if (!nextNode) {
      submitTriage(newTriage.bodyArea, newTriage.symptomId, newTriage.treeId, newAnswersMap);
      return;
    }

    transitionTo('tree_node', nextNode.question, {
      currentNodeId: next,
      currentNode: nextNode,
      answersMap: newAnswersMap,
      pendingMultiSelect: []
    });
  };

  const handleTreeSingleSelect = (optionId, optionLabel) => {
    setSelectedOptionId(optionId);
    const { treeId, currentNodeId, answersMap, bodyArea, symptomId } = triageData;
    const newAnswersMap = { ...answersMap, [currentNodeId]: optionId };
    advanceTree(newAnswersMap, currentNodeId, { treeId, bodyArea, symptomId });
  };

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

  const confirmMultiSelect = () => {
    const { treeId, currentNodeId, answersMap, pendingMultiSelect, bodyArea, symptomId } = triageData;
    if (pendingMultiSelect.length === 0) return;

    const newAnswersMap = { ...answersMap, [currentNodeId]: pendingMultiSelect };
    advanceTree(newAnswersMap, currentNodeId, { treeId, bodyArea, symptomId });
  };

  const handleSelectDuration = (opt) => {
    setSelectedOptionId(opt.id);
    transitionTo(
      'severity',
      followUpQuestions?.severity?.question || 'How severe is your discomfort?',
      { duration: opt.label }
    );
  };

  const handleSelectSeverity = async (opt) => {
    setSelectedOptionId(opt.id);
    const updated = { ...triageData, severity: opt.id };
    submitStandardRecommendation(updated.bodyArea, updated.symptomId, updated.duration, opt.id);
  };

  // Submit triage via decision tree
  const submitTriage = async (bodyArea, symptomId, treeId, answersMap) => {
    setIsTransitioning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyArea, symptomId, treeId, answersMap })
      });
      const data = await res.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
        transitionTo('result', 'Here is your clinical department recommendation based on your symptoms:');
      } else {
        throw new Error('Fallback needed');
      }
    } catch {
      handleDirectGeneralMedicine();
    }
  };

  // Submit triage via direct recommend endpoint
  const submitStandardRecommendation = async (bodyArea, symptomId, duration, severity) => {
    setIsTransitioning(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyArea, symptomId, duration, severity })
      });
      const data = await res.json();
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
        transitionTo('result', 'Here is your clinical department recommendation based on your symptoms:');
      } else {
        handleDirectGeneralMedicine();
      }
    } catch {
      handleDirectGeneralMedicine();
    }
  };

  // Free text & voice query submit with AI clinical understanding
  const handleTextSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputText.trim() || isTransitioning || isAiProcessing) return;
    const query = inputText.trim();
    setInputText('');
    if (isListening) stopVoiceInput();

    // 1. Direct short-circuit checks for duration/severity if currently in those steps
    if (currentStep === 'duration') {
      const durId = matchDurationQuery(query);
      if (durId) {
        const opt = followUpQuestions?.duration?.options?.find(o => o.id === durId) || { id: durId, label: query };
        handleSelectDuration(opt);
        return;
      }
    }

    if (currentStep === 'severity') {
      const sevId = matchSeverityQuery(query);
      if (sevId) {
        const opt = followUpQuestions?.severity?.options?.find(o => o.id === sevId) || { id: sevId, label: query };
        handleSelectSeverity(opt);
        return;
      }
    }

    // 2. Call AI Natural Language Understanding endpoint
    setIsAiProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/understand-symptoms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          currentStep,
          currentContext: {
            bodyArea: triageData.bodyArea,
            symptomId: triageData.symptomId,
            symptomName: triageData.symptomName,
            duration: triageData.duration,
            severity: triageData.severity,
            treeId: triageData.treeId,
            currentNodeId: triageData.currentNodeId,
            answersMap: triageData.answersMap,
            recentConversation: []
          }
        })
      });

      const data = await res.json();
      setIsAiProcessing(false);

      if (data.success && data.extracted) {
        const { bodyArea, symptomId, durationId, severityId } = data.extracted;

        if (data.conversationalReply) {
          speak(data.conversationalReply);
        }

        // Check if user answered a clinical decision tree question
        if (data.decisionAnswer?.selectedOptionIds?.length > 0 && currentStep === 'tree_node') {
          const selectedId = data.decisionAnswer.selectedOptionIds[0];
          handleTreeSingleSelect(selectedId);
          return;
        }

        // Duration step match
        if (currentStep === 'duration' && durationId) {
          const opt = followUpQuestions?.duration?.options?.find(o => o.id === durationId) || { id: durationId, label: durationId };
          handleSelectDuration(opt);
          return;
        }

        // Severity step match
        if (currentStep === 'severity' && severityId) {
          const opt = followUpQuestions?.severity?.options?.find(o => o.id === severityId) || { id: severityId, label: severityId };
          handleSelectSeverity(opt);
          return;
        }

        // Primary symptom extraction
        if (symptomId && bodyArea) {
          const area = bodyPartsData?.[bodyArea];
          const found = area?.symptoms?.find(s => s.id === symptomId);
          if (found) {
            setTriageData(prev => ({
              ...prev,
              bodyArea,
              duration: durationId ? (followUpQuestions?.duration?.options?.find(o => o.id === durationId)?.label || durationId) : prev.duration,
              severity: severityId || prev.severity
            }));
            handleSelectSymptom(found);
            return;
          }
        }

        // Body area match only
        if (bodyArea && currentStep === 'body_area') {
          handleSelectBodyArea(bodyArea);
          return;
        }
      }
    } catch (err) {
      console.warn('AI understand request error, using local matcher:', err);
      setIsAiProcessing(false);
    }

    // Fallback to local matchFreeTextQuery
    const match = matchFreeTextQuery(query);
    if (match.matchedType === 'general') {
      handleDirectGeneralMedicine();
      return;
    }

    if (match.matchedType === 'symptom') {
      const area = bodyPartsData?.[match.bodyArea];
      const found = area?.symptoms?.find(s => s.id === match.symptomId);
      if (found) {
        setTriageData(prev => ({ ...prev, bodyArea: match.bodyArea }));
        handleSelectSymptom(found);
        return;
      }
    }

    if (match.matchedType === 'body_area') {
      handleSelectBodyArea(match.bodyArea);
      return;
    }

    // Friendly hint if unrecognized
    const notUnderstoodMsg = "I couldn't quite detect that specific symptom. Please choose your discomfort area from the cards below or try phrasing it differently.";
    setCurrentPrompt(notUnderstoodMsg);
    speak(notUnderstoodMsg);
  };

  // Options to render
  const activeSymptoms = triageData.bodyArea ? bodyPartsData?.[triageData.bodyArea]?.symptoms || [] : [];
  const bodyAreaOptions = [
    ...Object.entries(bodyPartsData || {}).map(([key, val]) => ({
      id: key,
      label: val.displayName || key,
      icon: BODY_PART_ICONS[key] || '🩺'
    })),
    { id: 'general', label: 'Unsure / Multi-System (General Medicine)', icon: '🏥' }
  ];
  const currentNodeOptions = triageData.currentNode?.options || [];
  const currentNodeType = triageData.currentNode?.type;
  const progressPercent = STEP_PROGRESS[currentStep] || 25;

  return (
    <div className="duo-chatbox-card">
      {/* Top Header & Progress Bar */}
      <div className="duo-header">
        <div className="duo-header-nav">
          {historyStack.length > 0 && currentStep !== 'result' ? (
            <button className="duo-back-btn" onClick={handleGoBack} title="Go back to previous question">
              <LuArrowLeft size={18} />
              <span>Back</span>
            </button>
          ) : (
            <div className="duo-assistant-pill">
              <LuBot size={15} />
              <span>talk2doc Triage</span>
            </div>
          )}

          <div className="duo-step-counter">
            {STEP_LABELS[currentStep] || 'Triage'}
          </div>

          <div className="duo-header-actions">
            <button
              className={`duo-sound-btn ${isSpeechEnabled ? 'active' : ''}`}
              onClick={() => {
                const next = !isSpeechEnabled;
                setIsSpeechEnabled(next);
                if (next) speak(currentPrompt);
                else window.speechSynthesis?.cancel();
              }}
              title={isSpeechEnabled ? 'Voice readout enabled (tap to mute)' : 'Voice readout muted (tap to enable)'}
            >
              {isSpeechEnabled ? <LuVolume2 size={16} /> : <LuVolumeX size={16} />}
            </button>
            <button className="duo-reset-btn" onClick={initChat} title="Reset Triage">
              <LuRotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="duo-progress-track">
          <div 
            className="duo-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Content Area with Smooth Duolingo Transitions */}
      <div className="duo-content-body" ref={containerRef}>
        <div className={`duo-step-container ${isTransitioning ? 'duo-exit' : 'duo-enter'}`}>
          {/* Question Prompt */}
          <div className="duo-question-card">
            <div className="duo-question-icon">
              <LuBot size={24} />
            </div>
            <h3 className="duo-question-text">{currentPrompt}</h3>
          </div>

          {/* Option Cards: Step 1 Body Area */}
          {currentStep === 'body_area' && (
            <div className="duo-options-grid">
              {bodyAreaOptions.map(opt => {
                const isSelected = selectedOptionId === opt.id || triageData.bodyArea === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`duo-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectBodyArea(opt.id)}
                  >
                    <div className="duo-option-left">
                      <span className="duo-card-icon">{opt.icon}</span>
                      <span className="duo-card-label">{opt.label}</span>
                    </div>
                    <div className="duo-radio-indicator">
                      {isSelected ? <div className="duo-radio-dot" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Option Cards: Step 2 Symptoms */}
          {currentStep === 'symptom' && (
            <div className="duo-options-grid">
              {activeSymptoms.map(symp => {
                const isSelected = selectedOptionId === symp.id;
                return (
                  <button
                    key={symp.id}
                    className={`duo-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectSymptom(symp)}
                  >
                    <div className="duo-option-left">
                      <span className="duo-card-icon">⚡</span>
                      <div className="duo-card-label-group">
                        <span className="duo-card-label">{symp.label}</span>
                        {symp.department && (
                          <span className="duo-card-sublabel">Primary Specialty: {symp.department}</span>
                        )}
                      </div>
                    </div>
                    <div className="duo-radio-indicator">
                      {isSelected ? <div className="duo-radio-dot" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Option Cards: Step 3 Decision Tree Single Select */}
          {currentStep === 'tree_node' && currentNodeType === 'single_select' && (
            <div className="duo-options-grid">
              {currentNodeOptions.map(opt => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`duo-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTreeSingleSelect(opt.id, opt.label)}
                  >
                    <div className="duo-option-left">
                      <span className="duo-card-icon">👉</span>
                      <span className="duo-card-label">{opt.label}</span>
                    </div>
                    <div className="duo-radio-indicator">
                      {isSelected ? <div className="duo-radio-dot" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Option Cards: Step 3 Decision Tree Multi Select */}
          {currentStep === 'tree_node' && currentNodeType === 'multi_select' && (
            <div className="duo-multi-container">
              <div className="duo-options-grid">
                {currentNodeOptions.map(opt => {
                  const isChecked = triageData.pendingMultiSelect.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      className={`duo-option-card multi-select ${isChecked ? 'selected' : ''}`}
                      onClick={() => toggleMultiSelectOption(opt.id)}
                    >
                      <div className="duo-option-left">
                        <span className="duo-card-icon">▫️</span>
                        <span className="duo-card-label">{opt.label}</span>
                      </div>
                      <div className={`duo-check-box ${isChecked ? 'checked' : ''}`}>
                        {isChecked && <LuCheck size={14} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                className="duo-continue-btn"
                onClick={confirmMultiSelect}
                disabled={triageData.pendingMultiSelect.length === 0}
              >
                <span>Continue</span>
                <LuArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Option Cards: Step 3 Duration */}
          {currentStep === 'duration' && (
            <div className="duo-options-grid">
              {(followUpQuestions?.duration?.options || []).map(opt => {
                const isSelected = selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`duo-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectDuration(opt)}
                  >
                    <div className="duo-option-left">
                      <span className="duo-card-icon">⏱️</span>
                      <span className="duo-card-label">{opt.label}</span>
                    </div>
                    <div className="duo-radio-indicator">
                      {isSelected ? <div className="duo-radio-dot" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Option Cards: Step 3 Severity */}
          {currentStep === 'severity' && (
            <div className="duo-options-grid">
              {(followUpQuestions?.severity?.options || []).map(opt => {
                const isSelected = selectedOptionId === opt.id;
                const severityColors = {
                  mild: '🟢',
                  moderate: '🟡',
                  severe: '🔴'
                };
                return (
                  <button
                    key={opt.id}
                    className={`duo-option-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectSeverity(opt)}
                  >
                    <div className="duo-option-left">
                      <span className="duo-card-icon">{severityColors[opt.id] || '🩺'}</span>
                      <span className="duo-card-label">{opt.label}</span>
                    </div>
                    <div className="duo-radio-indicator">
                      {isSelected ? <div className="duo-radio-dot" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 4 Result Card */}
          {currentStep === 'result' && (
            <DepartmentResult 
              recommendation={recommendation} 
              onReset={initChat} 
            />
          )}
        </div>
      </div>

      {/* Free-Form Voice & Text Input */}
      {currentStep !== 'result' && (
        <div className="duo-input-wrapper">
          {isListening && (
            <div className="duo-listening-banner">
              <span>🔴 Listening... Speak naturally (e.g. "I have a severe headache since yesterday")</span>
            </div>
          )}
          {isAiProcessing && (
            <div className="duo-ai-indicator">
              <LuLoader className="duo-spin" size={13} />
              <span>Analyzing symptoms with clinical AI...</span>
            </div>
          )}
          {speechError && (
            <div className="duo-speech-error">
              <span>⚠️ {speechError}</span>
            </div>
          )}
          <form className="duo-input-bar" onSubmit={handleTextSubmit}>
            <input
              type="text"
              placeholder={
                isListening
                  ? 'Listening to speech... Speak now'
                  : currentStep === 'body_area' 
                  ? 'Type or speak: "severe headache since yesterday", "stomach ache"...' 
                  : 'Type, speak, or tap an option above...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTransitioning || isAiProcessing}
            />
            <button
              type="button"
              onClick={isListening ? stopVoiceInput : startVoiceInput}
              className={isListening ? 'duo-mic-btn listening' : 'duo-mic-btn'}
              title={isListening ? 'Stop voice listening' : 'Speak your symptoms (Voice Input)'}
              disabled={isTransitioning || isAiProcessing}
            >
              {isListening ? <LuMicOff size={16} /> : <LuMic size={16} />}
            </button>
            <button 
              type="submit" 
              disabled={!inputText.trim() || isTransitioning || isAiProcessing}
              title="Send message"
            >
              {isAiProcessing ? <LuLoader className="duo-spin" size={15} /> : <LuSend size={15} />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
