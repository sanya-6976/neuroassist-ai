import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, RotateCcw, AlertCircle, CheckCircle2, Zap, Activity } from 'lucide-react';

// ── Phrase Suggestion Engine ───────────────────────────────────────────────────
const getSuggestion = (text) => {
  if (!text) return null;
  const t = text.toLowerCase().trim();
  if (!t) return null;
  if (t.includes('wat') || t.includes('wa') || t.includes('drink')) return { phrase: 'I need water 💧', icon: '💧' };
  if (t.includes('help') || t.includes('nee') || t.includes('he')) return { phrase: 'I need help 🤝', icon: '🤝' };
  if (t.includes('hu') || t.includes('foo') || t.includes('eat') || t.includes('hun')) return { phrase: 'I am hungry 🍱', icon: '🍱' };
  if (t.includes('ba') || t.includes('toi') || t.includes('bath')) return { phrase: 'I need the bathroom 🚻', icon: '🚻' };
  if (t.includes('pain') || t.includes('hurt') || t.includes('ow')) return { phrase: 'I am in pain 🩹', icon: '🩹' };
  if (t.includes('sleep') || t.includes('tire') || t.includes('rest')) return { phrase: 'I want to rest 😴', icon: '😴' };
  if (t.includes('play') || t.includes('fun') || t.includes('game')) return { phrase: 'I want to play 🎮', icon: '🎮' };
  if (t.includes('mom') || t.includes('ma') || t.includes('mama')) return { phrase: 'I want my mom 👩', icon: '👩' };
  if (t.includes('dad') || t.includes('pa') || t.includes('papa')) return { phrase: 'I want my dad 👨', icon: '👨' };
  return null;
};

// ── Audio Visualizer Bars ─────────────────────────────────────────────────────
const AudioBars = ({ active }) => (
  <div className="flex items-end gap-[3px] h-10">
    {[4, 7, 5, 9, 6, 8, 4, 7, 5, 6, 4].map((h, i) => (
      <div
        key={i}
        className={`w-[5px] rounded-full transition-all ${active ? 'bg-red-500' : 'bg-slate-300'}`}
        style={{
          height: active ? `${Math.random() * 32 + 8}px` : `${h * 3}px`,
          animation: active ? `pulse ${0.5 + i * 0.1}s ease-in-out infinite alternate` : 'none',
        }}
      />
    ))}
  </div>
);

// ── Main Voice Component ───────────────────────────────────────────────────────
const Voice = ({ setVoiceUsageCount, setLastMessage, setUserStatus }) => {
  const [isListening, setIsListening] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [supported, setSupported] = useState(true);
  const [tick, setTick] = useState(0); // force re-render for audio bars animation

  const recognitionRef = useRef(null);
  const finalRef = useRef(''); // mutable ref so onresult always has latest
  const restartTimer = useRef(null);
  const listeningRef = useRef(false);

  const ensureMicPermission = useCallback(async () => {
    // Web Speech API uses the mic; forcing a getUserMedia call makes
    // the browser show a clear permission prompt and yields better errors.
    if (!navigator?.mediaDevices?.getUserMedia) {
      throw new Error('getUserMedia-not-supported');
    }
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      throw new Error('insecure-context');
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop — we only need the permission grant.
      stream.getTracks().forEach(t => t.stop());
    } catch (e) {
      // Normalize common browser errors.
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') throw new Error('mic-denied');
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') throw new Error('mic-not-found');
      if (name === 'NotReadableError' || name === 'TrackStartError') throw new Error('mic-busy');
      throw new Error('mic-unknown');
    } finally {
      try { stream?.getTracks?.().forEach(t => t.stop()); } catch {}
    }
  }, []);

  // Tick for audio bar animation
  useEffect(() => {
    if (!isListening) return;
    const id = setInterval(() => setTick(t => t + 1), 120);
    return () => clearInterval(id);
  }, [isListening]);

  const buildRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setSupported(false); return null; }

    const rec = new SpeechRecognition();
    rec.continuous = true;       // keep going — don't stop on silence
    rec.interimResults = true;   // show partial results live
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setErrorMsg('');
    };

    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalRef.current += chunk + ' ';
        } else {
          interim += chunk;
        }
      }
      setFinalTranscript(finalRef.current);
      setInterimTranscript(interim);

      // Propagate to dashboard
      const combined = (finalRef.current + interim).trim();
      if (setLastMessage) setLastMessage(combined);
      if (setVoiceUsageCount) setVoiceUsageCount(p => p + 1);
      if (setUserStatus) {
        if (combined.length < 4 || combined.toLowerCase().includes('help')) {
          setUserStatus('Needs Help');
        } else {
          setUserStatus('Active');
        }
      }
    };

    rec.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Silent — restart automatically (CP children speak slowly)
        if (listeningRef.current) {
          clearTimeout(restartTimer.current);
          restartTimer.current = setTimeout(() => {
            try { rec.stop(); } catch {}
          }, 300);
        }
        return;
      }
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setErrorMsg('Microphone access denied. Please allow access.');
      } else if (event.error === 'audio-capture') {
        setErrorMsg('No microphone was found. Plug in a mic or check Windows sound input settings, then try again.');
      } else if (event.error === 'network') {
        setErrorMsg('Network error. Please check your internet connection.');
      } else {
        setErrorMsg(`Mic error: ${event.error}`);
      }
      setIsListening(false);
      listeningRef.current = false;
    };

    rec.onend = () => {
      // Auto-restart if still "listening" — handles browser stopping on silence
      if (listeningRef.current) {
        clearTimeout(restartTimer.current);
        restartTimer.current = setTimeout(() => {
          try {
            rec.start();
          } catch {}
        }, 200);
      } else {
        setIsListening(false);
        setInterimTranscript('');
      }
    };

    return rec;
  }, [setLastMessage, setVoiceUsageCount, setUserStatus]);

  const startListening = async () => {
    const rec = buildRecognition();
    if (!rec) return;
    recognitionRef.current = rec;
    finalRef.current = finalTranscript; // preserve existing transcript
    try {
      setErrorMsg('');
      await ensureMicPermission();
      listeningRef.current = true;
      rec.start();
    } catch (e) {
      const msg = (() => {
        const code = e?.message || '';
        if (code === 'mic-denied') return 'Microphone access denied. Please allow access.';
        if (code === 'insecure-context') return 'Microphone requires localhost or https. Please open the app on localhost or https and try again.';
        if (code === 'mic-not-found') return 'No microphone device detected. Connect a mic and ensure it is enabled in Windows settings.';
        if (code === 'mic-busy') return 'Microphone is currently in use by another app (Zoom/Teams/etc). Close it and try again.';
        if (code === 'getUserMedia-not-supported') return 'Microphone is not available in this browser/device.';
        return 'Could not start microphone. Please check permissions and try again.';
      })();
      setErrorMsg(msg);
      listeningRef.current = false;
      setIsListening(false);
    }
  };

  const stopListening = () => {
    clearTimeout(restartTimer.current);
    setIsListening(false);
    listeningRef.current = false;
    setInterimTranscript('');
    try { recognitionRef.current?.stop(); } catch {}
  };

  const toggleListening = () => {
    isListening ? stopListening() : startListening();
  };

  const clearAll = () => {
    stopListening();
    setFinalTranscript('');
    setInterimTranscript('');
    finalRef.current = '';
    setErrorMsg('');
    if (setLastMessage) setLastMessage('');
    if (setUserStatus) setUserStatus('Active');
  };

  const speakText = (text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.85;
    utt.pitch = 1.05;
    window.speechSynthesis.speak(utt);
  };

  const applySuggestion = (phrase) => {
    finalRef.current = phrase + ' ';
    setFinalTranscript(phrase + ' ');
    setInterimTranscript('');
    if (setLastMessage) setLastMessage(phrase);
    speakText(phrase);
  };

  const combinedText = (finalTranscript + interimTranscript).trim();
  const suggestion = getSuggestion(combinedText);

  const QUICK_PHRASES = [
    { label: '💧 Water', phrase: 'I need water' },
    { label: '🤝 Help', phrase: 'I need help' },
    { label: '🍱 Food', phrase: 'I am hungry' },
    { label: '🩹 Pain', phrase: 'I am in pain' },
    { label: '😴 Tired', phrase: 'I want to rest' },
    { label: '👩 Mom', phrase: 'I want my mom' },
  ];

  if (!supported) {
    return (
      <div className="p-10 max-w-3xl mx-auto text-center">
        <div className="text-8xl mb-6">🎤</div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Mic not available</h2>
        <p className="text-xl text-slate-500 font-medium">Your browser does not support voice recognition. Use Chrome.</p>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
          🎤 Voice Assistant
        </h2>
        <p className="text-xl text-slate-500 font-medium mt-3">
          Speak slowly — we'll understand you! Even broken or quiet speech works.
        </p>
      </div>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {errorMsg && (
        <div className="flex items-start gap-4 p-5 bg-red-50 border-2 border-red-200 rounded-2xl">
          <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-bold text-lg">{errorMsg}</p>
        </div>
      )}

      {/* ── Main Mic Button ────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-6 py-8">
        <button
          onClick={toggleListening}
          className={`relative w-44 h-44 md:w-48 md:h-48 rounded-full font-black text-white shadow-2xl transition-all duration-300 focus:outline-none focus:ring-8 flex flex-col items-center justify-center gap-3 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-red-200 ring-red-200 scale-110'
              : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:scale-105'
          }`}
          aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
        >
          {/* Pulsing ring when active */}
          {isListening && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping" />
              <span className="absolute inset-2 rounded-full bg-red-400 opacity-20 animate-ping" style={{ animationDelay: '0.3s' }} />
            </>
          )}
          <div className="relative z-10 flex flex-col items-center gap-2">
            {isListening
              ? <MicOff size={52} />
              : <Mic size={52} />
            }
            <span className="text-lg font-black tracking-wide">
              {isListening ? 'STOP' : 'START'}
            </span>
          </div>
        </button>

        {/* Status label */}
        <div className={`flex items-center gap-3 px-6 py-3 rounded-full font-black text-lg border-2 transition-all ${
          isListening ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <span className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`} />
          {isListening ? 'Listening...' : 'Stopped — Tap to start'}
        </div>

        {/* Audio visualization bars */}
        {isListening && <AudioBars active={isListening} key={tick} />}
      </div>

      {/* ── Transcript Box ─────────────────────────────────────────────── */}
      <div className="bg-slate-950 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <Mic size={22} className="text-white" />
            </div>
            <h3 className="text-xl font-black text-blue-400 uppercase tracking-widest">Detected Speech</h3>
            {isListening && (
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <span key={i} className="w-2 h-2 bg-red-500 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {combinedText && (
              <button onClick={() => speakText(combinedText)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                <Volume2 size={18} /> Read Aloud
              </button>
            )}
            <button onClick={clearAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/20 transition-all">
              <RotateCcw size={16} /> Clear
            </button>
          </div>
        </div>

        <div className="min-h-[140px] flex items-center">
          {combinedText ? (
            <p className="text-4xl md:text-5xl font-bold text-white leading-relaxed">
              <span className="text-white">{finalTranscript}</span>
              <span className="text-slate-500 italic">{interimTranscript}</span>
            </p>
          ) : (
            <p className="text-2xl text-slate-600 font-medium italic">
              {isListening ? 'Start speaking — your words will appear here...' : 'Detected speech will appear here. Tap the mic to begin!'}
            </p>
          )}
        </div>
      </div>

      {/* ── AI Suggestion ──────────────────────────────────────────────── */}
      {suggestion && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-100 animate-in zoom-in duration-500">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={22} className="fill-white" />
            <p className="font-black text-emerald-100 uppercase tracking-widest text-sm">AI Suggestion</p>
          </div>
          <p className="text-4xl font-black mb-6">{suggestion.phrase}</p>
          <div className="flex gap-4 flex-wrap">
            <button onClick={() => applySuggestion(suggestion.phrase)}
              className="flex items-center gap-2 px-7 py-4 bg-white text-emerald-700 font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg">
              <CheckCircle2 size={20} /> Use This
            </button>
            <button onClick={() => speakText(suggestion.phrase)}
              className="flex items-center gap-2 px-7 py-4 bg-white/20 text-white font-black rounded-2xl text-lg hover:bg-white/30 transition-all">
              <Volume2 size={20} /> Speak It
            </button>
          </div>
        </div>
      )}

      {/* ── Quick Phrase Buttons ───────────────────────────────────────── */}
      <div>
        <h3 className="text-2xl font-black text-slate-800 mb-5 flex items-center gap-3">
          <Activity size={22} className="text-blue-600" />
          Quick Phrases
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_PHRASES.map(({ label, phrase }) => (
            <button
              key={phrase}
              onClick={() => applySuggestion(phrase)}
              className="p-4 md:p-5 lg:p-6 rounded-2xl bg-white border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 font-black text-lg md:text-xl lg:text-2xl text-slate-700 transition-all duration-300 hover:scale-105 shadow-sm text-left"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tips Banner ───────────────────────────────────────────────── */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-7 flex gap-5 items-start">
        <div className="text-4xl">💡</div>
        <div>
          <p className="font-black text-amber-800 text-lg mb-1">Tips for best results</p>
          <ul className="text-amber-700 font-medium space-y-1 text-base">
            <li>• Speak slowly — it's OK to take breaks</li>
            <li>• Short words work great (e.g., "water", "help")</li>
            <li>• Use the Quick Phrases buttons below if speaking is hard</li>
            <li>• The mic stays on — it won't stop if you pause!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Voice;
