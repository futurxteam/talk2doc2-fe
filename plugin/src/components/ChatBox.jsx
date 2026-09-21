import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RotateCcw, Check, ArrowRight, Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import QuickChips from './QuickChips';
import DepartmentResult from './DepartmentResult';
import { matchFreeTextQuery, matchDurationQuery, matchSeverityQuery } from '../utils/symptomSynonyms';

export default function ChatBox({
  selectedBodyPart,
  onBodyPartSelect,
  bodyPartsData,
  followUpQuestions,
  decisionTrees,
  onRecommendation
}) {
  const [messages, setMessages] = useState([]);
  // Steps: 'body_area' | 'symptom_transition' | 'symptom' | 'tree_node' | 'duration' | 'severity' | 'result'
  const [currentStep, setCurrentStep] = useState('body_area');
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
    pendingMultiSelect: []  // accumulates multi-select answers before confirm
  });
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  // Voice Input & Output State
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const recognitionRef = useRef(null);

  const messagesEndRef = useRef(null);
  const selectingAreaRef = useRef(false);

  // Text-To-Speech (Voice Output)
  const speak = (text) => {
    if (!isSpeechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
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
      setSpeechError('Voice recognition is not supported in this browser.');
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
          setSpeechError('Microphone permission denied.');
          setTimeout(() => setSpeechError(null), 4500);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (onRecommendation) {
      onRecommendation(recommendation);
    }
  }, [recommendation]);

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
      selectedBodyPart !== triageData.bodyArea &&
      !selectingAreaRef.current
    ) {
      handleSelectBodyArea(selectedBodyPart, true);
    }
  }, [selectedBodyPart]);

  const initChat = () => {
    if (isListening) stopVoiceInput();
    window.speechSynthesis?.cancel();
    selectingAreaRef.current = false;
    const initialGreeting = 'Hello! I am talk2doc, your medical specialty advisor. Where are you experiencing discomfort? You can tap a body part on the interactive diagram or select from the options below.';
    setMessages([{
      id: 1,
      sender: 'bot',
      text: initialGreeting
    }]);
    setCurrentStep('body_area');
    setTriageData({
      bodyArea: null, symptomId: null, symptomName: null,
      duration: null, severity: null,
      treeId: null, currentNodeId: null, currentNode: null,
      answersMap: {}, pendingMultiSelect: []
    });
    setRecommendation(null);
    speak(initialGreeting);
  };

  const addBotMessage = (text, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'bot', text, ...extra }]);
    speak(text);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender: 'user', text }]);
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
      setRecommendation(rec);
      setCurrentStep('result');
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Based on your selection, here is your recommended specialty department for consultation:',
        isResultCard: true,
        recommendation: rec
      }]);
    }, 350);
  };

  const handleSelectBodyArea = (partId, fromSvg = false) => {
    if (partId === 'general') {
      handleDirectGeneralMedicine();
      return;
    }

    if (selectingAreaRef.current || (triageData.bodyArea === partId && currentStep !== 'body_area')) {
      return;
    }
    selectingAreaRef.current = true;
    setCurrentStep('symptom_transition');

    const area = bodyPartsData?.[partId];
    const displayName = area?.displayName || partId.replaceAll('_', ' ');

    if (!fromSvg && onBodyPartSelect) {
      onBodyPartSelect(partId);
    }

    setTriageData(prev => ({ ...prev, bodyArea: partId }));
    addUserMessage(`Discomfort in: ${displayName}`);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(`Got it. What specific type of symptom or problem are you experiencing in your ${displayName}?`);
      setCurrentStep('symptom');
      selectingAreaRef.current = false;
    }, 350);
  };

  // After symptom is chosen
  const handleSelectSymptom = (symptom) => {
    setTriageData(prev => ({ ...prev, symptomId: symptom.id, symptomName: symptom.label }));
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
          setTriageData(prev => ({
            ...prev,
            treeId: symptom.decisionTreeId,
            currentNodeId: startNodeId,
            currentNode: startNode,
            answersMap: {},
            pendingMultiSelect: []
          }));
          addBotMessage(startNode.question);
          setCurrentStep('tree_node');
          return;
        }
      }

      // No tree - proceed to duration step
      addBotMessage(followUpQuestions?.duration?.question || 'How long have you been experiencing this problem?');
      setCurrentStep('duration');
    }, 350);
  };

  // Decision Tree Navigation
  const advanceTree = (newAnswersMap, answeredNodeId, newTriage) => {
    const tree = decisionTrees?.[newTriage.treeId];
    if (!tree) {
      submitTriage(newTriage.bodyArea, newTriage.symptomId, newTriage.treeId, newAnswersMap);
      return;
    }

    // Walk to next node
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

    if (!next) {
      submitTriage(newTriage.bodyArea, newTriage.symptomId, newTriage.treeId, newAnswersMap);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // Is next an outcome?
      if (tree.outcomes[next]) {
        submitTriage(newTriage.bodyArea, newTriage.symptomId, newTriage.treeId, newAnswersMap);
        return;
      }

      // It's another node
      const nextNode = tree.nodes[next];
      if (!nextNode) {
        submitTriage(newTriage.bodyArea, newTriage.symptomId, newTriage.treeId, newAnswersMap);
        return;
      }

      setTriageData(prev => ({
        ...prev,
        currentNodeId: next,
        currentNode: nextNode,
        answersMap: newAnswersMap,
        pendingMultiSelect: []
      }));
      addBotMessage(nextNode.question);
      setCurrentStep('tree_node');
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
    setCurrentStep('loading');
    setIsTyping(true);
    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bodyArea, symptomId, treeId, answersMap })
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
        setCurrentStep('result');
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: `Based on your responses, here is your recommended specialty:`,
          isResultCard: true,
          recommendation: data.recommendation
        }]);
      } else {
        throw new Error('Fallback to General Medicine');
      }
    } catch (err) {
      setIsTyping(false);
      const fallbackRec = {
        department: 'General Medicine',
        altDepartment: 'Primary Care / Internal Medicine',
        bodyAreaName: bodyArea || 'Head & Neck',
        symptomName: triageData.symptomName || 'Headache / General Symptoms',
        urgency: 'ROUTINE',
        reason: 'When symptoms are mixed or non-emergency, a General Medicine physician performs initial clinical examination and baseline tests to initiate care or recommend appropriate sub-specialists.',
        advice: 'Consult a primary care physician / internist for clinical evaluation.'
      };
      setRecommendation(fallbackRec);
      setCurrentStep('result');
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Based on your symptoms, here is your recommended specialty department for consultation:',
        isResultCard: true,
        recommendation: fallbackRec
      }]);
    }
  };

  const handleSelectDuration = (durationOpt) => {
    setTriageData(prev => ({ ...prev, duration: durationOpt.label }));
    addUserMessage(durationOpt.label);
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(followUpQuestions?.severity?.question || 'How severe is the discomfort?');
      setCurrentStep('severity');
    }, 350);
  };

  const handleSelectSeverity = async (severityOpt) => {
    const updatedData = { ...triageData, severity: severityOpt.id };
    setTriageData(updatedData);
    addUserMessage(severityOpt.label);
    setIsTyping(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyArea: updatedData.bodyArea,
          symptomId: updatedData.symptomId,
          duration: updatedData.duration,
          severity: severityOpt.id
        })
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.success && data.recommendation) {
        setRecommendation(data.recommendation);
        setCurrentStep('result');
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: `Based on your symptoms in ${data.recommendation.bodyAreaName}, here is your recommended specialty department for consultation:`,
          isResultCard: true,
          recommendation: data.recommendation
        }]);
      } else {
        throw new Error('Fallback to General Medicine');
      }
    } catch (err) {
      setIsTyping(false);
      const fallbackRec = {
        department: 'General Medicine',
        altDepartment: 'Primary Care / Internal Medicine',
        bodyAreaName: triageData.bodyArea || 'General Area',
        symptomName: triageData.symptomName || 'Reported Symptoms',
        duration: triageData.duration || 'Not specified',
        severity: severityOpt.id,
        urgency: severityOpt.id === 'severe' ? 'PRIORITY' : 'ROUTINE',
        reason: 'A primary care evaluation will assist in comprehensive triaging and examination of your symptoms.',
        advice: 'Please consult a registered general physician.'
      };
      setRecommendation(fallbackRec);
      setCurrentStep('result');
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        text: 'Based on your symptoms, here is your recommended specialty department for consultation:',
        isResultCard: true,
        recommendation: fallbackRec
      }]);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const rawQuery = inputText.trim();
    setInputText('');

    addUserMessage(rawQuery);

    // 1. Duration step matching
    if (currentStep === 'duration') {
      const durId = matchDurationQuery(rawQuery);
      if (durId) {
        const opt = followUpQuestions?.duration?.options?.find(o => o.id === durId) || { id: durId, label: rawQuery };
        handleSelectDuration(opt);
        return;
      }
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(
          `I couldn't match "${rawQuery}" to a duration timeframe. Please select one of the system options below:`
        );
      }, 350);
      return;
    }

    // 2. Severity step matching
    if (currentStep === 'severity') {
      const sevId = matchSeverityQuery(rawQuery);
      if (sevId) {
        const opt = followUpQuestions?.severity?.options?.find(o => o.id === sevId) || { id: sevId, label: rawQuery };
        handleSelectSeverity(opt);
        return;
      }
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(
          `I couldn't match "${rawQuery}" to a severity level. Please select one of the system options below:`
        );
      }, 350);
      return;
    }

    // 3. Tree node single select matching
    if (currentStep === 'tree_node') {
      const qLower = rawQuery.toLowerCase();
      const matchedOpt = triageData.currentNode?.options?.find(o =>
        qLower.includes(o.label.toLowerCase()) ||
        (o.id === 'none' && (qLower.includes('no') || qLower.includes('none') || qLower.includes('neither')))
      );
      if (matchedOpt && triageData.currentNode?.type === 'single_select') {
        handleTreeSingleSelect(matchedOpt.id, matchedOpt.label);
        return;
      }
    }

    // 4. AI Clinical Extraction Layer
    setIsAiProcessing(true);
    setIsTyping(true);
    try {
      const res = await fetch('/api/ai/understand-symptoms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawQuery,
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
            recentConversation: messages.slice(-6).map(m => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              text: m.text
            }))
          }
        })
      });

      const data = await res.json();
      setIsAiProcessing(false);
      setIsTyping(false);

      if (data.success && data.extracted) {
        const { bodyArea, symptomId, durationId, severityId } = data.extracted;

        if (data.conversationalReply) {
          addBotMessage(data.conversationalReply);
        }

        if (data.decisionAnswer?.selectedOptionIds?.length > 0 && currentStep === 'tree_node') {
          const selectedId = data.decisionAnswer.selectedOptionIds[0];
          handleTreeSingleSelect(selectedId, selectedId);
          return;
        }

        if (currentStep === 'duration' && durationId) {
          const opt = followUpQuestions?.duration?.options?.find(o => o.id === durationId) || { id: durationId, label: durationId };
          handleSelectDuration(opt);
          return;
        }

        if (currentStep === 'severity' && severityId) {
          const opt = followUpQuestions?.severity?.options?.find(o => o.id === severityId) || { id: severityId, label: severityId };
          handleSelectSeverity(opt);
          return;
        }

        if (symptomId && bodyArea) {
          const area = bodyPartsData?.[bodyArea];
          const foundSymptom = area?.symptoms?.find(s => s.id === symptomId);
          if (foundSymptom) {
            setTriageData(prev => ({
              ...prev,
              bodyArea,
              symptomId: foundSymptom.id,
              symptomName: foundSymptom.label
            }));
            if (onBodyPartSelect) onBodyPartSelect(bodyArea);

            if (foundSymptom.hasDecisionTree && foundSymptom.decisionTreeId) {
              const tree = decisionTrees?.[foundSymptom.decisionTreeId];
              if (tree) {
                const startNodeId = tree.startNode;
                const startNode = tree.nodes[startNodeId];
                setTriageData(prev => ({
                  ...prev,
                  treeId: foundSymptom.decisionTreeId,
                  currentNodeId: startNodeId,
                  currentNode: startNode,
                  answersMap: {},
                  pendingMultiSelect: []
                }));
                addBotMessage(startNode.question);
                setCurrentStep('tree_node');
                return;
              }
            }

            addBotMessage(followUpQuestions?.duration?.question || 'How long have you been experiencing this problem?');
            setCurrentStep('duration');
            return;
          }
        }

        if (bodyArea && currentStep === 'body_area') {
          handleSelectBodyArea(bodyArea);
          return;
        }
      }
    } catch (err) {
      console.warn('AI understand failed, falling back to synonym dictionary:', err);
      setIsAiProcessing(false);
      setIsTyping(false);
    }

    // 5. Fallback: Free-text symptom or body part matching via clinical synonym dictionary
    const match = matchFreeTextQuery(rawQuery);

    if (match.matchedType === 'general') {
      handleDirectGeneralMedicine();
      return;
    }

    if (match.matchedType === 'symptom') {
      const area = bodyPartsData?.[match.bodyArea];
      const foundSymptom = area?.symptoms?.find(s => s.id === match.symptomId);
      const symptomLabel = foundSymptom?.label || match.symptomId;
      const areaName = area?.displayName || match.bodyArea;

      setTriageData(prev => ({
        ...prev,
        bodyArea: match.bodyArea,
        symptomId: match.symptomId,
        symptomName: symptomLabel
      }));
      if (onBodyPartSelect) onBodyPartSelect(match.bodyArea);

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(`Understood: Detected "${symptomLabel}" in ${areaName}.`);

        // Check if decision tree applies
        if (foundSymptom?.hasDecisionTree && foundSymptom?.decisionTreeId) {
          const tree = decisionTrees?.[foundSymptom.decisionTreeId];
          if (tree) {
            const startNodeId = tree.startNode;
            const startNode = tree.nodes[startNodeId];
            setTriageData(prev => ({
              ...prev,
              treeId: foundSymptom.decisionTreeId,
              currentNodeId: startNodeId,
              currentNode: startNode,
              answersMap: {},
              pendingMultiSelect: []
            }));
            addBotMessage(startNode.question);
            setCurrentStep('tree_node');
            return;
          }
        }

        // Proceed to duration question
        addBotMessage(followUpQuestions?.duration?.question || 'How long have you been experiencing this problem?');
        setCurrentStep('duration');
      }, 400);
      return;
    }

    if (match.matchedType === 'body_area') {
      handleSelectBodyArea(match.bodyArea);
      return;
    }

    // 6. If match cannot be detected, suggest using system options
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(
        `I couldn't detect a specific symptom or body area from "${rawQuery}". Please select from the system options below, tap the Body Map diagram, or choose "Unsure / General (General Medicine)".`
      );
    }, 400);
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
            <h3>talk2doc Assistant</h3>
            <span className="online-indicator">
              <span className="online-dot"></span> Ready for consultation triage
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className={`chatbox-sound-btn ${isSpeechEnabled ? 'active' : ''}`}
            onClick={() => {
              const next = !isSpeechEnabled;
              setIsSpeechEnabled(next);
              if (!next) window.speechSynthesis?.cancel();
            }}
            title={isSpeechEnabled ? 'Audio readout enabled (tap to mute)' : 'Audio readout muted (tap to enable)'}
          >
            {isSpeechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button className="reset-chat-btn" onClick={initChat} title="Reset Conversation">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="chatbox-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.sender}`}>
            <div className="message-avatar">
              {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="message-content">
              <p>{msg.text}</p>
              {msg.isResultCard && (
                <DepartmentResult recommendation={msg.recommendation} onReset={initChat} />
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message bot typing">
            <div className="message-avatar"><Bot size={16} /></div>
            <div className="typing-bubble">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
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

        {currentStep === 'severity' && (
          <div className="step-prompt">
            <span className="step-label">Select Severity:</span>
            <QuickChips options={followUpQuestions?.severity?.options || []} onSelect={handleSelectSeverity} />
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
      <form className="chatbox-input-form" onSubmit={handleTextSubmit}>
        <input
          type="text"
          placeholder={
            isListening
              ? 'Listening to speech... Speak now'
              : currentStep === 'body_area'
              ? 'Type or speak: "severe headache since yesterday", "fever"...'
              : 'Type, speak, or click an option above...'
          }
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isTyping || isAiProcessing}
        />
        <button
          type="button"
          onClick={isListening ? stopVoiceInput : startVoiceInput}
          className={isListening ? 'voice-btn listening' : 'voice-btn'}
          title={isListening ? 'Stop voice listening' : 'Speak your symptoms (Voice Input)'}
          disabled={isTyping || isAiProcessing}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button type="submit" disabled={!inputText.trim() || isTyping || isAiProcessing} title="Send message">
          {isAiProcessing ? <Loader2 size={16} className="duo-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
