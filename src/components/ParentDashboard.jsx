import React, { useState, useEffect } from 'react';
import { 
  User, 
  Activity, 
  TrendingUp, 
  Lightbulb, 
  Calendar, 
  Video, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Utensils, 
  Coffee, 
  Heart,
  ChevronRight,
  Brain,
  Star,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

import SmartNotifications from './SmartNotifications';

const ParentDashboard = ({ completedTasks = [], aiTherapyReps = 0, addNotification }) => {
  const [patientInfo, setPatientInfo] = useState({
    fullName: "Alex",
    age: "8",
    severityLevel: "Moderate",
    cpType: "Spastic"
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedInfo = localStorage.getItem('patient_info');
    if (savedInfo) setPatientInfo(JSON.parse(savedInfo));

    const savedHistory = localStorage.getItem('parent_insights_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Welcome notification
    if (addNotification) {
      addNotification("Welcome, Caregiver", "Viewing child's therapy progress and guidance.", "info");
    }
  }, []);

  // Calculate daily stats
  const today = new Date().toDateString();
  const todaysSessions = history.filter(session => new Date(session.date).toDateString() === today);
  const totalSessionTime = todaysSessions.reduce((acc, curr) => acc + (curr.sessionTime || 0), 0);
  const totalTasksToday = todaysSessions.reduce((acc, curr) => acc + (curr.tasksCompleted || 0), 0);

  // Therapy Goal for Smart Notifications
  const therapyGoal = Math.min(100, 40 + (completedTasks.length * 20));

  // Rule-based logic for improvement
  const weeklySessions = history.filter(session => {
    const sessionDate = new Date(session.date);
    const diffTime = Math.abs(new Date() - sessionDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  });
  const isImproving = weeklySessions.length >= 2;

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight">Parent Dashboard</h1>
          <p className="text-xl text-slate-500 font-medium mt-2">Complete awareness of your child's therapeutic journey.</p>
        </div>
        <div className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-indigo-100">
          <Calendar size={24} />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <SmartNotifications 
        therapyGoal={therapyGoal} 
        userStatus="Active" // Parents are usually active when on dashboard
        user={{ name: patientInfo.fullName }} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Child Overview Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50 flex flex-col justify-between h-full relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <User size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-1">Child Overview</h3>
            <p className="text-slate-500 font-bold mb-8">Basic Profile</p>
            
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Name</p>
                 <p className="text-2xl font-black text-slate-800">{patientInfo.fullName}</p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Age</p>
                   <p className="text-2xl font-black text-slate-800">{patientInfo.age} yrs</p>
                </div>
                <div className="flex-1 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Severity</p>
                   <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                     patientInfo.severityLevel === 'Severe' ? 'bg-red-50 text-red-600' :
                     patientInfo.severityLevel === 'Moderate' ? 'bg-amber-50 text-amber-600' :
                     'bg-emerald-50 text-emerald-600'
                   }`}>
                     {patientInfo.severityLevel}
                   </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Activity Summary */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50 h-full relative group">
           <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Activity size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-1">Daily Activity</h3>
            <p className="text-slate-500 font-bold mb-8">Today's Performance</p>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center">
                  <p className="text-4xl font-black text-emerald-700">{totalTasksToday}</p>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Exercises</p>
               </div>
               <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-center">
                  <p className="text-4xl font-black text-indigo-700">{Math.floor(totalSessionTime / 60)}m</p>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Total Time</p>
               </div>
               <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center justify-center text-center">
                  <p className="text-4xl font-black text-amber-700">{todaysSessions.length}</p>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mt-1">AI Sessions</p>
               </div>
               <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center text-center">
                  <p className="text-4xl font-black text-rose-700">{completedTasks.length}</p>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mt-1">Draw Score</p>
               </div>
            </div>
        </div>

        {/* Progress Tracking */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 text-sky-400 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest mb-1">Progress Tracking</h3>
              <p className="text-slate-400 font-bold mb-8">Weekly Trends</p>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <p className="text-xl font-bold">Weekly Goal</p>
                    <p className="text-3xl font-black text-sky-400">{isImproving ? '75%' : '40%'}</p>
                  </div>
                  <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/5 p-1">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isImproving ? 'bg-sky-400' : 'bg-amber-400'}`} style={{ width: isImproving ? '75%' : '40%' }}></div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all duration-500 scale-100 ${
                  isImproving ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <div className={`p-3 rounded-xl ${isImproving ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                    {isImproving ? <TrendingUp size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <p className="font-bold text-lg uppercase tracking-widest">{isImproving ? 'Improving' : 'Stable'}</p>
                    <p className="text-xs opacity-70">Based on recent activity levels</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Performance History Chart */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border-2 border-slate-50 flex flex-col h-full">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h3 className="text-2xl font-black text-slate-800 uppercase tracking-widest leading-none">Performance History</h3>
                 <p className="text-slate-500 font-bold mt-1">Accuracy trends across sessions</p>
              </div>
              <TrendingUp className="text-emerald-500 w-10 h-10 bg-emerald-50 p-2 rounded-xl" />
           </div>

           <div className="flex-1 flex items-end justify-between gap-4 min-h-[250px] px-2 mb-6">
              {history.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                  <Activity size={48} className="opacity-20" />
                  <p className="font-bold">No session history yet</p>
                </div>
              ) : (
                history.slice(-7).map((session, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="w-full relative">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${session.accuracy || 70}%` }}
                        className={`w-full rounded-2xl transition-all duration-500 shadow-lg cursor-pointer group-hover:brightness-110 ${
                          session.type === 'physio' ? 'bg-indigo-500 shadow-indigo-100' : 'bg-rose-500 shadow-rose-100'
                        }`}
                      >
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {session.accuracy || 70}%
                         </div>
                      </motion.div>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate w-full text-center">
                      {new Date(session.date).toLocaleDateString([], {month: 'short', day: 'numeric'})}
                    </div>
                  </div>
                ))
              )}
           </div>
           
           <div className="flex gap-6 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Physio</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Draw Game</span>
              </div>
           </div>
        </div>

        {/* Therapy Insights & AI Coach Summary Grid */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                    <Lightbulb size={24} />
                 </div>
                 <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Weekly Insights</h3>
              </div>
              <div className="space-y-4">
                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <Star className="text-amber-400 fill-amber-400 shrink-0" />
                    <p className="font-bold text-slate-700">Best accuracy this week: {history.length > 0 ? Math.max(...history.map(s => s.accuracy || 0)) : 0}%</p>
                 </div>
                 <div className="p-5 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2 opacity-80">
                       <Brain size={16} />
                       <span className="text-[10px] font-black uppercase tracking-widest">AI Prediction</span>
                    </div>
                    <p className="font-bold italic">"Consistency is key. 2 more sessions to reach your weekly streak goal!"</p>
                 </div>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                       <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">Last Session</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                    <p className="text-3xl font-black text-emerald-600">{history.length > 0 ? history[history.length - 1].accuracy : 0}%</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="flex-1 bg-slate-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Duration</p>
                    <p className="text-xl font-bold text-slate-700">{history.length > 0 ? Math.floor(history[history.length-1].sessionTime / 60) || 1 : 0}m</p>
                 </div>
                 <div className="flex-1 bg-slate-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                    <p className="text-xl font-bold text-emerald-600">Stable</p>
                 </div>
              </div>
           </div>
        </div>
      </div>


      {/* Parent Guidance Section */}
      <div className="bg-white p-10 lg:p-16 rounded-[3rem] shadow-xl border-2 border-slate-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
           <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">What Parents Should Do</h2>
              <p className="text-xl text-slate-500 font-medium mt-2">Daily guidance for optimal progress at home.</p>
           </div>
           <div className="p-4 bg-rose-50 text-rose-500 rounded-3xl shadow-sm animate-pulse">
              <Heart size={40} fill="#f43f5e" className="opacity-20" />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {/* Daily Routine */}
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                    <Clock size={24} />
                 </div>
                 <h4 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Daily Routine</h4>
              </div>
              <ul className="space-y-5">
                 {[
                   { icon: <TrendingUp size={18} />, text: "Morning active stretch (15m)", time: "8:00 AM" },
                   { icon: <Activity size={18} />, text: "AI Therapy session", time: "11:00 AM" },
                   { icon: <Coffee size={18} />, text: "Relaxed rest time", time: "2:00 PM" }
                 ].map((item, idx) => (
                   <li key={idx} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:scale-[1.02] transition-transform">
                      <div className="flex items-center gap-4 font-bold text-slate-700">
                         {item.icon}
                         {item.text}
                      </div>
                      <span className="text-xs bg-white px-3 py-1 rounded-full border border-slate-200 font-black text-slate-400 uppercase">{item.time}</span>
                   </li>
                 ))}
              </ul>
           </div>

           {/* Diet Tips */}
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <Utensils size={24} />
                 </div>
                 <h4 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Nutritional Guidance</h4>
              </div>
              <ul className="space-y-5">
                 {[
                   "Prioritize soft, easy-to-chew foods",
                   "Include calcium-rich items (milk, yogurt)",
                   "Ensure high-protein balanced meals",
                   "Stay hydrated throughout the day"
                 ].map((tip, idx) => (
                   <li key={idx} className="flex items-start gap-4 p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 font-bold text-slate-700">
                      <div className="mt-1">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      </div>
                      {tip}
                   </li>
                 ))}
              </ul>
           </div>

           {/* Simple Guidance */}
           <div className="space-y-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Lightbulb size={24} />
                 </div>
                 <h4 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Expert Guidance</h4>
              </div>
              <ul className="space-y-5">
                 {[
                   "Encourage slow, controlled movements",
                   "Avoid forcing any exercise beyond comfort",
                   "Maintain consistent positive reinforcement",
                   "Keep a calm, focused environment"
                 ].map((tip, idx) => (
                   <li key={idx} className="flex items-start gap-4 p-5 bg-blue-50/30 rounded-2xl border border-blue-100 font-bold text-slate-700 italic">
                      {tip}
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>

      {/* Therapist Connect Section */}
      <div className="mt-12 p-10 bg-slate-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/5 -skew-x-12 translate-x-1/2"></div>
        <div className="flex-1 space-y-4 relative z-10">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                 <MessageSquare size={32} className="text-sky-400" />
              </div>
              <h2 className="text-4xl font-black tracking-tight">Therapist Connect</h2>
           </div>
           <p className="text-xl text-slate-400 font-medium max-w-lg">
             Need a professional opinion? Connect with your assigned therapist instantly for guidance or a progress review.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
           <button className="px-8 py-5 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-sky-900/40 group">
              <Video size={24} />
              START VIDEO SESSION
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
           <button className="px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-3xl border border-white/10 transition-all flex items-center justify-center gap-3">
              <ShieldCheck size={24} className="text-emerald-400" />
              REQUEST CONSULTATION
           </button>
        </div>
      </div>

    </div>
  );
};

export default ParentDashboard;
