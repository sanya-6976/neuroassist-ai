import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy, BookOpen, Brain, Activity, Flame, Zap,
  ArrowRight, Sun, Moon, Star, Heart, CheckCircle2, Clock
} from 'lucide-react';
import SmartNotifications from './SmartNotifications';

// ── Quick Action Card ──────────────────────────────────────────────────────────
const QuickCard = ({ emoji, label, sub, path, color }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className={`group relative w-full text-left p-7 rounded-3xl border-2 ${color.border} ${color.bg} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${color.ring} overflow-hidden`}
    >
      <div className="text-5xl mb-4">{emoji}</div>
      <p className={`text-2xl font-black ${color.text} tracking-tight`}>{label}</p>
      <p className="text-base font-medium text-slate-500 mt-1">{sub}</p>
      <div className={`absolute bottom-5 right-5 w-10 h-10 ${color.iconBg} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-2`}>
        <ArrowRight size={18} className={color.iconText} />
      </div>
    </button>
  );
};

// ── Stat Pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, icon, color }) => (
  <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl ${color.bg} border-2 ${color.border}`}>
    <div className={`w-10 h-10 rounded-xl ${color.iconBg} flex items-center justify-center`}>
      {React.cloneElement(icon, { size: 20, className: color.iconText })}
    </div>
    <div>
      <p className={`text-2xl font-black ${color.text} leading-none`}>{value}</p>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Progress Ring ─────────────────────────────────────────────────────────────
const ProgressRing = ({ pct, size = 120, stroke = 10, color = '#3b82f6', label }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <p className="text-3xl font-black text-slate-900 -mt-[${size/2 + 8}px]" style={{ marginTop: `-${size/2 + 26}px`, position: 'relative', zIndex: 1, fontSize: '1.5rem' }}>{pct}%</p>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest -mt-2">{label}</p>
    </div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = ({
  completedTasks = [],
  completedLearning = [],
  streak = 12,
  voiceClarity = 'Great',
  lastMessage = '',
  userStatus = 'Active',
  aiTherapyReps = 0,
  user,
}) => {
  const navigate = useNavigate();
  const [patientInfo, setPatientInfo] = useState(null);
  const [parentInsights, setParentInsights] = useState([]);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const info = localStorage.getItem('patient_info');
    if (info) setPatientInfo(JSON.parse(info));
    const hist = localStorage.getItem('parent_insights_history');
    if (hist) setParentInsights(JSON.parse(hist));
    const h = new Date().getHours();
    setGreeting(h < 12 ? '🌅 Good morning' : h < 17 ? '☀️ Good afternoon' : '🌙 Good evening');
  }, []);

  const therapyGoal = Math.min(100, 40 + completedTasks.length * 20);
  const learningGoal = Math.min(100, completedLearning.length * 34);
  const firstName = user?.name?.split(' ')[0] || patientInfo?.fullName?.split(' ')[0] || 'Alex';

  const quickLinks = [
    { emoji: '🧠', label: 'AI Hub', sub: 'All AI tools', path: '/ai-hub', color: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', ring: 'focus:ring-blue-300', iconBg: 'bg-blue-600', iconText: 'text-white' } },
    { emoji: '🏋️', label: 'Therapy', sub: 'Today\'s exercises', path: '/therapy', color: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', ring: 'focus:ring-emerald-300', iconBg: 'bg-emerald-600', iconText: 'text-white' } },
    { emoji: '📚', label: 'Learning', sub: 'ABCs & 123s', path: '/learning', color: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', ring: 'focus:ring-amber-300', iconBg: 'bg-amber-500', iconText: 'text-white' } },
    { emoji: '👩‍⚕️', label: 'Parent Console', sub: 'Track progress', path: '/parent-dashboard', color: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-800', ring: 'focus:ring-violet-300', iconBg: 'bg-violet-600', iconText: 'text-white' } },
  ];

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-6xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700 overflow-x-hidden">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="text-base md:text-xl font-bold text-slate-400 uppercase tracking-widest mb-1">{greeting}</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            {firstName}! <span className="text-blue-600">👋</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium mt-3 max-w-lg">
            Let's keep up the great work today. You're doing amazing!
          </p>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-3 px-5 md:px-6 py-3 md:py-4 rounded-2xl border-2 font-bold text-base md:text-lg flex-shrink-0 ${
          userStatus === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
          userStatus === 'Idle' ? 'bg-amber-50 border-amber-200 text-amber-700' :
          'bg-red-50 border-red-200 text-red-700'
        }`}>
          <span className={`w-3 h-3 rounded-full ${
            userStatus === 'Active' ? 'bg-emerald-500 animate-pulse' :
            userStatus === 'Idle' ? 'bg-amber-500' : 'bg-red-500 animate-ping'
          }`} />
          {userStatus}
        </div>
      </div>

      {/* ── Smart Notifications ───────────────────────────────────── */}
      <SmartNotifications therapyGoal={therapyGoal} userStatus={userStatus} user={user} />

      {/* ── Stats Row ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatPill label="Therapy Goal" value={`${therapyGoal}%`} icon={<Trophy />}
          color={{ bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-600', iconText: 'text-white', text: 'text-blue-700' }} />
        <StatPill label="Learning" value={`${learningGoal}%`} icon={<BookOpen />}
          color={{ bg: 'bg-amber-50', border: 'border-amber-100', iconBg: 'bg-amber-500', iconText: 'text-white', text: 'text-amber-700' }} />
        <StatPill label="Streak" value={`${streak}d`} icon={<Flame />}
          color={{ bg: 'bg-rose-50', border: 'border-rose-100', iconBg: 'bg-rose-500', iconText: 'text-white', text: 'text-rose-600' }} />
        <StatPill label="AI Reps" value={aiTherapyReps} icon={<Brain />}
          color={{ bg: 'bg-violet-50', border: 'border-violet-100', iconBg: 'bg-violet-600', iconText: 'text-white', text: 'text-violet-700' }} />
      </div>

      {/* ── Main 2-col Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left: Progress Rings */}
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:shadow-lg transition-all">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-3">
            <Star className="text-amber-400 fill-amber-400" size={24} />
            Today's Progress
          </h2>
          <div className="flex justify-around items-center flex-wrap gap-8">
            <ProgressRing pct={therapyGoal} color="#3b82f6" label="Therapy" />
            <ProgressRing pct={learningGoal} color="#f59e0b" label="Learning" />
            <ProgressRing pct={Math.min(100, aiTherapyReps * 5)} color="#8b5cf6" label="AI Moves" />
          </div>
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <p className="text-slate-500 font-medium">
              {completedTasks.length + completedLearning.length} total activities completed
            </p>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Zap className="text-blue-600 fill-blue-600" size={24} />
            Quick Launch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickLinks.map(q => <QuickCard key={q.path} {...q} />)}
          </div>
        </div>
      </div>

      {/* ── Motivational Banner ───────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-8 md:p-10 overflow-hidden text-white">
        <div className="absolute top-0 right-0 text-[160px] opacity-5 select-none leading-none">💪</div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <p className="text-blue-300 font-black uppercase tracking-widest text-sm">Daily Motivation</p>
            <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight max-w-lg">
              "Every small step counts.<br/>You are stronger than you think!"
            </h3>
            <p className="text-slate-400 font-medium">Keep going, {firstName}. Your effort inspires everyone!</p>
          </div>
          <button onClick={() => navigate('/ai-hub')}
            className="flex-shrink-0 flex items-center justify-center gap-3 px-6 md:px-8 py-4 md:py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/20 w-full md:w-auto">
            Go to AI Hub <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* ── Recent Activity ───────────────────────────────────────── */}
      {parentInsights.length > 0 && (
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <Clock size={22} className="text-slate-400" />
              Recent Activity
            </h2>
            <button onClick={() => navigate('/parent-dashboard')}
              className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {parentInsights.slice().reverse().slice(0, 4).map((insight, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">
                  #{parentInsights.length - idx}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{insight.exercise}</p>
                  <p className="text-xs text-slate-400 font-medium">
                    {new Date(insight.date).toLocaleDateString()} · {new Date(insight.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Patient Summary (compact) ───────────────────────────── */}
      {patientInfo && (
        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm">
          <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
            <Heart size={22} className="text-rose-400 fill-rose-400" />
            Patient Profile
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Name', value: patientInfo.fullName },
              { label: 'Age', value: `${patientInfo.age} yrs` },
              { label: 'CP Type', value: `${patientInfo.cpType} CP` },
              { label: 'Severity', value: patientInfo.severityLevel },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-slate-800 capitalize">{value}</p>
              </div>
            ))}
          </div>
          {patientInfo.goalsOfTherapy && (
            <div className="mt-5 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Therapy Goal</p>
              <p className="text-slate-700 font-medium italic">"{patientInfo.goalsOfTherapy}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
