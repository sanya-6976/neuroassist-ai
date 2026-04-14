import React, { useState, useEffect, useMemo } from 'react';
import { Pill, Utensils, Plus, Check, Clock, AlertCircle, Trash2, Calendar, Coffee, Apple, Sparkles, ShieldAlert, Activity, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CarePortal = () => {
  const [activeTab, setActiveTab] = useState('meds'); // 'meds' or 'diet'
  const [meds, setMeds] = useState([]);
  const [meals, setMeals] = useState([]);
  const [todaysSessions, setTodaysSessions] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: '', dosage: '', time: '', type: 'pill' });

  const mealsTodayList = useMemo(
    () => meals.filter((m) => new Date(m.timestamp).toDateString() === new Date().toDateString()),
    [meals]
  );

  useEffect(() => {
    const savedMeds = localStorage.getItem('care_meds');
    if (savedMeds) setMeds(JSON.parse(savedMeds));

    const savedMeals = localStorage.getItem('care_meals');
    if (savedMeals) setMeals(JSON.parse(savedMeals));

    // Activity signals (rule-based, safe)
    try {
      const history = JSON.parse(localStorage.getItem('parent_insights_history') || '[]');
      const today = new Date().toDateString();
      const sessionsToday = history.filter(s => new Date(s.date).toDateString() === today);
      setTodaysSessions(sessionsToday.length);
    } catch {
      setTodaysSessions(0);
    }
  }, []);

  useEffect(() => {
    if (!showAddModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowAddModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showAddModal]);

  const saveToLocal = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleAddEntry = () => {
    const name = newEntry.name.trim();
    if (!name) return;

    const entry = {
      ...newEntry,
      name,
      dosage: newEntry.dosage.trim(),
    };

    if (activeTab === 'meds') {
      const updated = [...meds, { ...entry, id: Date.now(), taken: false }];
      setMeds(updated);
      saveToLocal('care_meds', updated);
    } else {
      const updated = [...meals, { ...entry, id: Date.now(), timestamp: new Date().toISOString() }];
      setMeals(updated);
      saveToLocal('care_meals', updated);
    }
    setShowAddModal(false);
    setNewEntry({ name: '', dosage: '', time: '', type: 'pill' });
  };

  const toggleMed = (id) => {
    const updated = meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m);
    setMeds(updated);
    saveToLocal('care_meds', updated);
  };

  const deleteEntry = (id, type) => {
    if (type === 'meds') {
      const updated = meds.filter(m => m.id !== id);
      setMeds(updated);
      saveToLocal('care_meds', updated);
    } else {
      const updated = meals.filter(m => m.id !== id);
      setMeals(updated);
      saveToLocal('care_meals', updated);
    }
  };

  const medsTakenToday = meds.filter(m => m.taken).length;
  const activityScore = todaysSessions + medsTakenToday + mealsTodayList.length;
  const aiSuggestion =
    activityScore <= 1
      ? 'Low activity today. Encourage light movement (gentle stretches, short seated posture breaks).'
      : activityScore >= 5
      ? 'Great progress today! Keep the routine consistent and celebrate small wins.'
      : 'Nice steady day. Keep a calm routine with short movement breaks and hydration.';

  const dateLine = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="px-4 md:px-6 lg:px-10 xl:px-12 py-4 md:py-8 w-full max-w-[1600px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700 overflow-x-hidden">
      
      <header className="flex flex-col md:flex-row md:justify-between md:items-start gap-5 md:gap-6 lg:gap-8">
        <div className="space-y-3 min-w-0 md:max-w-[min(100%,28rem)] lg:max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Daily care</p>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">Care Portal</h1>
          <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed">
            Track medicines and meals in one place. Use the checklist for doses and log food as you go—everything stays on this device.
          </p>
        </div>
        <div
          className="flex bg-slate-100/90 p-1.5 rounded-[2rem] shadow-inner w-full md:w-auto md:min-w-[20rem] lg:min-w-[22rem] shrink-0 md:ml-auto"
          role="tablist"
          aria-label="Care sections"
        >
          <button 
            type="button"
            role="tab"
            aria-selected={activeTab === 'meds'}
            onClick={() => setActiveTab('meds')}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 md:px-7 py-3.5 rounded-[1.5rem] font-bold text-base transition-all duration-300 whitespace-nowrap ${activeTab === 'meds' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Pill className="w-5 h-5 shrink-0" aria-hidden />
            Medications
          </button>
          <button 
            type="button"
            role="tab"
            aria-selected={activeTab === 'diet'}
            onClick={() => setActiveTab('diet')}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 md:px-7 py-3.5 rounded-[1.5rem] font-bold text-base transition-all duration-300 whitespace-nowrap ${activeTab === 'diet' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-slate-200/80' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Utensils className="w-5 h-5 shrink-0" aria-hidden />
            Nutrition
          </button>
        </div>
      </header>

      {/* Quick snapshot — one horizontal row from small tablets up */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 min-h-0">
        <div className="rounded-2xl sm:rounded-3xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-white p-3 sm:p-5 shadow-sm flex items-start gap-2 sm:gap-4 min-w-0">
          <div className="rounded-xl sm:rounded-2xl bg-indigo-600 text-white p-2 sm:p-3 shadow-md shrink-0">
            <Pill className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600/90 leading-tight">Meds</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums mt-0.5 sm:mt-1 truncate">
              {meds.length ? `${medsTakenToday}/${meds.length}` : '—'}
            </p>
            <p className="hidden sm:block text-sm text-slate-500 font-medium mt-1 leading-snug">Tap the circle when a dose is done</p>
          </div>
        </div>
        <div className="rounded-2xl sm:rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-3 sm:p-5 shadow-sm flex items-start gap-2 sm:gap-4 min-w-0">
          <div className="rounded-xl sm:rounded-2xl bg-emerald-600 text-white p-2 sm:p-3 shadow-md shrink-0">
            <Utensils className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-600/90 leading-tight">Meals</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums mt-0.5 sm:mt-1">{mealsTodayList.length}</p>
            <p className="hidden sm:block text-sm text-slate-500 font-medium mt-1 leading-snug line-clamp-2">Today · {dateLine}</p>
          </div>
        </div>
        <div className="rounded-2xl sm:rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3 sm:p-5 shadow-sm flex items-start gap-2 sm:gap-4 min-w-0">
          <div className="rounded-xl sm:rounded-2xl bg-slate-800 text-white p-2 sm:p-3 shadow-md shrink-0">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-tight">Therapy</p>
            <p className="text-lg sm:text-2xl font-black text-slate-900 tabular-nums mt-0.5 sm:mt-1">{todaysSessions}</p>
            <p className="hidden sm:block text-sm text-slate-500 font-medium mt-1">Sessions today</p>
          </div>
        </div>
      </div>

      {/* Main + tips: side by side from tablet (md), not only large desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-8 lg:gap-10 md:items-start">
        
        {/* Main Content Area */}
        <div className="md:col-span-7 lg:col-span-7 xl:col-span-8 space-y-6 min-w-0 order-1">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-5 bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-100/80">
            <div className="flex items-start gap-5 min-w-0">
              <div className={`shrink-0 p-4 rounded-2xl ring-2 ring-white shadow-sm ${activeTab === 'meds' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {activeTab === 'meds' ? <Pill size={32} aria-hidden /> : <Utensils size={32} aria-hidden />}
              </div>
              <div className="min-w-0">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                  {activeTab === 'meds' ? 'Daily medications' : "Today's meals"}
                </h2>
                <p className="text-slate-500 font-semibold mt-1">{dateLine}</p>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed max-w-md">
                  {activeTab === 'meds'
                    ? 'Check off each dose when it’s taken. Add new items anytime with the + button.'
                    : 'Log what was eaten and when—helps you spot patterns alongside therapy.'}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => setShowAddModal(true)}
              aria-label={activeTab === 'meds' ? 'Add medication' : 'Log a meal'}
              className={`self-end sm:self-center shrink-0 inline-flex items-center gap-2 px-6 py-4 rounded-full text-white font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 ${activeTab === 'meds' ? 'bg-indigo-600' : 'bg-emerald-600'}`}
            >
              <Plus size={22} className="shrink-0" aria-hidden />
              <span>{activeTab === 'meds' ? 'Add med' : 'Log meal'}</span>
            </button>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {activeTab === 'meds' ? (
                meds.length === 0 ? (
                  <div className="bg-gradient-to-b from-slate-50 to-white py-16 px-6 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-5">
                    <div className="inline-flex p-5 rounded-full bg-white shadow-md border border-slate-100">
                      <AlertCircle className="w-14 h-14 text-indigo-400" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-800">No medications yet</p>
                      <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                        Add what you take and when—then tap the circle each time a dose is finished.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-indigo-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                      Add your first medication
                      <ChevronRight className="w-5 h-5" aria-hidden />
                    </button>
                  </div>
                ) : (
                  meds.map((med) => (
                    <motion.div 
                      key={med.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`group p-5 sm:p-6 rounded-3xl bg-white border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${med.taken ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100 shadow-lg shadow-slate-200/40'}`}
                    >
                      <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                        <button 
                          type="button"
                          onClick={() => toggleMed(med.id)}
                          aria-pressed={med.taken}
                          aria-label={med.taken ? `Mark ${med.name} as not taken` : `Mark ${med.name} as taken`}
                          className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${med.taken ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}
                        >
                          <Check size={22} aria-hidden />
                        </button>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`text-xl sm:text-2xl font-black truncate ${med.taken ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}`}>{med.name}</p>
                            {med.taken && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md">Done</span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                             {med.dosage ? (
                               <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">{med.dosage}</span>
                             ) : null}
                             <span className="flex items-center gap-1.5 text-slate-500 text-sm font-semibold">
                               <Clock size={15} className="shrink-0 opacity-70" aria-hidden /> {med.time || 'Any time'}
                             </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteEntry(med.id, 'meds')}
                        className="self-end sm:self-center text-slate-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                        aria-label={`Remove ${med.name}`}
                      >
                        <Trash2 size={22} />
                      </button>
                    </motion.div>
                  ))
                )
              ) : (
                mealsTodayList.length === 0 ? (
                  <div className="bg-gradient-to-b from-slate-50 to-white py-16 px-6 rounded-[3rem] border-2 border-dashed border-slate-200 text-center space-y-5">
                    <div className="inline-flex p-5 rounded-full bg-white shadow-md border border-slate-100">
                      <Apple className="w-14 h-14 text-emerald-400" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xl font-black text-slate-800">No meals logged today</p>
                      <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
                        Tap “Log meal” whenever something is eaten—time and portion optional but helpful.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-emerald-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                      Log the first meal
                      <ChevronRight className="w-5 h-5" aria-hidden />
                    </button>
                  </div>
                ) : (
                  mealsTodayList.map((meal) => (
                    <motion.div 
                      key={meal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group p-5 sm:p-6 rounded-3xl bg-white border-2 border-emerald-50/80 shadow-lg shadow-slate-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                        <div className="shrink-0 w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center ring-2 ring-white shadow-sm">
                          <Coffee size={22} aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xl sm:text-2xl font-black text-slate-800 truncate">{meal.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {meal.dosage ? (
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{meal.dosage}</span>
                            ) : null}
                            <p className="text-slate-500 text-sm font-semibold flex items-center gap-1.5">
                              <Clock size={15} className="shrink-0 opacity-70" aria-hidden />
                              {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteEntry(meal.id, 'diet')}
                        className="self-end sm:self-center text-slate-300 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50"
                        aria-label={`Remove ${meal.name}`}
                      >
                        <Trash2 size={22} />
                      </button>
                    </motion.div>
                  ))
                )
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Info Panels — scrolls independently on tall screens */}
        <aside className="md:col-span-5 lg:col-span-5 xl:col-span-4 space-y-6 lg:space-y-8 order-2 md:sticky md:top-4 lg:top-6 md:self-start max-h-none lg:max-h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:pr-1 lg:[scrollbar-width:thin]">
           {/* Daily Care Suggestions */}
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1 flex items-center gap-3">
                 <Sparkles size={22} className="text-indigo-600 shrink-0" aria-hidden />
                 Daily care suggestions
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6 pl-[34px] sm:pl-0 sm:ml-9 -mt-0.5">Simple ideas you can adapt to your day</p>
              <div className="space-y-3">
                {[
                  { label: 'Morning routine', text: 'Start with light stretching' },
                  { label: 'Therapy reminder', text: 'Do 10 min posture exercise' },
                  { label: 'Rest suggestion', text: 'Ensure proper rest intervals' },
                ].map((item) => (
                  <div key={item.label} className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
                    <div className="mt-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" aria-hidden />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{item.label}</p>
                      <p className="text-slate-800 font-bold text-[15px] leading-snug">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>

           {/* Nutrition Guidance (safe) */}
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1 flex items-center gap-3">
                 <Apple size={22} className="text-emerald-600 shrink-0" aria-hidden />
                 Nutrition guidance
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6 pl-[34px] sm:pl-0 sm:ml-9 -mt-0.5">General tips—adjust for your care team’s plan</p>
              <ul className="space-y-3">
                 {[
                   'Soft, easy-to-eat foods',
                   'Balanced diet tips',
                   'Hydration reminders',
                   'Include fruits and soft proteins',
                   'Keep child hydrated',
                 ].map((tip, i) => (
                   <li key={i} className="flex items-start gap-3 text-slate-700 font-semibold text-sm leading-relaxed rounded-xl px-3 py-2 hover:bg-emerald-50/50 transition-colors">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500 shrink-0" aria-hidden />
                      <span>{tip}</span>
                   </li>
                 ))}
              </ul>
           </div>

           {/* What NOT to do */}
           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1 flex items-center gap-3">
                 <ShieldAlert size={22} className="text-rose-600 shrink-0" aria-hidden />
                 What not to do
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6 pl-[34px] sm:pl-0 sm:ml-9 -mt-0.5">Safety first—skip these if unsure</p>
              <div className="space-y-3">
                {[
                  'Avoid forcing movements',
                  'Avoid fast or heavy exercises',
                ].map((text) => (
                  <div key={text} className="flex gap-3 p-4 bg-rose-50/50 border border-rose-100 rounded-2xl">
                    <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" aria-hidden />
                    <p className="text-rose-800 font-bold text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
           </div>

           {/* AI Suggestions (rule-based) */}
           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden ring-1 ring-white/10">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Calendar size={120} aria-hidden />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tight mb-1">AI suggestions</h3>
                <p className="text-slate-400 text-sm font-medium mb-5">Rule-based hints from your activity and care log</p>
                <div className="space-y-4">
                   <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                      <p className="text-sky-400 text-[11px] font-bold uppercase tracking-wider mb-1">Today’s activity signal</p>
                      <p className="text-4xl font-black tabular-nums">{todaysSessions}</p>
                      <p className="text-slate-400 font-semibold text-xs mt-1.5">Therapy sessions logged today</p>
                   </div>
                   <div className="p-5 border border-white/10 rounded-2xl text-slate-200 leading-relaxed text-sm bg-white/5 font-semibold">
                     {aiSuggestion}
                   </div>
                </div>
             </div>
           </div>

           {/* Disclaimer */}
           <div className="bg-amber-50 p-7 rounded-[2.25rem] border-2 border-amber-200">
              <p className="text-amber-900 font-black text-xs mb-2 uppercase tracking-wider">Disclaimer</p>
              <p className="text-amber-900/90 font-semibold text-sm leading-relaxed">
                These are general suggestions. Please consult a professional for medical advice.
              </p>
           </div>

           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden ring-1 ring-white/10">
             <div className="absolute top-0 right-0 p-8 opacity-[0.07] pointer-events-none">
                <Activity size={120} aria-hidden />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl font-black tracking-tight mb-1">Care insights</h3>
                <p className="text-slate-400 text-sm font-medium mb-5">Sample encouragement (not tied to live data)</p>
                <div className="space-y-5">
                   <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                      <p className="text-sky-400 text-[11px] font-bold uppercase tracking-wider mb-1">Weekly compliance (demo)</p>
                      <p className="text-4xl font-black tabular-nums">94%</p>
                   </div>
                   <div className="p-5 border border-white/10 rounded-2xl text-slate-300 leading-relaxed text-sm bg-white/5 font-medium">
                     <span className="text-amber-300/90 font-semibold not-italic">Note: </span>
                     Consistency in medication timing is critical for CP comfort and progress. You’re doing great!
                   </div>
                </div>
             </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-1 flex items-center gap-3">
                 <AlertCircle size={22} className="text-amber-500 shrink-0" aria-hidden />
                 Dietary tips
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-6 pl-[34px] sm:pl-0 sm:ml-9 -mt-0.5">Extra meal ideas to discuss with your clinician</p>
              <ul className="space-y-3">
                 {[
                   "Prioritize high-fiber purees",
                   "Add extra protein to morning meals",
                   "Maintain hydration between exercises"
                 ].map((tip, i) => (
                   <li key={i} className="flex items-start gap-3 text-slate-700 font-semibold text-sm leading-relaxed rounded-xl px-3 py-2 hover:bg-amber-50/40 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" aria-hidden />
                      <span>{tip}</span>
                   </li>
                 ))}
              </ul>
           </div>
        </aside>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/45 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="care-add-title"
            onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-10 w-full max-w-lg shadow-2xl border-4 border-slate-100 max-h-[min(90vh,calc(100vh-2rem))] overflow-y-auto"
            >
              <h3 id="care-add-title" className="text-2xl sm:text-3xl font-black text-slate-900">
                {activeTab === 'meds' ? 'Add medication' : 'Log a meal'}
              </h3>
              <p className="text-slate-500 font-medium mt-2 text-sm leading-relaxed">
                {activeTab === 'meds'
                  ? 'Saved only on this device. Add name first—you can fill the rest as you go.'
                  : 'We’ll stamp the time when you save. Edit time below if needed.'}
              </p>
              
              <div className="space-y-5 mt-8">
                <div>
                  <label htmlFor="care-name" className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2 px-1">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    id="care-name"
                    type="text" 
                    autoFocus
                    value={newEntry.name}
                    onChange={(e) => setNewEntry({...newEntry, name: e.target.value})}
                    placeholder={activeTab === 'meds' ? 'e.g. Baclofen' : 'e.g. Oatmeal with banana'}
                    className={`w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                      activeTab === 'meds' ? 'focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100' : 'focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
                    }`}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <label htmlFor="care-dose" className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2 px-1">
                       {activeTab === 'meds' ? 'Dosage' : 'Portion / notes'}
                    </label>
                    <input 
                      id="care-dose"
                      type="text" 
                      value={newEntry.dosage}
                      onChange={(e) => setNewEntry({...newEntry, dosage: e.target.value})}
                      placeholder={activeTab === 'meds' ? 'e.g. 5 mg' : 'e.g. ½ cup'}
                      className={`w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                        activeTab === 'meds' ? 'focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100' : 'focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="care-time" className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block mb-2 px-1">Time</label>
                    <input 
                      id="care-time"
                      type="time" 
                      value={newEntry.time}
                      onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                      className={`w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl font-bold focus:outline-none transition-all ${
                        activeTab === 'meds' ? 'focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100' : 'focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100'
                      }`}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 px-1">Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-sans text-[11px]">Esc</kbd> or tap outside to cancel</p>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleAddEntry}
                    disabled={!newEntry.name.trim()}
                    className={`flex-1 py-4 text-white font-black rounded-2xl shadow-lg transition-all active:scale-[0.98] ${
                      activeTab === 'meds' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    } disabled:opacity-45 disabled:cursor-not-allowed`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CarePortal;
