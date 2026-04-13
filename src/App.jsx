import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Voice from './components/Voice';
import Therapy from './components/Therapy';
import Learning from './components/Learning';
import AITherapy from './components/AITherapy';

function App() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedLearning, setCompletedLearning] = useState([]);
  const [voiceUsageCount, setVoiceUsageCount] = useState(0);
  const [lastMessage, setLastMessage] = useState("");
  const [userStatus, setUserStatus] = useState("Active");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiTherapyReps, setAiTherapyReps] = useState(0);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    let timeoutId;
    
    const handleActivity = () => {
      setUserStatus(current => current === 'Needs Help' ? current : 'Active');
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setUserStatus(current => current === 'Needs Help' ? current : 'Idle');
      }, 8000); // 8 seconds of inactivity sets status to Idle for demo purposes
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);

    handleActivity();

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      clearTimeout(timeoutId);
    };
  }, []);

  const streak = 12 + Math.floor(completedTasks.length / 3) + Math.floor(completedLearning.length / 3);
  const voiceClarity = voiceUsageCount > 2 ? "Excellent" : (voiceUsageCount > 0 ? "Outstanding" : "Great");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar - responsive behavior handled inside Sidebar.jsx via props */}
      <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />
      
      <main className="flex-1 overflow-y-auto relative">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors focus:ring-4 focus:ring-amber-400"
              aria-label="Toggle Menu"
            >
              {isSidebarOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
            <h1 className="text-2xl font-bold">NeuroAssist</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              userStatus === 'Active' ? 'bg-green-500' :
              userStatus === 'Idle' ? 'bg-amber-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-bold uppercase tracking-widest">{userStatus}</span>
          </div>
        </header>

        <div className="animate-in fade-in duration-700">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={
            <Dashboard 
              completedTasks={completedTasks} 
              completedLearning={completedLearning}
              streak={streak} 
              voiceClarity={voiceClarity} 
              lastMessage={lastMessage} 
              userStatus={userStatus}
              aiTherapyReps={aiTherapyReps}
            />
          } />
          <Route path="/voice" element={
            <Voice 
              setVoiceUsageCount={setVoiceUsageCount} 
              setLastMessage={setLastMessage} 
              setUserStatus={setUserStatus}
            />
          } />
          <Route path="/therapy" element={
            <Therapy 
              completedTasks={completedTasks} 
              setCompletedTasks={setCompletedTasks} 
            />
          } />
          <Route path="/learning" element={
            <Learning 
              completedLearning={completedLearning} 
              setCompletedLearning={setCompletedLearning} 
            />
          } />
          <Route path="/ai-therapy" element={
            <AITherapy
              onMovementDetected={(reps) => {
                setAiTherapyReps(reps);
                setUserStatus('Active');
              }}
            />
          } />
        </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
