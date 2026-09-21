import React, { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../../config';
import {
  LuSend as Send,
  LuBot as Bot,
  LuUser as User,
  LuRotateCcw as RotateCcw,
  LuCheck as Check,
  LuArrowRight as ArrowRight,
  LuMic as Mic,
  LuMicOff as MicOff,
  LuVolume2 as Volume2,
  LuVolumeX as VolumeX,
  LuLoader as Loader2
} from 'react-icons/lu';
import QuickChips from './QuickChips';
import DepartmentResult from './DepartmentResult';
import { matchFreeTextQuery, matchDurationQuery, matchSeverityQuery } from '../../utils/symptomSynonyms';

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
  const [interactionMode, setInteractionMode] = useState('manual');
  // 'manual' | 'voice'

  const [voiceStatus, setVoiceStatus] = useState('idle');
  // 'idle' | 'listening' | 'thinking' | 'speaking'

  const [voiceTranscript, setVoiceTranscript] = useState('');

  const voiceModeRef = useRef(false);
  const voiceTranscriptRef = useRef('');
  const voiceProcessingRef = useRef(false);
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
  const [showAvatars, setShowAvatars] = useState(false);
  const recognitionRef = useRef(null);
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
  const selectingAreaRef = useRef(false);

  // Text-To-Speech (Voice Output) with safety timeout to prevent hanging
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

      window.speechSynthesis.cancel();

      const cleanText = text
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\u2011-\u26FF|\uD83E[\uDD10-\uDDFF])/g, '')
        .replace(/[*_#`]/g, '')
        .trim();

      if (!cleanText) {
        resolve();
        return;
      }

      setVoiceStatus('speaking');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      utterance.rate = 0.94;
      utterance.pitch = 1;

      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          clearTimeout(safetyTimer);
          resolve();
        }
      };

      // Safety timeout: Chrome can stall or garbage-collect utterance
      const maxWait = Math.min(cleanText.length * 85 + 1500, 7000);
      const safetyTimer = setTimeout(finish, maxWait);

      utterance.onend = finish;
      utterance.onerror = finish;

      window.speechSynthesis.speak(utterance);
    });
  };

  const startAgentListening = () => {
    if (!voiceModeRef.current) return;

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

      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setVoiceStatus('listening');
        setIsListening(true);

        setVoiceTranscript('');
        voiceTranscriptRef.current = '';
      };

      recognition.onresult = (event) => {
        let transcript = '';

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          transcript += event.results[i][0].transcript;
        }

        transcript = transcript.trim();

        setVoiceTranscript(transcript);
        voiceTranscriptRef.current = transcript;
      };

      recognition.onerror = (event) => {
        console.warn(
          '[Talk2Doc Voice] Speech recognition error:',
          event.error
        );

        setIsListening(false);

        if (event.error === 'not-allowed') {
          setSpeechError(
            'Microphone permission denied.'
          );
        }

        setVoiceStatus('idle');
      };

      recognition.onend = () => {
        setIsListening(false);

        const transcript =
          voiceTranscriptRef.current?.trim();

        if (
          transcript &&
          voiceModeRef.current &&
          !voiceProcessingRef.current
        ) {
          processVoiceInput(transcript);
        }
      };

      recognitionRef.current = recognition;

      recognition.start();

    } catch (error) {
      console.error(
        '[Talk2Doc Voice] Failed to start:',
        error
      );

      setIsListening(false);
      setVoiceStatus('idle');
    }
  };

  const processVoiceInput = async (text) => {
    if (!text?.trim()) {
      if (voiceModeRef.current) {
        setTimeout(() => startAgentListening(), 500);
      }
      return;
    }

    if (voiceProcessingRef.current) return;

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

      // Result reached → stop voice conversation
      if (
        voiceModeRef.current &&
        currentStepRef.current !== 'result'
      ) {
        setTimeout(() => {
          if (
            voiceModeRef.current &&
            !voiceProcessingRef.current
          ) {
            startAgentListening();
          }
        }, 600);
      }
    }
  };
  const startVoiceConversation = async () => {
    voiceModeRef.current = true;
    voiceProcessingRef.current = false;

    setInteractionMode('voice');
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';
    setSpeechError(null);

    const greeting =
      "Hi, I'm Talk2Doc. Tell me what's been bothering you. You can speak naturally, and I'll ask you a few questions.";

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
      await speakAgent(greeting);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }

    if (voiceModeRef.current) {
      setTimeout(() => {
        startAgentListening();
      }, 400);
    }
  };
  const exitVoiceMode = () => {
    voiceModeRef.current = false;
    voiceProcessingRef.current = false;

    try {
      recognitionRef.current?.stop();
    } catch { }

    window.speechSynthesis?.cancel();

    setIsListening(false);
    setVoiceStatus('idle');
    setVoiceTranscript('');
    voiceTranscriptRef.current = '';

    setInteractionMode('manual');
  };

  // Speech-To-Text (Voice Input)


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
      pendingMultiSelect: []
    };

    updateTriageData(initialTriage);
    setRecommendation(null);
  };

  const addBotMessage = (text, extra = {}, options = {}) => {
    const { speakMessage = false } = options;
    const newMsg = {
      id: Date.now() + Math.random(),
      sender: 'bot',
      text,
      ...extra
    };

    messagesRef.current = [...messagesRef.current, newMsg];
    setMessages(prev => [...prev, newMsg]);

    if (speakMessage) {
      speakAgent(text);
    }
  };

  const addUserMessage = (text) => {
    const newMsg = { id: Date.now() + Math.random(), sender: 'user', text };
    messagesRef.current = [...messagesRef.current, newMsg];
    setMessages(prev => [...prev, newMsg]);
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
      updateCurrentStep('result');
      addBotMessage('Based on your selection, here is your recommended specialty department for consultation:', {
        isResultCard: true,
        recommendation: rec
      });
      if (voiceModeRef.current) {
        finishVoiceConsultation();
      }
    }, 350);
  };

  // When user picks a body area
  const handleSelectBodyArea = (partId, fromSvg = false) => {
    selectingAreaRef.current = true;
    const displayName = bodyPartsData?.[partId]?.displayName || partId;

    if (!fromSvg && onBodyPartSelect) {
      onBodyPartSelect(partId);
    }

    updateTriageData(prev => ({ ...prev, bodyArea: partId }));
    addUserMessage(`Discomfort in: ${displayName}`);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      addBotMessage(`Got it. What specific type of symptom or problem are you experiencing in your ${displayName}?`);
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

      // No tree - proceed to duration step
      addBotMessage(followUpQuestions?.duration?.question || 'How long have you been experiencing this problem?');
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
          speakMessage: !voiceModeRef.current
        }
      );

      if (voiceModeRef.current) {
        await speakAgent(nextNode.question);
      }

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

        setRecommendation(data.recommendation);
        setCurrentStep('result');

        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: 'bot',
          text: `Based on your responses, here is your recommended specialty:`,
          isResultCard: true,
          recommendation: data.recommendation
        }]);

        // 🔊 Speak recommendation before ending voice consultation
        if (voiceModeRef.current) {
          await speakAgent(finalMessage);
          finishVoiceConsultation();
        }
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
  const handleSelectDuration = (durationOpt) => {
    return new Promise((resolve) => {
      updateTriageData(prev => ({
        ...prev,
        duration: durationOpt.label
      }));

      addUserMessage(durationOpt.label);
      setIsTyping(true);

      const severityQuestion =
        followUpQuestions?.severity?.question ||
        'How severe is the discomfort?';

      setTimeout(async () => {
        setIsTyping(false);

        addBotMessage(
          severityQuestion,
          {},
          {
            speakMessage: !voiceModeRef.current
          }
        );

        if (voiceModeRef.current) {
          await speakAgent(severityQuestion);
        }

        updateCurrentStep('severity');
        resolve();
      }, 350);
    });
  };
  const handleSelectSeverity = async (severityOpt) => {
    const updatedData = { ...triageDataRef.current, severity: severityOpt.id };
    updateTriageData(updatedData);
    addUserMessage(severityOpt.label);
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommend`, {
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
        const finalMessage =
          `Based on your symptoms, I recommend consulting ${data.recommendation.department}.`;

        setRecommendation(data.recommendation);
        updateCurrentStep('result');

        const newMsg = {
          id: Date.now(),
          sender: 'bot',
          text: `Based on your symptoms in ${data.recommendation.bodyAreaName}, here is your recommended specialty department for consultation:`,
          isResultCard: true,
          recommendation: data.recommendation
        };
        messagesRef.current = [...messagesRef.current, newMsg];
        setMessages(prev => [...prev, newMsg]);

        // 🔊 Speak recommendation before ending voice consultation
        if (voiceModeRef.current) {
          await speakAgent(finalMessage);
          finishVoiceConsultation();
        }
      } else {
        throw new Error('Fallback to General Medicine');
      }
    } catch (err) {
      setIsTyping(false);
      const fallbackRec = {
        department: 'General Medicine',
        altDepartment: 'Primary Care / Internal Medicine',
        bodyAreaName: triageDataRef.current.bodyArea || 'General Area',
        symptomName: triageDataRef.current.symptomName || 'Reported Symptoms',
        duration: triageDataRef.current.duration || 'Not specified',
        severity: severityOpt.id,
        urgency: severityOpt.id === 'severe' ? 'PRIORITY' : 'ROUTINE',
        reason: 'A primary care evaluation will assist in comprehensive triaging and examination of your symptoms.',
        advice: 'Please consult a registered general physician.'
      };
      setRecommendation(fallbackRec);
      updateCurrentStep('result');
      const newMsg = {
        id: Date.now(),
        sender: 'bot',
        text: 'Based on your symptoms, here is your recommended specialty department for consultation:',
        isResultCard: true,
        recommendation: fallbackRec
      };
      messagesRef.current = [...messagesRef.current, newMsg];
      setMessages(prev => [...prev, newMsg]);
      if (voiceModeRef.current) {
        finishVoiceConsultation();
      }
    }
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
  const processUserInput = async (
    rawQuery,
    { source = 'manual' } = {}
  ) => {
    if (!rawQuery || !rawQuery.trim()) {
      return;
    }

    const query = rawQuery.trim();

    console.log(
      `[Talk2Doc] Processing ${source} input:`,
      query
    );

    addUserMessage(query);

    // ==========================================
    // 1. DURATION
    // ==========================================
    const stepNow = currentStepRef.current;
    const triageNow = triageDataRef.current;

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

        await handleSelectDuration(opt);
        return;
      }

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(`I couldn't match "${query}" to a duration timeframe.`);
      }, 350);
      return;
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

        await handleSelectSeverity(opt);
        return;
      }

      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(`I couldn't match "${query}" to a severity level.`);
      }, 350);
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

        // Spoken or text reply
        if (source === 'voice' && data.conversationalReply) {
          addBotMessage(data.conversationalReply, {}, { speakMessage: false });
          await speakAgent(data.conversationalReply);
        } else if (data.conversationalReply) {
          addBotMessage(data.conversationalReply);
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
              onBodyPartSelect(targetAreaKey);
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
                addBotMessage(startNode.question, {}, { speakMessage: source !== 'voice' });
                if (source === 'voice') {
                  await speakAgent(startNode.question);
                }
                updateCurrentStep('tree_node');
                return;
              }
            }

            // No decision tree
            if (durationId) {
              const durationOpt = followUpQuestions?.duration?.options?.find(o => o.id === durationId) || { id: durationId, label: duration || durationId };
              await handleSelectDuration(durationOpt);
              return;
            }

            const durationQuestion =
              followUpQuestions?.duration?.question ||
              'How long have you been experiencing this problem?';

            addBotMessage(durationQuestion, {}, { speakMessage: source !== 'voice' });
            if (source === 'voice') {
              await speakAgent(durationQuestion);
            }
            updateCurrentStep('duration');
            return;
          }
        }

        // Duration answer when currently in duration step or indicated by AI
        if ((currentStepRef.current === 'duration' || data.nextStep === 'severity') && durationId) {
          const opt = followUpQuestions?.duration?.options?.find(o => o.id === durationId) || { id: durationId, label: duration || durationId };
          await handleSelectDuration(opt);
          return;
        }

        // Severity answer when currently in severity step or indicated by AI
        if ((currentStepRef.current === 'severity' || data.nextStep === 'result') && severityId) {
          const opt = followUpQuestions?.severity?.options?.find(o => o.id === severityId) || { id: severityId, label: severity || severityId };
          await handleSelectSeverity(opt);
          return;
        }

        // Body area only
        if (bodyArea && (currentStepRef.current === 'body_area' || !triageDataRef.current.bodyArea)) {
          handleSelectBodyArea(bodyArea);
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
          speakMessage:
            source !== 'voice'
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
              speakMessage:
                source !== 'voice'
            }
          );

          if (
            source === 'voice'
          ) {
            await speakAgent(
              startNode.question
            );
          }

          setCurrentStep(
            'tree_node'
          );

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
          speakMessage:
            source !== 'voice'
        }
      );

      if (
        source === 'voice'
      ) {
        await speakAgent(
          durationQuestion
        );
      }

      setCurrentStep(
        'duration'
      );

      return;
    }

    if (
      match.matchedType ===
      'body_area'
    ) {

      handleSelectBodyArea(
        match.bodyArea
      );

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
        speakMessage:
          source !== 'voice'
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
      isAiProcessing
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
            <button
              type="button"
              className="voice-exit-btn"
              onClick={exitVoiceMode}
              title="Exit voice consultation"
            >
              Exit
            </button>
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
          onClick={startVoiceConversation}
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
          <div className="chatbox-messages">
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
                    <DepartmentResult recommendation={msg.recommendation} onReset={initChat} />
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

            <button type="submit" disabled={!inputText.trim() || isTyping || isAiProcessing} title="Send message">
              {isAiProcessing ? <Loader2 size={16} className="duo-spin" /> : <Send size={16} />}
            </button>
          </form>
        </>
      )}
      {interactionMode === 'voice' && (
        <div className="voice-agent">

          <div className="voice-agent-main">

            <div
              className={`voice-agent-orb ${voiceStatus}`}
              onClick={() => {
                if (isListening) {
                  try { recognitionRef.current?.stop(); } catch {}
                } else if (voiceStatus !== 'speaking') {
                  startAgentListening();
                }
              }}
              title={isListening ? "Click to pause listening" : "Click to speak"}
            >
              <div className="voice-agent-ring ring-one"></div>
              <div className="voice-agent-ring ring-two"></div>

              <div className="voice-agent-core">
                {voiceStatus === 'listening' ? (
                  <Mic size={34} />
                ) : voiceStatus === 'speaking' ? (
                  <Volume2 size={34} />
                ) : voiceStatus === 'thinking' ? (
                  <Loader2
                    size={34}
                    className="duo-spin"
                  />
                ) : (
                  <Bot size={34} />
                )}
              </div>
            </div>

            <h2 className="voice-agent-status-title">
              {voiceStatus === 'listening'
                ? "I'm listening"
                : voiceStatus === 'thinking'
                  ? 'Let me understand that'
                  : voiceStatus === 'speaking'
                    ? 'Talk2Doc is speaking'
                    : 'Ready when you are'}
            </h2>

            <p className="voice-agent-status-text">
              {voiceStatus === 'listening'
                ? 'Tell me naturally what you are experiencing.'
                : voiceStatus === 'thinking'
                  ? 'Processing what you told me...'
                  : voiceStatus === 'speaking'
                    ? 'Please listen to the next question.'
                    : 'Your consultation will continue automatically.'}
            </p>

            {voiceTranscript && (
              <div className="voice-transcript">
                <span className="transcript-label">
                  You said
                </span>

                <p>
                  “{voiceTranscript}”
                </p>
              </div>
            )}

            <div className="voice-understanding">

              <div className="understanding-header">
                <div>
                  <strong>What I've understood</strong>
                  <span>
                    Updated automatically during your consultation
                  </span>
                </div>
              </div>

              <div className="understanding-row">
                <span>Body area</span>
                <strong>
                  {understoodData.bodyArea || '—'}
                </strong>
              </div>

              <div className="understanding-row">
                <span>Main concern</span>
                <strong>
                  {understoodData.symptomName || '—'}
                </strong>
              </div>

              <div className="understanding-row">
                <span>Duration</span>
                <strong>
                  {understoodData.duration || '—'}
                </strong>
              </div>

              <div className="understanding-row">
                <span>Severity</span>
                <strong>
                  {understoodData.severity || '—'}
                </strong>
              </div>

              {understoodData.extraSymptoms?.length > 0 && (
                <div className="understanding-row">
                  <span>Other symptoms</span>

                  <strong>
                    {understoodData.extraSymptoms.join(', ')}
                  </strong>
                </div>
              )}

            </div>

          </div>

          <div className="voice-agent-footer">

            <div
              className={`voice-agent-mic ${isListening ? 'active' : ''
                }`}
              onClick={() => {
                if (isListening) {
                  try { recognitionRef.current?.stop(); } catch {}
                } else if (voiceStatus !== 'speaking') {
                  startAgentListening();
                }
              }}
              title={isListening ? "Click to pause listening" : "Click to speak"}
            >
              {isListening
                ? <Mic size={24} />
                : <MicOff size={24} />
              }
            </div>

            <span>
              {isListening
                ? 'Listening automatically...'
                : voiceStatus === 'speaking'
                  ? 'Talk2Doc is speaking...'
                  : 'Hands-free consultation (tap to speak)'}
            </span>

            {speechError && (
              <div className="voice-error">
                ⚠️ {speechError}
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}
