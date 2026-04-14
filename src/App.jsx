import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Voice from './components/Voice';
import Therapy from './components/Therapy';
import Learning from './components/Learning';
import AITherapy from './components/AITherapy';
import TherapyPlanner from './components/TherapyPlanner';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import PatientForm from './components/PatientForm';
import DrawGame from "./components/DrawGame";
import AIChat from "./components/AIChat";
import ParentDashboard from './components/ParentDashboard';
import NotificationBanner from './components/NotificationBanner';
import CarePortal from './components/CarePortal';
import TherapistConnect from './components/TherapistConnect';
import GuideAssistant from './components/GuideAssistant';
import AIHub from './components/AIHub';
import Settings from './components/Settings';

// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("App Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 mb-4">Something went wrong 😅</h1>
          <p className="text-xl text-slate-600 mb-8 text-wrap">The app encountered an unexpected error. Don't worry, your progress is safe!</p>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200">Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completedLearning, setCompletedLearning] = useState([]);
  const [voiceUsageCount, setVoiceUsageCount] = useState(0);
  const [lastMessage, setLastMessage] = useState("");
  const [userStatus, setUserStatus] = useState("Active");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [aiTherapyReps, setAiTherapyReps] = useState(0);
  const [streak, setStreak] = useState(() => {
    const saved = Number(localStorage.getItem('streak') || '0');
    return Number.isFinite(saved) && saved > 0 ? saved : 1;
  });
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Close sidebar drawer on route change (mobile usability)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const savedUser = localStorage.getItem('neuroassist_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const getTodayKey = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const dayDiff = (fromKey, toKey) => {
    // Keys are YYYY-MM-DD in local time.
    const [fy, fm, fd] = String(fromKey || '').split('-').map(Number);
    const [ty, tm, td] = String(toKey || '').split('-').map(Number);
    if (!fy || !fm || !fd || !ty || !tm || !td) return null;
    const from = new Date(fy, fm - 1, fd);
    const to = new Date(ty, tm - 1, td);
    const ms = to.getTime() - from.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };

  const persistStreak = (value) => {
    localStorage.setItem('streak', String(value));
    setStreak(value);
  };

  const updateStreakForToday = useCallback((reason = 'activity') => {
    const today = getTodayKey();
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    const saved = Number(localStorage.getItem('streak') || String(streak));
    const current = Number.isFinite(saved) && saved > 0 ? saved : 1;

    // Requirement: store last activity date in localStorage
    localStorage.setItem('lastActiveDate', today);

    // If it's the same day, streak unchanged
    if (lastActiveDate === today) {
      if (streak !== current) setStreak(current);
      return;
    }

    const diff = dayDiff(lastActiveDate, today);
    // If we don't have a valid previous date, start at 1
    if (diff === null) {
      persistStreak(1);
      return;
    }
    // If next day, streak +1
    if (diff === 1) {
      persistStreak(current + 1);
      return;
    }
    // If gap >1 day, reset streak
    if (diff > 1) {
      persistStreak(1);
    }
  }, [streak]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('neuroassist_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('neuroassist_user');
  };

  useEffect(() => {
    let timeoutId;
    const handleActivity = () => {
      setUserStatus(current => current === 'Needs Help' ? current : 'Active');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setUserStatus(current => current === 'Needs Help' ? current : 'Idle');
      }, 8000);
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

  const addNotification = (title, message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      addNotification("Therapy Reminder", "Consistency is the key to progress!", "info");
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [user]);

  // On app load: compare today with lastActiveDate and update streak
  useEffect(() => {
    const today = getTodayKey();
    const lastActiveDate = localStorage.getItem('lastActiveDate');
    const saved = Number(localStorage.getItem('streak') || String(streak));
    const current = Number.isFinite(saved) && saved > 0 ? saved : 1;

    if (!lastActiveDate) {
      localStorage.setItem('lastActiveDate', today);
      localStorage.setItem('streak', String(current));
      setStreak(current);
      return;
    }

    const diff = dayDiff(lastActiveDate, today);
    if (diff === 0) {
      localStorage.setItem('streak', String(current));
      setStreak(current);
      return;
    }
    if (diff === 1) {
      localStorage.setItem('lastActiveDate', today);
      persistStreak(current + 1);
      return;
    }
    if (diff > 1) {
      localStorage.setItem('lastActiveDate', today);
      persistStreak(1);
      return;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure streak updates when: therapy completed (completedTasks increases)
  const prevTasksLenRef = useRef(completedTasks.length);
  useEffect(() => {
    const prev = prevTasksLenRef.current;
    if (completedTasks.length > prev) {
      updateStreakForToday('therapy');
    }
    prevTasksLenRef.current = completedTasks.length;
  }, [completedTasks.length, updateStreakForToday]);

  // Ensure streak updates when: AI session done (aiTherapyReps increases)
  const prevRepsRef = useRef(aiTherapyReps);
  useEffect(() => {
    const prev = prevRepsRef.current;
    if (aiTherapyReps > prev) {
      updateStreakForToday('ai-session');
    }
    prevRepsRef.current = aiTherapyReps;
  }, [aiTherapyReps, updateStreakForToday]);

  const voiceClarity = voiceUsageCount > 2 ? "Excellent" : "Great";
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Auth Guard
  if (!user && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  // Basic Loading Fallback
  if (!user && isAuthPage === false) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <p className="text-2xl font-bold text-slate-400 animate-pulse">App is loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-x-hidden font-sans">
      <NotificationBanner notifications={notifications} onDismiss={dismissNotification} />
      
      {/* Auth Pages (Login/Signup) */}
      {isAuthPage ? (
        <div className="w-full flex justify-center items-center">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      ) : (
        <>
          <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} onLogout={handleLogout} />
          
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
            {/* Mobile Header */}
            <header className="lg:hidden bg-slate-900 text-white px-4 py-4 md:px-8 flex justify-between items-center sticky top-0 z-40 shadow-lg">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="p-3 hover:bg-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-400"
                  aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                >
                  {isSidebarOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                </button>
                <h1 className="text-lg md:text-xl font-black tracking-wide">NeuroAssist</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${userStatus === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span className="text-sm font-bold uppercase tracking-widest">{userStatus}</span>
              </div>
            </header>

            <ErrorBoundary>
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
                      user={user}
                    />
                  } />
                  <Route path="/patient-form" element={<PatientForm />} />
                  <Route path="/draw-game" element={<DrawGame completedTasks={completedTasks} setCompletedTasks={setCompletedTasks} />} />
                  <Route path="/voice" element={<Voice setVoiceUsageCount={setVoiceUsageCount} setLastMessage={setLastMessage} setUserStatus={setUserStatus} />} />
                  <Route path="/therapy" element={<Therapy completedTasks={completedTasks} setCompletedTasks={setCompletedTasks} />} />
                  <Route path="/learning" element={<Learning completedLearning={completedLearning} setCompletedLearning={setCompletedLearning} />} />
                  <Route path="/ai-therapy" element={<TherapyPlanner />} />
                  <Route path="/ai-therapy-session" element={<AITherapy onMovementDetected={setAiTherapyReps} />} />
                  <Route path="/ai-assistant" element={<AIChat />} />
                  <Route path="/parent-dashboard" element={
                    <ParentDashboard 
                      completedTasks={completedTasks} 
                      aiTherapyReps={aiTherapyReps} 
                      addNotification={addNotification}
                    />
                  } />
                  <Route path="/care-portal" element={<CarePortal />} />
                  <Route path="/ai-hub" element={<AIHub />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/therapist-connect" element={<TherapistConnect />} />
                  <Route path="/guide" element={<GuideAssistant />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </ErrorBoundary>
          </main>
        </>
      )}
    </div>
  );
}

export default App;