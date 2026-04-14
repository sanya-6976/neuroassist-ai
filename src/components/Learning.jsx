import React, { useState, useEffect, useRef } from 'react';
import { Volume2, ArrowLeft, ArrowRight, CheckCircle2, Star, RotateCcw, Trophy } from 'lucide-react';
import SolarSystem from './SolarSystem';

// ─── Data ─────────────────────────────────────────────────────────────────────

const SUBJECTS = [
  {
    id: 'alphabets',
    label: 'Alphabets',
    emoji: '🔤',
    description: 'Learn letters with fun examples',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    btn: 'bg-blue-600 hover:bg-blue-700',
    videoId: '0XzwB2S2Kow',
    items: [
      { letter: 'A', word: 'Apple', emoji: '🍎' },
      { letter: 'B', word: 'Ball', emoji: '⚽' },
      { letter: 'C', word: 'Cat', emoji: '🐱' },
      { letter: 'D', word: 'Dog', emoji: '🐶' },
      { letter: 'E', word: 'Elephant', emoji: '🐘' },
      { letter: 'F', word: 'Fish', emoji: '🐟' },
      { letter: 'G', word: 'Grapes', emoji: '🍇' },
      { letter: 'H', word: 'Hat', emoji: '🎩' },
      { letter: 'I', word: 'Ice Cream', emoji: '🍦' },
      { letter: 'J', word: 'Juice', emoji: '🧃' },
      { letter: 'K', word: 'Kite', emoji: '🪁' },
      { letter: 'L', word: 'Lion', emoji: '🦁' },
      { letter: 'M', word: 'Moon', emoji: '🌙' },
      { letter: 'N', word: 'Nest', emoji: '🪺' },
      { letter: 'O', word: 'Orange', emoji: '🍊' },
      { letter: 'P', word: 'Penguin', emoji: '🐧' },
      { letter: 'Q', word: 'Queen', emoji: '👸' },
      { letter: 'R', word: 'Rainbow', emoji: '🌈' },
      { letter: 'S', word: 'Sun', emoji: '☀️' },
      { letter: 'T', word: 'Tiger', emoji: '🐯' },
      { letter: 'U', word: 'Umbrella', emoji: '☂️' },
      { letter: 'V', word: 'Violin', emoji: '🎻' },
      { letter: 'W', word: 'Whale', emoji: '🐋' },
      { letter: 'X', word: 'Xylophone', emoji: '🎵' },
      { letter: 'Y', word: 'Yogurt', emoji: '🥛' },
      { letter: 'Z', word: 'Zebra', emoji: '🦓' },
    ],
  },
  {
    id: 'numbers',
    label: 'Numbers',
    emoji: '🔢',
    description: 'Learn counting with objects',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    btn: 'bg-emerald-600 hover:bg-emerald-700',
    videoId: '8mve0UoSxTo',
    items: [
      { letter: '1', word: 'One', emoji: '1️⃣', objects: ['⭐'] },
      { letter: '2', word: 'Two', emoji: '2️⃣', objects: ['⭐','⭐'] },
      { letter: '3', word: 'Three', emoji: '3️⃣', objects: ['⭐','⭐','⭐'] },
      { letter: '4', word: 'Four', emoji: '4️⃣', objects: ['🍎','🍎','🍎','🍎'] },
      { letter: '5', word: 'Five', emoji: '5️⃣', objects: ['🐶','🐶','🐶','🐶','🐶'] },
      { letter: '6', word: 'Six', emoji: '6️⃣', objects: ['🌟','🌟','🌟','🌟','🌟','🌟'] },
      { letter: '7', word: 'Seven', emoji: '7️⃣', objects: ['🍊','🍊','🍊','🍊','🍊','🍊','🍊'] },
      { letter: '8', word: 'Eight', emoji: '8️⃣', objects: ['🎈','🎈','🎈','🎈','🎈','🎈','🎈','🎈'] },
      { letter: '9', word: 'Nine', emoji: '9️⃣', objects: ['🐱','🐱','🐱','🐱','🐱','🐱','🐱','🐱','🐱'] },
      { letter: '10', word: 'Ten', emoji: '🔟', objects: ['🍭','🍭','🍭','🍭','🍭','🍭','🍭','🍭','🍭','🍭'] },
    ],
  },
  {
    id: 'colors',
    label: 'Colors & Shapes',
    emoji: '🎨',
    description: 'Learn colors and simple shapes',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
    btn: 'bg-rose-600 hover:bg-rose-700',
    videoId: 'yagt3XD8Rf0',
    items: [
      { letter: '🔴', word: 'Red', emoji: '🍒', extra: 'Circle' },
      { letter: '🟠', word: 'Orange', emoji: '🍊', extra: 'Circle' },
      { letter: '🟡', word: 'Yellow', emoji: '🌻', extra: 'Square' },
      { letter: '🟢', word: 'Green', emoji: '🍀', extra: 'Triangle' },
      { letter: '🔵', word: 'Blue', emoji: '💧', extra: 'Circle' },
      { letter: '🟣', word: 'Purple', emoji: '🍇', extra: 'Diamond' },
      { letter: '🟤', word: 'Brown', emoji: '🍫', extra: 'Rectangle' },
      { letter: '⚫', word: 'Black', emoji: '🎱', extra: 'Circle' },
      { letter: '⚪', word: 'White', emoji: '🌨️', extra: 'Circle' },
      { letter: '🩷', word: 'Pink', emoji: '🌸', extra: 'Heart' },
    ],
  },
  {
    id: 'words',
    label: 'Basic Words',
    emoji: '💬',
    description: 'Learn simple daily words',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    btn: 'bg-amber-600 hover:bg-amber-700',
    videoId: 'EPmWBQBqaHo',
    items: [
      { letter: 'Water', word: 'पानी', emoji: '💧' },
      { letter: 'Food', word: 'खाना', emoji: '🍱' },
      { letter: 'Mom', word: 'माँ', emoji: '👩' },
      { letter: 'Dad', word: 'पापा', emoji: '👨' },
      { letter: 'Help', word: 'मदद', emoji: '🤝' },
      { letter: 'Sleep', word: 'नींद', emoji: '😴' },
      { letter: 'Play', word: 'खेलना', emoji: '🎮' },
      { letter: 'Pain', word: 'दर्द', emoji: '🩹' },
      { letter: 'Happy', word: 'खुश', emoji: '😊' },
      { letter: 'Sad', word: 'दुखी', emoji: '😢' },
    ],
  },
  {
    id: 'activities',
    label: 'Daily Activities',
    emoji: '🌟',
    description: 'Learn common daily actions',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700',
    btn: 'bg-violet-600 hover:bg-violet-700',
    videoId: 'fGLbFj2E1Mo',
    items: [
      { letter: 'Eat', word: 'Eating food', emoji: '🍽️' },
      { letter: 'Drink', word: 'Drink water', emoji: '🥤' },
      { letter: 'Walk', word: 'Walk slowly', emoji: '🚶' },
      { letter: 'Sleep', word: 'Time to rest', emoji: '🛏️' },
      { letter: 'Bath', word: 'Take a bath', emoji: '🛁' },
      { letter: 'Brush', word: 'Brush teeth', emoji: '🪥' },
      { letter: 'Read', word: 'Reading books', emoji: '📖' },
      { letter: 'Draw', word: 'Drawing art', emoji: '✏️' },
      { letter: 'Clap', word: 'Clap hands!', emoji: '👏' },
      { letter: 'Smile', word: 'Always smile', emoji: '😁' },
    ],
  },
  {
    id: 'solarSystem',
    label: 'Solar System',
    emoji: '🪐',
    description: 'Learn about planets in a fun way',
    color: 'from-slate-900 to-indigo-900',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-800',
    btn: 'bg-slate-900 hover:bg-slate-800',
    videoId: null,
    items: [],
  },
];

// ─── Helper ────────────────────────────────────────────────────────────────────

const speak = (text, lang = 'en-US') => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = lang;
  utt.rate = 0.85;
  utt.pitch = 1.1;
  window.speechSynthesis.speak(utt);
};

// ─── Subject Card ──────────────────────────────────────────────────────────────

const SubjectCard = ({ subject, onSelect, isCompleted }) => (
  <button
    onClick={() => onSelect(subject)}
    className={`relative w-full text-left rounded-[2rem] p-6 md:p-8 bg-white border-2 ${subject.border} shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-hidden focus:outline-none focus:ring-4 focus:ring-offset-4 focus:ring-blue-400`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
    <div className="text-7xl mb-5">{subject.emoji}</div>
    <h3 className={`text-3xl font-black tracking-tight ${subject.text} mb-2`}>{subject.label}</h3>
    <p className="text-slate-500 font-medium text-lg">
      {subject.description || `${subject.items.length} lessons inside`}
    </p>
    {isCompleted && (
      <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2">
        <CheckCircle2 size={24} />
      </div>
    )}
  </button>
);

// ─── Detail View ──────────────────────────────────────────────────────────────

const DetailView = ({ subject, onBack, onComplete, isCompleted }) => {
  const [idx, setIdx] = useState(0);
  const [showGame, setShowGame] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameQ, setGameQ] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const item = subject.items[idx];
  const total = subject.items.length;

  const autoSpeak = () => {
    const phrase = subject.id === 'alphabets'
      ? `This is ${item.letter}. ${item.letter} for ${item.word}.`
      : subject.id === 'numbers'
      ? `Number ${item.letter}. ${item.word}.`
      : subject.id === 'words'
      ? `${item.letter} means ${item.word}.`
      : `${item.letter}. ${item.word}.`;
    speak(phrase);
  };

  useEffect(() => { autoSpeak(); }, [idx]);

  const next = () => idx < total - 1 ? setIdx(i => i + 1) : setShowGame(true);
  const prev = () => idx > 0 && setIdx(i => i - 1);

  // --- Mini game ---
  const TOTAL_GAME_Q = Math.min(5, total);
  const [gameItems] = useState(() => {
    const shuffled = [...subject.items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_GAME_Q);
  });

  const buildChoices = (correctItem) => {
    const others = subject.items.filter(i => i.letter !== correctItem.letter);
    const picks = others.sort(() => Math.random() - 0.5).slice(0, 2);
    return [...picks, correctItem].sort(() => Math.random() - 0.5);
  };

  const [choices] = useState(() => gameItems.map(item => buildChoices(item)));

  const handleChoice = (letter) => {
    if (chosen !== null) return;
    setChosen(letter);
    if (letter === gameItems[gameQ].letter) {
      setGameScore(s => s + 1);
      speak('Correct! Well done!');
    } else {
      speak('Try again next time!');
    }
    setTimeout(() => {
      if (gameQ + 1 < TOTAL_GAME_Q) {
        setGameQ(q => q + 1);
        setChosen(null);
      } else {
        setGameOver(true);
        if (!isCompleted) onComplete(subject.id);
      }
    }, 1200);
  };

  if (showGame && !gameOver) {
    const q = gameItems[gameQ];
    return (
      <div className="p-6 md:p-12 max-w-3xl mx-auto animate-in fade-in duration-500">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-bold text-xl mb-10 group">
          <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" /> Back to Subjects
        </button>
        <div className={`p-3 rounded-2xl inline-block bg-gradient-to-r ${subject.color} text-white font-black text-sm uppercase tracking-widest mb-8 px-6`}>
          🎮 Mini Game — Question {gameQ + 1} / {TOTAL_GAME_Q}
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Which one is <span className={subject.text}>"{q.letter}"</span>?</h2>
        <div className="text-9xl text-center my-10">{q.emoji}</div>
        <div className="grid grid-cols-3 gap-6">
          {choices[gameQ].map(c => (
            <button
              key={c.letter}
              onClick={() => handleChoice(c.letter)}
              className={`p-6 rounded-2xl text-3xl font-black border-4 transition-all text-center ${
                chosen === null ? 'border-slate-200 hover:border-blue-400 hover:scale-105 bg-white' :
                c.letter === q.letter ? 'border-green-500 bg-green-50 text-green-700 scale-105' :
                chosen === c.letter ? 'border-red-400 bg-red-50 text-red-600' :
                'border-slate-100 bg-white opacity-50'
              }`}
            >
              {c.letter}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="p-6 md:p-12 max-w-3xl mx-auto text-center animate-in zoom-in duration-500">
        <div className="text-9xl mb-8">{gameScore >= 4 ? '🏆' : gameScore >= 2 ? '⭐' : '💪'}</div>
        <h2 className="text-5xl font-black text-slate-900 mb-4">
          {gameScore >= 4 ? 'Amazing!' : gameScore >= 2 ? 'Good Job!' : 'Keep Trying!'}
        </h2>
        <p className="text-3xl font-bold text-slate-600 mb-12">You got <span className={subject.text}>{gameScore}</span> out of {TOTAL_GAME_Q} correct!</p>
        <div className="flex gap-6 justify-center">
          <button onClick={onBack} className="flex items-center gap-3 px-10 py-5 rounded-2xl border-2 border-slate-200 font-black text-xl hover:bg-slate-50 transition-all">
            <ArrowLeft size={24} /> All Subjects
          </button>
          <button onClick={() => { setShowGame(false); setIdx(0); setGameOver(false); setChosen(null); setGameScore(0); setGameQ(0); }}
            className={`flex items-center gap-3 px-10 py-5 rounded-2xl ${subject.btn} text-white font-black text-xl transition-all`}>
            <RotateCcw size={24} /> Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-slate-900 font-bold text-xl group">
          <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" /> Subjects
        </button>
        <span className={`px-6 py-2 rounded-full bg-gradient-to-r ${subject.color} text-white font-black uppercase tracking-widest text-sm`}>
          {subject.label}
        </span>
        <span className="text-slate-400 font-bold text-xl">{idx + 1} / {total}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full mb-12 overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${subject.color} rounded-full transition-all duration-700`}
          style={{ width: `${((idx + 1) / total) * 100}%` }} />
      </div>

      {/* Main card */}
      <div className={`${subject.bg} border-4 ${subject.border} rounded-[3rem] p-12 md:p-16 text-center shadow-xl mb-10`}>
        <div className="text-[8rem] md:text-[12rem] leading-none font-black tracking-tighter" style={{ lineHeight: 1 }}>
          {item.letter}
        </div>
        <div className="text-9xl my-8">{item.emoji}</div>
        <div className={`text-5xl font-black ${subject.text}`}>{item.word}</div>
        {subject.id === 'numbers' && item.objects && (
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {item.objects.map((o, i) => <span key={i} className="text-5xl">{o}</span>)}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <button onClick={prev} disabled={idx === 0}
          className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-xl transition-all ${idx === 0 ? 'opacity-30 cursor-not-allowed bg-slate-100' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
          <ArrowLeft size={24} /> Prev
        </button>

        <button onClick={autoSpeak}
          className={`flex items-center gap-3 px-8 py-5 rounded-2xl bg-gradient-to-r ${subject.color} text-white font-black text-xl shadow-lg hover:scale-105 transition-all`}>
          <Volume2 size={28} /> Speak Again
        </button>

        <button onClick={next}
          className={`flex items-center gap-3 px-8 py-5 rounded-2xl font-black text-xl transition-all ${subject.btn} text-white shadow-lg hover:scale-105`}>
          {idx === total - 1 ? <><Trophy size={24} /> Play Game</> : <>Next<ArrowRight size={24} /></>}
        </button>
      </div>

      {/* Video section */}
      <div className="mt-16">
        <h3 className="text-3xl font-black text-slate-800 mb-6 flex items-center gap-3">
          🎬 Watch & Learn
        </h3>
        <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-video bg-slate-900">
          <iframe
            width="100%" height="100%"
            src={`https://www.youtube.com/embed/${subject.videoId}?rel=0&modestbranding=1`}
            title={`${subject.label} Video`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const Learning = ({ completedLearning = [], setCompletedLearning }) => {
  const [activeSubject, setActiveSubject] = useState(null);

  const handleComplete = (id) => {
    if (!completedLearning.includes(id)) {
      setCompletedLearning(prev => [...prev, id]);
    }
  };

  const progressPct = Math.round((completedLearning.length / SUBJECTS.length) * 100);

  if (activeSubject) {
    if (activeSubject.id === 'solarSystem') {
      return (
        <SolarSystem
          onBack={() => setActiveSubject(null)}
          onComplete={() => handleComplete('solarSystem')}
          isCompleted={completedLearning.includes('solarSystem')}
        />
      );
    }
    return (
      <DetailView
        subject={activeSubject}
        onBack={() => setActiveSubject(null)}
        onComplete={handleComplete}
        isCompleted={completedLearning.includes(activeSubject.id)}
      />
    );
  }

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-7xl mx-auto animate-in fade-in duration-1000 overflow-x-hidden">
      <header className="mb-14 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
              Learning Zone 📚
            </h2>
            <p className="text-lg md:text-2xl text-slate-500 font-medium mt-4 max-w-2xl">
              Big, fun, and easy lessons — just for you! Tap a subject to start learning.
            </p>
          </div>
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-slate-100 w-full md:w-auto md:min-w-[240px]">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-2">Overall Progress</p>
            <p className="text-5xl font-black text-slate-900">{progressPct}<span className="text-2xl text-slate-400">%</span></p>
            <div className="w-full h-3 bg-slate-100 rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-slate-400 text-sm font-bold mt-2">{completedLearning.length} / {SUBJECTS.length} done</p>
          </div>
        </div>

        {/* Stars row */}
        <div className="flex gap-3 flex-wrap">
          {completedLearning.map(id => (
            <span key={id} className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-full font-bold text-sm">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              {SUBJECTS.find(s => s.id === id)?.label}</span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            onSelect={setActiveSubject}
            isCompleted={completedLearning.includes(subject.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Learning;
