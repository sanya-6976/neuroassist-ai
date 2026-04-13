import React, { useState, useRef } from 'react';
import { Activity, Mic, MicOff, Volume2 } from 'lucide-react';

const Voice = ({ setVoiceUsageCount, setLastMessage, setUserStatus }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimResult, setInterimResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef(null);

  const toggleListening = () => {
    console.log("Start Session button clicked");
    
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg('');
      setTranscript('');
      setInterimResult('');
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      console.log("Transcript:", text);
      setTranscript(text);
      if (setLastMessage) setLastMessage(text);
      if (setVoiceUsageCount) setVoiceUsageCount(prev => prev + 1);

      // Simulate confusing speech -> Needs Help status
      if (setUserStatus) {
        if (text.length < 5 || text.toLowerCase().includes('help')) {
          setUserStatus("Needs Help");
        } else {
          setUserStatus("Active"); // reset out of Needs Help
        }
      }
    };

    recognition.onerror = (event) => {
      console.log(event.error);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access was denied. Please allow microphone permissions.');
      } else {
        setErrorMsg(`Error occurred: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 1000);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.log(e);
      setErrorMsg('Could not start microphone.');
    }
  };

  const speakOutput = () => {
    if (!transcript) return;
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const getSuggestion = (text) => {
    if (!text) return null;
    const lowerText = text.toLowerCase().trim();
    if (lowerText === '') return null;
    if (lowerText.includes('wa') || lowerText.includes('wat')) return 'I need water.';
    if (lowerText.includes('nee') || lowerText.includes('he') || lowerText.includes('help')) return 'I need help.';
    if (lowerText.includes('hu') || lowerText.includes('foo') || lowerText.includes('eat')) return 'I am hungry.';
    if (lowerText.includes('ba') || lowerText.includes('toi')) return 'I need to use the bathroom.';
    return 'I need help.';
  };

  const suggestedText = getSuggestion(transcript);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-1000">
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div className="space-y-3">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Voice Assistant</h2>
          <p className="text-2xl md:text-3xl text-slate-500 font-medium">Speak commands and interact seamlessly.</p>
        </div>
        <button 
          onClick={toggleListening}
          className={`${isListening ? 'bg-red-500 text-white ring-8 ring-red-100 scale-105' : 'bg-amber-400 text-slate-900 hover:bg-amber-500 hover:scale-105 active:scale-95'} px-10 py-6 rounded-3xl font-black text-3xl shadow-xl transition-all duration-300 flex items-center gap-5 focus:outline-none focus:ring-4 focus:ring-slate-900 shadow-amber-200/50`}
          aria-label={isListening ? "Stop Voice Session" : "Start Voice Session"}
        >
          {isListening ? <MicOff className="w-10 h-10 animate-pulse" /> : <Mic className="w-10 h-10" />}
          {isListening ? "Stop Session" : "Start Session"}
        </button>
      </header>

      <section className="glass rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-blue-100 border-none animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <h3 className="text-4xl font-black text-slate-900 flex items-center gap-5">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Mic className="w-10 h-10 text-blue-700" />
            </div>
            AI Speech Console
          </h3>
          {transcript && (
            <button 
              onClick={speakOutput}
              className="bg-blue-700 text-white px-8 py-5 rounded-2xl font-black text-2xl flex items-center gap-4 hover:bg-blue-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
              aria-label="Speak Output"
            >
              <Volume2 className="w-8 h-8" />
              Speak Output
            </button>
          )}
        </div>
        
        {errorMsg && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl mb-6 font-bold text-lg border-2 border-red-200" role="alert">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="flex-1 bg-slate-950 rounded-[2rem] p-10 min-h-[300px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <h4 className="text-xl font-black text-blue-400 mb-6 uppercase tracking-widest flex items-center gap-4">
                  Input Stream
                  {isListening && (
                    <span className="flex gap-1 items-center">
                      <span className="w-2 h-4 bg-red-500 animate-pulse rounded-full"></span>
                      <span className="w-2 h-6 bg-red-500 animate-pulse rounded-full delay-75"></span>
                      <span className="w-2 h-4 bg-red-500 animate-pulse rounded-full delay-150"></span>
                    </span>
                  )}
                </h4>
                <div className="text-4xl md:text-5xl font-bold text-white leading-tight min-h-[1.2em]">
                  {transcript || interimResult ? (
                    <>
                      <span className="text-white">{transcript}</span>
                      <span className="text-slate-500">{transcript ? ' ' + interimResult : interimResult}</span>
                    </>
                  ) : (
                    <span className="text-slate-600 font-medium">System ready... awaiting voice input</span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-12 bg-white/5 p-4 rounded-2xl">
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setTranscript(''); setInterimResult(''); }}
                    className="text-slate-400 font-black text-lg hover:text-white uppercase tracking-widest transition-colors px-4 py-2"
                  >
                    Clear Path
                  </button>
                  <button 
                    onClick={() => { if (setUserStatus) setUserStatus("Active"); }}
                    className="text-green-400 font-black text-lg hover:text-green-300 uppercase tracking-widest transition-colors px-4 py-2 border border-green-400/20 rounded-xl"
                  >
                    Reset System
                  </button>
                </div>
                <div className="hidden md:flex items-center gap-3 text-slate-500 uppercase tracking-tighter text-sm font-bold">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Node Secure
                </div>
              </div>
            </div>
          </div>
          
          {transcript && suggestedText && !isProcessing && (
            <div className="flex-1 bg-blue-700 rounded-[2rem] p-10 min-h-[300px] shadow-2xl shadow-blue-200 relative overflow-hidden animate-in zoom-in duration-500">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-xl font-black text-blue-100 mb-6 uppercase tracking-widest flex items-center gap-3">
                    <Activity className="w-8 h-8" />
                    Correction Engine
                  </h4>
                  <div className="text-5xl font-black text-white leading-tight">
                    {suggestedText}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setTranscript(suggestedText);
                    const utterance = new SpeechSynthesisUtterance("Suggestion applied");
                    utterance.rate = 1.2;
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="w-full mt-10 bg-white text-blue-700 px-10 py-6 rounded-2xl font-black text-2xl hover:bg-slate-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-4"
                >
                  Apply Corrected Phrase
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Voice;
