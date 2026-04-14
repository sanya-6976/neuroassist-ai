import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Volume2, Sparkles } from 'lucide-react';

const PLANETS = [
  { key: 'sun', name: 'Sun', emoji: '☀️', color: 'bg-amber-400', ring: 'ring-amber-200', text: 'The Sun gives us light and warmth.' },
  { key: 'mercury', name: 'Mercury', emoji: '☿️', color: 'bg-slate-400', ring: 'ring-slate-200', text: 'Mercury is the closest planet to the Sun.' },
  { key: 'venus', name: 'Venus', emoji: '♀️', color: 'bg-yellow-300', ring: 'ring-yellow-100', text: 'Venus is a very hot planet.' },
  { key: 'earth', name: 'Earth', emoji: '🌍', color: 'bg-blue-500', ring: 'ring-blue-200', text: 'This is Earth. We live here.' },
  { key: 'mars', name: 'Mars', emoji: '♂️', color: 'bg-rose-500', ring: 'ring-rose-200', text: 'Mars is called the red planet.' },
  { key: 'jupiter', name: 'Jupiter', emoji: '♃', color: 'bg-orange-300', ring: 'ring-orange-100', text: 'Jupiter is the biggest planet.' },
  { key: 'saturn', name: 'Saturn', emoji: '🪐', color: 'bg-amber-300', ring: 'ring-amber-100', text: 'Saturn has big rings around it.' },
  { key: 'uranus', name: 'Uranus', emoji: '♅', color: 'bg-cyan-400', ring: 'ring-cyan-200', text: 'Uranus is a cold, icy planet.' },
  { key: 'neptune', name: 'Neptune', emoji: '♆', color: 'bg-indigo-600', ring: 'ring-indigo-200', text: 'Neptune is a windy, blue planet.' },
];

const speak = (text) => {
  if (!text || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.85;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
};

const SolarSystem = ({ onBack, onComplete, isCompleted }) => {
  const [idx, setIdx] = useState(0);

  const current = useMemo(() => PLANETS[idx], [idx]);

  useEffect(() => {
    speak(`${current.name}. ${current.text}`);
  }, [current.name, current.text]);

  const next = () => setIdx(i => Math.min(i + 1, PLANETS.length - 1));
  const prev = () => setIdx(i => Math.max(i - 1, 0));

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-5xl mx-auto animate-in fade-in duration-700 overflow-x-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black transition-all duration-300"
        >
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white font-black uppercase tracking-widest text-[11px]">
          <Sparkles size={16} className="text-amber-300" />
          Solar System
        </div>
        <div className="text-slate-400 font-black text-sm">
          {idx + 1} / {PLANETS.length}
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">🪐 Solar System</h2>
        <p className="text-lg md:text-xl text-slate-500 font-bold mt-2">Learn about planets in a fun way</p>
      </div>

      <div className="bg-slate-950 rounded-[2.75rem] p-6 md:p-10 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_10%,rgba(99,102,241,0.6),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.5),transparent_40%),radial-gradient(circle_at_40%_90%,rgba(245,158,11,0.45),transparent_40%)]" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          <button
            onClick={() => speak(`${current.name}. ${current.text}`)}
            className={`w-56 h-56 md:w-72 md:h-72 rounded-full ${current.color} ring-8 ${current.ring} shadow-[0_30px_80px_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center select-none`}
            aria-label={`Planet: ${current.name}`}
          >
            <span className="text-7xl md:text-8xl drop-shadow">{current.emoji}</span>
          </button>

          <div className="text-center max-w-2xl">
            <div className="flex items-center justify-center gap-3 mb-3">
              <h3 className="text-4xl md:text-5xl font-black">{current.name}</h3>
              <button
                onClick={() => speak(`${current.name}. ${current.text}`)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300"
                aria-label="Speak again"
              >
                <Volume2 size={20} />
              </button>
            </div>
            <p className="text-lg md:text-2xl font-bold text-slate-200 leading-relaxed">{current.text}</p>
          </div>

          <div className="w-full flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={prev}
              disabled={idx === 0}
              className={`flex-1 md:flex-none md:min-w-[220px] px-6 py-5 rounded-2xl font-black text-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                idx === 0 ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <ArrowLeft size={22} /> Previous
            </button>
            <button
              onClick={next}
              disabled={idx === PLANETS.length - 1}
              className={`flex-1 md:flex-none md:min-w-[220px] px-6 py-5 rounded-2xl font-black text-xl transition-all duration-300 flex items-center justify-center gap-3 ${
                idx === PLANETS.length - 1 ? 'bg-white/5 text-white/40 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              Next <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch">
        <button
          onClick={() => {
            if (!isCompleted) onComplete?.();
          }}
          disabled={isCompleted}
          className={`flex-1 px-8 py-5 rounded-2xl font-black text-xl transition-all duration-300 flex items-center justify-center gap-3 ${
            isCompleted
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200 cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-200/30 active:scale-[0.99]'
          }`}
        >
          <CheckCircle2 size={22} />
          {isCompleted ? 'Learned!' : 'Mark as Learned'}
        </button>
        <div className="flex-1 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <p className="text-amber-900 font-black text-sm uppercase tracking-widest mb-1">Tip</p>
          <p className="text-amber-800 font-bold text-sm md:text-base">Tap the planet to hear the message again.</p>
        </div>
      </div>
    </div>
  );
};

export default SolarSystem;

