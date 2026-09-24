import API_BASE_URL from '../config';

let audioCtx = null;
let currentSource = null;
let currentAudioElement = null;
let analyserNode = null;

export function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function getVoiceAnalyser() {
  const ctx = getAudioContext();
  if (ctx && !analyserNode) {
    analyserNode = ctx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.85;
  }
  return analyserNode;
}

/**
 * Stop any current audio playback immediately.
 */
export function stopCurrentSpeech() {
  if (currentAudioElement) {
    try {
      currentAudioElement.pause();
      currentAudioElement.currentTime = 0;
    } catch {}
    currentAudioElement = null;
  }
  if (currentSource) {
    try {
      currentSource.stop();
      currentSource.disconnect();
    } catch {}
    currentSource = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Synthesize and play speech via backend OpenAI TTS endpoint (/api/voice/tts).
 * Connects the audio output to the AnalyserNode so the frequency waveform visualizer animates in sync!
 * Returns a Promise that resolves when speech finishes playing.
 */
export async function playOpenAiTTS(text, options = {}) {
  const {
    voice = 'nova',
    language = 'en',
    onStart = () => {},
    onEnd = () => {},
    onError = () => {},
  } = options;

  stopCurrentSpeech();

  if (!text || !text.trim()) {
    onEnd();
    return;
  }

  // Clean text from Markdown or parentheticals
  const cleanedText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\(.*?\)/g, '')
    .replace(/[#_`]/g, '')
    .trim();

  try {
    const response = await fetch(`${API_BASE_URL}/api/voice/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: cleanedText,
        voice: voice || 'nova',
        language: language || 'en',
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI TTS responded with status ${response.status}`);
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    currentAudioElement = audio;

    // Connect to Web Audio Analyser
    try {
      const ctx = getAudioContext();
      if (ctx) {
        const source = ctx.createMediaElementSource(audio);
        const analyser = getVoiceAnalyser();
        if (analyser) {
          source.connect(analyser);
          analyser.connect(ctx.destination);
          currentSource = source;
        } else {
          source.connect(ctx.destination);
        }
      }
    } catch (e) {
      console.warn('Web Audio node connection warning:', e);
    }

    return new Promise((resolve) => {
      audio.onplay = () => {
        onStart();
      };

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudioElement = null;
        onEnd();
        resolve();
      };

      audio.onerror = (e) => {
        console.error('Audio playback error, falling back:', e);
        URL.revokeObjectURL(audioUrl);
        currentAudioElement = null;
        onError(e);
        // Fallback to browser TTS if audio playback fails
        fallbackBrowserTTS(cleanedText, language, onStart, onEnd, resolve);
      };

      audio.play().catch((playErr) => {
        console.warn('Autoplay prevented or failed:', playErr);
        fallbackBrowserTTS(cleanedText, language, onStart, onEnd, resolve);
      });
    });
  } catch (err) {
    console.warn('Backend OpenAI TTS call failed, using browser speech fallback:', err);
    return new Promise((resolve) => {
      fallbackBrowserTTS(cleanedText, language, onStart, onEnd, resolve);
    });
  }
}

function fallbackBrowserTTS(text, language, onStart, onEnd, resolve) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    resolve();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === 'ml' ? 'ml-IN' : 'en-IN';
  utterance.rate = 0.95;
  utterance.onstart = () => onStart();
  utterance.onend = () => {
    onEnd();
    resolve();
  };
  utterance.onerror = () => {
    onEnd();
    resolve();
  };
  window.speechSynthesis.speak(utterance);
}
