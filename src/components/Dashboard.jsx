import React from 'react';
import { Activity, Flame, Trophy, BookOpen, Brain } from 'lucide-react';

const StatCard = ({ title, value, subtitle, icon, highlight }) => (
  <div className={`p-8 rounded-3xl bg-white shadow-sm border-2 ${highlight ? 'border-blue-700' : 'border-slate-100'} hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 focus-within:ring-4 focus-within:ring-blue-700 group animate-in zoom-in duration-700`} tabIndex="0">
    <div className="flex items-start justify-between mb-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{title}</h3>
        <p className="text-xl text-gray-500 mt-2 font-medium">{subtitle}</p>
      </div>
      <div className={`p-5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${highlight ? 'bg-blue-700 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-blue-700'}`}>
        {icon}
      </div>
    </div>
    <div className="text-6xl font-black text-slate-900 tracking-tight">
      {value}
    </div>
  </div>
);

const Dashboard = ({ completedTasks = [], completedLearning = [], streak = 12, voiceClarity = "Great", lastMessage = "", userStatus = "Active", aiTherapyReps = 0 }) => {
  const therapyGoal = Math.min(100, 40 + (completedTasks.length * 20)); // Base 40% + 20% per task
  const learningGoal = Math.min(100, (completedLearning.length * 34)); // ~34% per video module
  
  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-1000">
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
        <div className="space-y-3">
          <h2 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight">Welcome back, Alex!</h2>
          <p className="text-2xl md:text-3xl text-slate-500 font-medium font-sans">Here is your daily activity overview.</p>
        </div>
        
        <div className={`px-6 py-4 rounded-2xl border-4 font-bold text-xl flex items-center gap-4 shadow-sm transition-all duration-500 scale-100 ${
          userStatus === 'Active' ? 'bg-green-50 text-green-700 border-green-200' :
          userStatus === 'Idle' ? 'bg-amber-50 text-amber-700 border-amber-200' :
          'bg-red-100 text-red-800 border-red-300 ring-4 ring-red-100 scale-105'
        }`}>
          <div className={`relative w-4 h-4 flex items-center justify-center`}>
            {userStatus === 'Needs Help' && <span className="absolute w-6 h-6 bg-red-400 rounded-full animate-ping opacity-75"></span>}
            <span className={`relative w-4 h-4 rounded-full ${
              userStatus === 'Active' ? 'bg-green-500 animate-pulse' :
              userStatus === 'Idle' ? 'bg-amber-500' :
              'bg-red-600'
            }`}></span>
          </div>
          Status: {userStatus}
          
          {userStatus === 'Needs Help' && (
            <span className="ml-2 bg-red-600 text-white text-sm px-3 py-1 rounded-full animate-pulse uppercase tracking-wider">
              Emergency
            </span>
          )}
        </div>
      </header>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${lastMessage ? 'lg:grid-cols-4' : 'lg:grid-cols-4'} gap-10 mb-16`}>
        <StatCard 
          title="Therapy Goal" 
          value={`${therapyGoal}%`} 
          subtitle="Tasks completed" 
          icon={<Trophy className="w-10 h-10" />} 
          highlight={true}
        />
        <StatCard 
          title="Learning Progress" 
          value={`${learningGoal}%`} 
          subtitle="Modules finished" 
          icon={<BookOpen className="w-10 h-10" />} 
          highlight={learningGoal > 0}
        />
        <StatCard 
          title="Active Streak" 
          value={`${streak} Days`} 
          subtitle="Keep it up!" 
          icon={<Flame className="w-10 h-10" />} 
        />
        
        {lastMessage ? (
          <div className="p-8 rounded-3xl bg-blue-700 text-white shadow-2xl shadow-blue-200 hover:shadow-blue-300 transition-all duration-500 flex flex-col justify-center animate-in zoom-in duration-700 border-2 border-transparent">
            <h3 className="text-xl font-bold text-blue-100 mb-3 uppercase tracking-widest">Last Message</h3>
            <p className="text-3xl italic font-bold leading-tight line-clamp-3">"{lastMessage}"</p>
          </div>
        ) : (
          <StatCard 
            title="Voice Clarity" 
            value={voiceClarity} 
            subtitle="Latest assessment" 
            icon={<Activity className="w-10 h-10" />} 
          />
        )}
      </div>

      {/* AI Therapy Reps banner */}
      <div className="mt-0 p-8 rounded-3xl bg-gradient-to-r from-violet-700 to-blue-700 text-white shadow-2xl shadow-violet-200 border-2 border-transparent flex flex-col md:flex-row items-center justify-between gap-6 animate-in zoom-in duration-700">
        <div className="flex items-center gap-6">
          <div className="p-5 rounded-2xl bg-white/15 shadow-lg">
            <Brain className="w-12 h-12" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-violet-100 uppercase tracking-widest mb-1">AI Therapy</h3>
            <p className="text-lg text-violet-200 font-medium">Movement reps detected this session</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-8xl font-black tracking-tighter leading-none">{aiTherapyReps}</div>
          <p className="text-violet-200 text-lg font-medium mt-1">Arm raises</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
