import React, { useState, useEffect, useRef } from 'react';
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
  LuHeartHandshake
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

  const containerRef = useRef(null);

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
    }, 200);
  };

  const initChat = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep('body_area');
      setCurrentPrompt('Where are you experiencing discomfort? Select an area below or tap the interactive body diagram.');
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
    }, 200);
  };

  const transitionTo = (nextStep, nextPrompt, nextDataUpdate = {}) => {
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/triage`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/recommend`, {
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

  // Free text query submit
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTransitioning) return;
    const query = inputText.trim();
    setInputText('');

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
    }
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

          <button className="duo-reset-btn" onClick={initChat} title="Reset Triage">
            <LuRotateCcw size={15} />
          </button>
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

      {/* Optional Free-Form Input for User Convenience */}
      {currentStep !== 'result' && (
        <form className="duo-input-bar" onSubmit={handleTextSubmit}>
          <input
            type="text"
            placeholder={
              currentStep === 'body_area' 
                ? 'Or type your symptoms (e.g. "migraine", "stomach pain")...' 
                : 'Type an answer or tap a card above...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" disabled={!inputText.trim() || isTransitioning}>
            <LuSend size={15} />
          </button>
        </form>
      )}
    </div>
  );
}
