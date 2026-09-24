import React, { useState, useEffect, useRef, useCallback } from 'react';
import API_BASE_URL from '../../config';
import AudioWaveVisualizer from './AudioWaveVisualizer';
import { playOpenAiTTS, stopCurrentSpeech, getAudioContext, getVoiceAnalyser } from '../../utils/voiceTtsService';
import { LuX, LuMic, LuMicOff } from 'react-icons/lu';

/**
 * VoiceExperience
 * Full pitch-black hands-free voice consultation interface.
 * Controlled entirely by voice with OpenAI TTS and dynamic frequency wave visualizer.
 */
export default function VoiceExperience({ onClose, onBookingComplete }) {
  // Voice interaction states
  const [engineState, setEngineState] = useState('speaking'); // 'speaking' | 'listening' | 'thinking' | 'idle'
  const [language, setLanguage] = useState(null); // 'en' | 'ml'
  const [micMuted, setMicMuted] = useState(false);
  const [analyser, setAnalyser] = useState(null);

  // Conversational step machine
  // 'LANG_SELECTION' | 'DEMOGRAPHICS_AGE' | 'DEMOGRAPHICS_GENDER' | 'DEMOGRAPHICS_MEASUREMENTS' |
  // 'SYMPTOMS' | 'DOC_CHOICE_CONFIRM' | 'DOC_SELECT' | 'DATE_SELECT' | 'SLOT_SELECT' | 'BOOK_CONFIRM' | 'FINISHED'
  const [step, setStep] = useState('LANG_SELECTION');

  // Intake data state
  const sessionData = useRef({
    language: 'en',
    age: '',
    gender: '',
    height: '',
    weight: '',
    symptoms: '',
    department: 'General Medicine',
    recommendedDoctors: [],
    selectedDoctor: null,
    selectedDate: '',
    selectedSlot: '',
    userCoords: { lat: 10.8505, lng: 76.2711 }, // Kerala center default
  });

  const recognitionRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const micStreamRef = useRef(null);
  const micSourceRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const ttsAnalyserRef = useRef(null);
  const stepRef = useRef('LANG_SELECTION');
  const languageRef = useRef(null);

  // Sync refs with state
  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  // Try to acquire user's geolocation silently for nearby doctor calculations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sessionData.current.userCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
        },
        () => {
          // Keep default
        },
        { timeout: 4000 }
      );
    }
  }, []);

  // Initialize Microphone & Web Audio Analyser
  const setupMicAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = getAudioContext();
      if (ctx) {
        const source = ctx.createMediaStreamSource(stream);
        const micAnalyser = ctx.createAnalyser();
        micAnalyser.fftSize = 256;
        micAnalyser.smoothingTimeConstant = 0.85;
        source.connect(micAnalyser);
        micSourceRef.current = source;
        micAnalyserRef.current = micAnalyser;
      }
    } catch (err) {
      console.warn('Microphone stream access error:', err);
    }
  };

  // Helper to speak through OpenAI TTS with state handling
  const speak = useCallback(
    async (textEn, textMl) => {
      const lang = languageRef.current || 'en';
      const textToSpeak = lang === 'ml' && textMl ? textMl : textEn;

      isSpeakingRef.current = true;
      setEngineState('speaking');

      // Stop speech recognition while speaking to prevent echo
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      // Route analyser to TTS playback
      const voiceAnalyser = getVoiceAnalyser();
      setAnalyser(voiceAnalyser);

      await playOpenAiTTS(textToSpeak, {
        voice: lang === 'ml' ? 'nova' : 'nova',
        language: lang,
        onStart: () => {
          setEngineState('speaking');
        },
        onEnd: () => {
          isSpeakingRef.current = false;
          // Switch visualizer back to microphone analyser
          setAnalyser(micAnalyserRef.current);
          startListening();
        },
        onError: () => {
          isSpeakingRef.current = false;
          setAnalyser(micAnalyserRef.current);
          startListening();
        },
      });
    },
    []
  );

  // Process user's speech based on the current conversation step
  const handleUserSpokenInput = async (rawTranscript) => {
    const transcript = rawTranscript.trim();
    if (!transcript) return;

    setEngineState('thinking');
    console.log(`[Voice Input - Step: ${stepRef.current}]: "${transcript}"`);

    const lower = transcript.toLowerCase();
    const currentStep = stepRef.current;
    const currentLang = languageRef.current;

    // STEP 1: Language Selection
    if (currentStep === 'LANG_SELECTION') {
      const isMalayalam =
        lower.includes('malayalam') ||
        lower.includes('മലയാളം') ||
        lower.includes('malayala') ||
        lower.includes('mal');

      const chosenLang = isMalayalam ? 'ml' : 'en';
      setLanguage(chosenLang);
      languageRef.current = chosenLang;
      sessionData.current.language = chosenLang;

      setStep('DEMOGRAPHICS_AGE');
      if (chosenLang === 'ml') {
        await speak(
          'Sure, we will proceed in Malayalam.',
          'ശരി, നമുക്ക് മലയാളത്തിൽ തുടരാം. ദയവായി നിങ്ങളുടെ പ്രായം എത്രയെന്ന് പറയാമോ?'
        );
      } else {
        await speak('Great, let\'s proceed in English. Could you please tell me your age?');
      }
      return;
    }

    // STEP 2: Demographics - Age
    if (currentStep === 'DEMOGRAPHICS_AGE') {
      const ageMatch = transcript.match(/\d+/);
      const age = ageMatch ? ageMatch[0] : transcript;
      sessionData.current.age = age;

      setStep('DEMOGRAPHICS_GENDER');
      if (currentLang === 'ml') {
        await speak(
          'Thank you. What is your gender?',
          'നന്ദി. നിങ്ങളുടെ ലിംഗം ഏതാണ്? പുരുഷൻ, സ്ത്രീ, അല്ലെങ്കിൽ മറ്റുള്ളവ?'
        );
      } else {
        await speak('Thank you. What is your gender? Male, female, or other?');
      }
      return;
    }

    // STEP 3: Demographics - Gender
    if (currentStep === 'DEMOGRAPHICS_GENDER') {
      let gender = 'Not Specified';
      if (/male|man|boy|പുരുഷൻ|ആണ്/i.test(lower)) gender = 'Male';
      else if (/female|woman|girl|സ്ത്രീ|പെണ്ണ്/i.test(lower)) gender = 'Female';
      else gender = transcript;

      sessionData.current.gender = gender;

      setStep('DEMOGRAPHICS_MEASUREMENTS');
      if (currentLang === 'ml') {
        await speak(
          'Got it. Please tell me your approximate height and weight.',
          'മനസ്സിലായി. നിങ്ങളുടെ ഏകദേശ ഉയരവും ഭാരവും പറയാമോ?'
        );
      } else {
        await speak('Got it. Please tell me your approximate height and weight.');
      }
      return;
    }

    // STEP 4: Demographics - Height & Weight
    if (currentStep === 'DEMOGRAPHICS_MEASUREMENTS') {
      sessionData.current.measurements = transcript;

      setStep('SYMPTOMS');
      if (currentLang === 'ml') {
        await speak(
          'Thank you for providing your details. What health symptoms or concerns are you experiencing today?',
          'നന്ദി. ഇന്ന് നിങ്ങൾക്ക് എന്തൊക്കെ ശാരീരിക ബുദ്ധിമുട്ടുകളോ ലക്ഷണങ്ങളോ ആണ് ഉള്ളത്? വിശദീകരിക്കാമോ?'
        );
      } else {
        await speak('Thank you. Now, please describe what health symptoms or issues you are experiencing today.');
      }
      return;
    }

    // STEP 5: Symptoms Intake & Department Triage
    if (currentStep === 'SYMPTOMS') {
      sessionData.current.symptoms = transcript;

      // Call department recommendation API
      let recommendedDept = 'General Medicine';
      try {
        const response = await fetch(`${API_BASE_URL}/api/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: transcript, text: transcript }),
        });
        const data = await response.json();
        if (data.success && data.department) {
          recommendedDept = data.department;
        } else if (data.data?.department) {
          recommendedDept = data.data.department;
        }
      } catch (e) {
        console.warn('Recommendation API fallback to General Medicine:', e);
      }

      // Keyword heuristic fallback if needed
      if (recommendedDept === 'General Medicine') {
        if (/heart|chest|palpitation|നെഞ്ച്|ഹൃദയം/i.test(lower)) recommendedDept = 'Cardiology';
        else if (/skin|rash|itch|ചൊറിച്ചിൽ|തടിപ്പ്/i.test(lower)) recommendedDept = 'Dermatology';
        else if (/bone|joint|knee|fracture|എല്ല്|മുട്ട്/i.test(lower)) recommendedDept = 'Orthopedics';
        else if (/stomach|digestion|vomit|വയറു|ഛർദ്ദി/i.test(lower)) recommendedDept = 'Gastroenterology';
        else if (/ear|nose|throat|ചെവി|മൂക്ക്|തൊണ്ട/i.test(lower)) recommendedDept = 'ENT';
      }

      sessionData.current.department = recommendedDept;

      setStep('DOC_CHOICE_CONFIRM');
      if (currentLang === 'ml') {
        await speak(
          `Based on your symptoms, I recommend consulting the ${recommendedDept} department. Would you like me to find verified doctors within our radius?`,
          `നിങ്ങളുടെ ലക്ഷണങ്ങൾ അനുസരിച്ച് ${recommendedDept} വിഭാഗത്തിലെ ഡോക്ടറെ കാണുന്നതാണ് ഉചിതം. നമ്മുടെ പരിധിയിലുള്ള അടുത്ത ഡോക്ടർമാരുടെ വിവരങ്ങൾ വേണമെന്നുണ്ടോ?`
        );
      } else {
        await speak(
          `Based on your symptoms, I recommend consulting the ${recommendedDept} department. Would you like me to suggest verified doctors available within our radius?`
        );
      }
      return;
    }

    // STEP 6: Doctor Suggestion Confirmation ("Yes / No")
    if (currentStep === 'DOC_CHOICE_CONFIRM') {
      const isNegative = /no|not now|skip|venda|വേണ്ട|ഇല്ല/i.test(lower);
      if (isNegative) {
        setStep('FINISHED');
        if (currentLang === 'ml') {
          await speak(
            'Understood. Take care and stay safe!',
            'ശരി, മനസ്സിലായി. ആവശ്യമുണ്ടെങ്കിൽ വീണ്ടും ചോദിക്കാം. നല്ലൊരു ദിവസം ആശംസിക്കുന്നു!'
          );
        } else {
          await speak('Understood. Feel free to reach out anytime. Take care and have a healthy day!');
        }
        return;
      }

      // Fetch nearby doctors
      const { lat, lng } = sessionData.current.userCoords;
      const dept = sessionData.current.department;
      let doctorList = [];

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/user/nearby?lat=${lat}&lng=${lng}&specialty=${encodeURIComponent(dept)}&radius=15&insurance=all`
        );
        const data = await res.json();
        if (data.success && data.groups) {
          doctorList = Object.values(data.groups).flat();
        }
      } catch (err) {
        console.warn('Nearby fetch error, trying triage fallback:', err);
      }

      if (!doctorList || doctorList.length === 0) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/triage/doctors?department=${encodeURIComponent(dept)}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.doctors)) {
            doctorList = data.doctors;
          }
        } catch (e) {}
      }

      sessionData.current.recommendedDoctors = doctorList;

      if (doctorList.length > 0) {
        const topDocs = doctorList.slice(0, 3);
        const docNames = topDocs
          .map((d, idx) => `Doctor ${idx + 1}: ${d.fullName} at ${d.hospitalName || 'our partner hospital'}`)
          .join('. ');

        setStep('DOC_SELECT');

        if (currentLang === 'ml') {
          const docMalayalamDesc = topDocs
            .map((d, idx) => `നമ്പർ ${idx + 1}, ഡോക്ടർ ${d.fullName}`)
            .join(', ');

          await speak(
            `I found ${topDocs.length} doctors nearby. ${docNames}. Which doctor would you like to select? Say Doctor 1, Doctor 2, or the doctor's name.`,
            `നമ്മുടെ പരിധിയിൽ ലഭ്യമായ ഡോക്ടർമാർ ഇവരാണ്: ${docMalayalamDesc}. ഇതിൽ ഏത് ഡോക്ടറെയാണ് നിങ്ങൾക്ക് കാണേണ്ടത്? ഡോക്ടറുടെ പേരോ നമ്പറോ പറയാമോ?`
          );
        } else {
          await speak(
            `I found ${topDocs.length} doctors within our radius. ${docNames}. Which doctor would you like to consult? You can say Doctor 1, Doctor 2, or say their name.`
          );
        }
      } else {
        setStep('FINISHED');
        if (currentLang === 'ml') {
          await speak(
            'Currently there are no doctors available within our radius for this department. Please visit your nearest hospital directly.',
            'ക്ഷമിക്കണം, ഈ വിഭാഗത്തിൽ നിലവിൽ നമ്മുടെ പരിധിയിൽ ഡോക്ടർമാർ ലഭ്യമല്ല. ദയവായി അടുത്തുള്ള ആശുപത്രിയിൽ നേരിട്ട് ബന്ധപ്പെടുക.'
          );
        } else {
          await speak(
            'Currently there are no available doctors listed in this radius. Please contact your nearest healthcare center directly.'
          );
        }
      }
      return;
    }

    // STEP 7: Doctor Selection
    if (currentStep === 'DOC_SELECT') {
      const doctors = sessionData.current.recommendedDoctors || [];
      let chosenDoc = null;

      // Match by number (1, 2, 3, etc.)
      if (/one|1|first|ഒന്ന്|ഒന്നാമത്തെ/i.test(lower) && doctors[0]) {
        chosenDoc = doctors[0];
      } else if (/two|2|second|രണ്ട്|രണ്ടാമത്തെ/i.test(lower) && doctors[1]) {
        chosenDoc = doctors[1];
      } else if (/three|3|third|മൂന്ന്|മൂന്നാമത്തെ/i.test(lower) && doctors[2]) {
        chosenDoc = doctors[2];
      } else {
        // Match by name
        chosenDoc = doctors.find((d) => lower.includes(d.fullName.toLowerCase().replace('dr.', '').trim()));
      }

      if (!chosenDoc && doctors.length > 0) {
        chosenDoc = doctors[0]; // Default to first doctor
      }

      sessionData.current.selectedDoctor = chosenDoc;

      setStep('DATE_SELECT');
      if (currentLang === 'ml') {
        await speak(
          `Selected ${chosenDoc.fullName}. What date would you like to book your consultation for? For example, say tomorrow, or a specific day.`,
          `ഡോക്ടർ ${chosenDoc.fullName}-നെ തിരഞ്ഞെടുത്തു. ഏത് തീയതിയിലാണ് നിങ്ങൾക്ക് കാണേണ്ടത്? നാളെയെന്നോ അല്ലെങ്കിൽ ആഴ്ചയിലെ ദിവസമോ പറയാമോ?`
        );
      } else {
        await speak(
          `Selected ${chosenDoc.fullName}. What date would you like to visit? You can say today, tomorrow, or a specific date.`
        );
      }
      return;
    }

    // STEP 8: Date Selection & Slot Query
    if (currentStep === 'DATE_SELECT') {
      // Calculate date
      const today = new Date();
      let targetDate = new Date();

      if (/tomorrow|naale|നാളെ/i.test(lower)) {
        targetDate.setDate(today.getDate() + 1);
      } else if (/day after tomorrow|mattannal|മറ്റന്നാൾ/i.test(lower)) {
        targetDate.setDate(today.getDate() + 2);
      } else if (/monday|തിങ്കൾ/i.test(lower)) {
        targetDate.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
      } else if (/tuesday|ചൊവ്വ/i.test(lower)) {
        targetDate.setDate(today.getDate() + ((2 + 7 - today.getDay()) % 7 || 7));
      } else if (/wednesday|ബുധൻ/i.test(lower)) {
        targetDate.setDate(today.getDate() + ((3 + 7 - today.getDay()) % 7 || 7));
      } else if (/thursday|വ്യാഴം/i.test(lower)) {
        targetDate.setDate(today.getDate() + ((4 + 7 - today.getDay()) % 7 || 7));
      } else if (/friday|വെള്ളി/i.test(lower)) {
        targetDate.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7 || 7));
      } else if (/saturday|ശനി/i.test(lower)) {
        targetDate.setDate(today.getDate() + ((6 + 7 - today.getDay()) % 7 || 7));
      } else {
        targetDate.setDate(today.getDate() + 1); // Default to tomorrow
      }

      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      sessionData.current.selectedDate = dateString;

      // Query available slots
      const doctor = sessionData.current.selectedDoctor;
      let availableSlots = [];
      try {
        const res = await fetch(`${API_BASE_URL}/api/appointments/slots?doctorId=${doctor._id}&date=${dateString}`);
        const slotData = await res.json();
        if (slotData.slots && slotData.slots.length > 0) {
          availableSlots = slotData.slots;
        }
      } catch (err) {
        console.warn('Slots lookup error:', err);
      }

      // Fallback slots if doctor has open schedule
      if (availableSlots.length === 0) {
        availableSlots = ['10:00-10:30', '11:30-12:00', '14:30-15:00', '16:00-16:30'];
      }

      sessionData.current.availableSlots = availableSlots;

      const readableSlots = availableSlots.slice(0, 3).join(', ');

      setStep('SLOT_SELECT');
      if (currentLang === 'ml') {
        await speak(
          `On ${dateString}, the available slots are ${readableSlots}. Which time slot suits you best?`,
          `${dateString} തീയതിയിൽ ലഭ്യമായ സമയങ്ങൾ ഇവയാണ്: ${readableSlots}. ഇതിൽ ഏത് സമയമാണ് നിങ്ങൾക്ക് സൗകര്യം?`
        );
      } else {
        await speak(
          `On ${dateString}, available slots are ${readableSlots}. Which time slot would you prefer?`
        );
      }
      return;
    }

    // STEP 9: Slot Selection
    if (currentStep === 'SLOT_SELECT') {
      const slots = sessionData.current.availableSlots || ['10:00-10:30'];
      let chosenSlot = slots[0];

      // Match slot by spoken text
      for (const s of slots) {
        const hour = s.split(':')[0];
        if (lower.includes(hour)) {
          chosenSlot = s;
          break;
        }
      }

      sessionData.current.selectedSlot = chosenSlot;
      const doc = sessionData.current.selectedDoctor;
      const date = sessionData.current.selectedDate;

      setStep('BOOK_CONFIRM');
      if (currentLang === 'ml') {
        await speak(
          `You are booking an appointment with ${doc.fullName} on ${date} at ${chosenSlot}. Payment will be pay at hospital. Should I confirm this booking? Say yes to confirm.`,
          `ഡോക്ടർ ${doc.fullName}-മായി ${date} തീയതിയിൽ ${chosenSlot} സമയത്ത് അപ്പോയിന്റ്മെന്റ് ബുക്ക് ചെയ്യുകയാണ്. ആശുപത്രിയിൽ നേരിട്ടെത്തി പണമടയ്ക്കാം. ഇത് ഉറപ്പാക്കട്ടേ? അതെ എന്ന് പറയുക.`
        );
      } else {
        await speak(
          `You are booking an appointment with ${doc.fullName} on ${date} at ${chosenSlot}. Payment method is Pay at Hospital. Should I confirm this booking? Say yes to confirm.`
        );
      }
      return;
    }

    // STEP 10: Final Confirmation & Guest Booking
    if (currentStep === 'BOOK_CONFIRM') {
      const isConfirmed = /yes|confirm|sure|ok|അതെ|ശരി|ഉറപ്പാക്കുക/i.test(lower);
      if (!isConfirmed) {
        setStep('FINISHED');
        if (currentLang === 'ml') {
          await speak('Booking was cancelled. You can consult anytime.', 'ബുക്കിംഗ് റദ്ദാക്കിയിരിക്കുന്നു. എപ്പോൾ വേണമെങ്കിലും ബന്ധപ്പെടാം.');
        } else {
          await speak('Booking was cancelled. Feel free to restart whenever you wish.');
        }
        return;
      }

      // Execute guest booking without auth
      try {
        const payload = {
          doctorId: sessionData.current.selectedDoctor._id,
          date: sessionData.current.selectedDate,
          timeSlot: sessionData.current.selectedSlot,
          paymentMode: 'Offline',
          age: sessionData.current.age,
          gender: sessionData.current.gender,
          height: sessionData.current.height,
          weight: sessionData.current.weight,
        };

        const res = await fetch(`${API_BASE_URL}/api/appointments/guest-book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const bookResult = await res.json();
        console.log('Voice guest booking completed:', bookResult);

        if (onBookingComplete) {
          onBookingComplete(bookResult);
        }
      } catch (err) {
        console.error('Guest booking request error:', err);
      }

      setStep('FINISHED');
      if (currentLang === 'ml') {
        await speak(
          'Your appointment is successfully confirmed! You can pay at the hospital upon arrival. Wish you a speedy recovery!',
          'നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് വിജയകരമായി ഉറപ്പാക്കിയിരിക്കുന്നു! ആശുപത്രിയിൽ എത്തുമ്പോൾ നേരിട്ട് പണമടയ്ക്കാം. വേഗത്തിൽ സുഖം പ്രാപിക്കട്ടെ!'
        );
      } else {
        await speak(
          'Your appointment is confirmed! Payment will be handled directly at the hospital. Take care and get well soon!'
        );
      }
      return;
    }

    // Finished step
    if (currentStep === 'FINISHED') {
      if (currentLang === 'ml') {
        await speak('Consultation completed. You can tap the close button to return to chat.', 'കൺസൾട്ടേഷൻ പൂർത്തിയായി. ചാറ്റിലേക്ക് മടങ്ങാൻ മുകളിലെ ക്ലോസ് ബട്ടൺ അമർത്താം.');
      } else {
        await speak('Your consultation session is complete. You can close this screen to view the chat.');
      }
    }
  };

  // Setup Continuous Speech Recognition
  const startListening = useCallback(() => {
    if (isSpeakingRef.current || micMuted) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Browser SpeechRecognition not supported.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    } catch {}

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // Set language based on selection: Malayalam if 'ml', otherwise Indian English
    recognition.lang = languageRef.current === 'ml' ? 'ml-IN' : 'en-IN';

    recognition.onstart = () => {
      setEngineState('listening');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        handleUserSpokenInput(transcript);
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('SpeechRecognition error:', event.error);
      }
      if (!isSpeakingRef.current && !micMuted) {
        setEngineState('listening');
      }
    };

    recognition.onend = () => {
      // Re-trigger listening automatically if not speaking or thinking
      if (!isSpeakingRef.current && !micMuted && stepRef.current !== 'FINISHED') {
        setTimeout(() => {
          if (!isSpeakingRef.current && !micMuted) {
            try {
              recognition.start();
            } catch {}
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  }, [micMuted]);

  // Initial setup: request mic and start initial bilingual prompt
  useEffect(() => {
    setupMicAudio().then(() => {
      // Bilingual opening prompt
      const greetingEn = 'Hello! Would you like to proceed in English or Malayalam?';
      const greetingMl = 'നമസ്കാരം, നിങ്ങൾക്ക് മലയാളത്തിലാണോ അതോ ഇംഗ്ലീഷിലോ സംസാരിക്കേണ്ടത്?';

      speak(
        `${greetingEn} ... ${greetingMl}`,
        `${greetingMl} ... ${greetingEn}`
      );
    });

    return () => {
      stopCurrentSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: 99999,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Dynamic Sound Frequency Waveform */}
      <AudioWaveVisualizer
        analyser={analyser}
        state={engineState}
        language={language || 'en'}
      />

      {/* Minimal Top Control Bar */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          zIndex: 100000,
        }}
      >
        {/* Mic Toggle Button */}
        <button
          type="button"
          onClick={() => {
            const nextMuted = !micMuted;
            setMicMuted(nextMuted);
            if (nextMuted) {
              if (recognitionRef.current) {
                try {
                  recognitionRef.current.abort();
                } catch {}
              }
              setEngineState('idle');
            } else {
              startListening();
            }
          }}
          title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: micMuted ? '#f87171' : '#ffffff',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          {micMuted ? <LuMicOff size={19} /> : <LuMic size={19} />}
        </button>

        {/* Exit / Return to Chat Button */}
        <button
          type="button"
          onClick={() => {
            stopCurrentSpeech();
            if (recognitionRef.current) {
              try {
                recognitionRef.current.abort();
              } catch {}
            }
            if (onClose) onClose();
          }}
          title="Return to Chat"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          <LuX size={20} />
        </button>
      </div>
    </div>
  );
}
