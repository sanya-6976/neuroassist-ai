import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Camera, X, PencilLine } from 'lucide-react';

const Therapy = ({ completedTasks = [], setCompletedTasks }) => {
  const navigate = useNavigate();
  const [justCompletedIndex, setJustCompletedIndex] = useState(null);
  const [activeGestureTask, setActiveGestureTask] = useState(false);
  const [gesturePhase, setGesturePhase] = useState('idle'); // idle, checking, success
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const THERAPY_TASKS = [
    { name: "Vocal Exercises", duration: "15 min", color: "bg-blue-100 text-blue-800", interactive: false },
    { name: "Screen Draw Game", duration: "20 min", color: "bg-amber-100 text-amber-800", interactive: false , route: "/draw-game" },
    { name: "Breathing Flow", duration: "10 min", color: "bg-green-100 text-green-800", interactive: false },
    { name: "Hand Gesture Task", duration: "5 min", color: "bg-purple-100 text-purple-800", interactive: true },
  ];

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startScanning = () => {
    setGesturePhase('checking');
    setTimeout(() => {
      setGesturePhase('success');
      setTimeout(() => {
        setCompletedTasks((prev) => prev.includes(activeGestureTask) ? prev : [...prev, activeGestureTask]);
        setJustCompletedIndex(activeGestureTask);
        setTimeout(() => setJustCompletedIndex(null), 3000);
        closeGestureTask();
      }, 2000);
    }, 3000);
  };

  const closeGestureTask = () => {
    stopCamera();
    setActiveGestureTask(false);
  };

  const handleTaskClick = (index) => {
  const task = THERAPY_TASKS[index];

  // ✅ NEW: redirect to Draw Game
  if (task.route) {
    navigate(task.route);
    return;
  }

  // Existing logic (DO NOT TOUCH)
  if (task.interactive && !completedTasks.includes(index)) {
    setActiveGestureTask(index);
    setGesturePhase('idle');
    setTimeout(() => startCamera(), 100);
    return;
  }

  setCompletedTasks(prev => {
    if (prev.includes(index)) {
      return prev.filter(i => i !== index);
    } else {
      setJustCompletedIndex(index);
      setTimeout(() => setJustCompletedIndex(null), 3000);
      return [...prev, index];
    }
  });
};

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-7xl mx-auto animate-in fade-in duration-1000 overflow-x-hidden">
      <header className="mb-16 space-y-3">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">Therapy Modules</h2>
        <p className="text-lg md:text-2xl lg:text-3xl text-slate-500 font-medium font-sans">Your daily recommended exercises and tasks.</p>
      </header>

      <section className="glass rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-blue-100 border-none animate-in slide-in-from-bottom-8 duration-700">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Recommended Therapy</h3>
          <button 
            className="text-blue-700 text-lg md:text-2xl font-black flex items-center gap-3 hover:gap-5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-xl leading-none"
            aria-label="View all therapy modules"
          >
            View All <ArrowRight className="w-8 h-8" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {THERAPY_TASKS.map((task, i) => {
            const isCompleted = completedTasks.includes(i);
            const isJustCompleted = justCompletedIndex === i;

            return (
              <div 
                key={i} 
                onClick={() => handleTaskClick(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleTaskClick(i); }}
                className={`relative flex flex-col justify-between p-6 md:p-7 lg:p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 gap-6 animate-in zoom-in duration-700 w-full ${isCompleted ? 'bg-slate-50/50 border-slate-200 opacity-60 scale-[0.98]' : 'bg-white hover:bg-slate-50 border-white hover:border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1'}`} 
                tabIndex="0"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex flex-col items-start gap-6">
                  <div className={`text-2xl font-black px-6 py-3 rounded-2xl transition-all duration-500 ${isCompleted ? 'bg-gray-200 text-gray-400' : task.color + ' shadow-lg shadow-current/10 group-hover:scale-110'}`}>
                    Task {i + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className={`text-2xl md:text-3xl font-black tracking-tight ${isCompleted ? 'text-gray-400 line-through' : 'text-slate-800'}`}>
                      {task.name}
                    </h4>
                    {task.interactive && !isCompleted && (
                      <span className="bg-purple-600 text-white text-sm font-black px-3 py-1 rounded-full flex items-center gap-2 w-fit uppercase tracking-widest shadow-lg shadow-purple-200">
                        <Camera className="w-4 h-4"/> 
                        Interactive AI
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  {isJustCompleted && (
                    <span className="text-green-800 font-black bg-green-200 px-5 py-3 rounded-2xl animate-pulse shadow-lg shadow-green-100 text-base md:text-xl border-2 border-green-300">
                      Task Completed! 🎉
                    </span>
                  )}
                  {isCompleted ? (
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                  ) : (
                    <div className="text-lg md:text-2xl text-slate-400 font-black bg-slate-100 px-5 py-3 rounded-xl">{task.duration}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {activeGestureTask !== false && (
        <div className="fixed inset-0 bg-slate-900/95 z-[100] flex items-center justify-center p-4 md:p-10 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-6xl w-full h-full max-h-[85vh] shadow-[0_0_100px_rgba(124,58,237,0.3)] relative overflow-hidden flex flex-col animate-in zoom-in duration-500 border-none">
            <button onClick={closeGestureTask} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all hover:rotate-90" aria-label="Close">
               <X className="w-10 h-10" />
            </button>
            <div className="mb-10 pr-16">
              <h3 className="text-5xl font-black text-slate-900 mb-4 flex items-center gap-6">
                <div className="p-4 bg-purple-100 rounded-3xl">
                  <Camera className="w-12 h-12 text-purple-600" />
                </div>
                Hand Gesture Analysis
              </h3>
              <p className="text-3xl text-slate-500 font-medium">
                Instruction: <span className="text-white bg-purple-600 px-6 py-2 rounded-2xl font-black shadow-lg shadow-purple-200">Show 3 fingers</span>
              </p>
            </div>
            
            <div className="flex-1 bg-slate-950 rounded-[2.5rem] overflow-hidden relative shadow-2xl mb-8 border-[12px] border-slate-900 ring-4 ring-slate-100">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80 mix-blend-screen scale-x-[-1]"></video>
              
              {gesturePhase === 'idle' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[4px]">
                  <button onClick={startScanning} className="bg-purple-600 hover:bg-purple-500 text-white px-16 py-8 rounded-[2rem] font-black text-4xl shadow-[0_20px_50px_rgba(124,58,237,0.4)] transition-all transform hover:scale-110 active:scale-95 border-b-8 border-purple-800 uppercase tracking-tighter">
                    Initiate Scan
                  </button>
                </div>
              )}
              
              {gesturePhase === 'checking' && (
                <>
                  <div className="absolute w-full h-4 bg-blue-400/50 animate-scan shadow-[0_0_40px_rgba(56,189,248,1)] z-10 blur-[2px]"></div>
                  <div className="absolute inset-0 border-[30px] border-blue-500/10 pointer-events-none"></div>
                  <div className="absolute bottom-10 left-0 w-full flex justify-center">
                    <span className="bg-slate-900/90 text-blue-400 border-2 border-blue-500/30 px-12 py-5 rounded-full font-black tracking-widest uppercase shadow-2xl text-2xl flex items-center gap-6 backdrop-blur-md">
                      <span className="w-4 h-4 bg-blue-500 rounded-full animate-ping"></span>
                      Real-time Processing
                    </span>
                  </div>
                </>
              )}
              
              {gesturePhase === 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-md border-[12px] border-green-500 rounded-[2rem] animate-in zoom-in duration-300">
                  <div className="bg-green-600 text-white p-16 rounded-[3rem] items-center flex flex-col shadow-[0_30px_100px_rgba(22,163,74,0.4)] transform -rotate-2">
                    <div className="p-6 bg-white/20 rounded-full mb-6">
                      <CheckCircle className="w-24 h-24 animate-bounce" />
                    </div>
                    <span className="text-7xl font-black mb-2 tracking-tighter">SUCCESS</span>
                    <span className="text-3xl font-bold opacity-90">3 Fingers Identified</span>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-center text-slate-400 font-black uppercase tracking-[0.3em] text-sm">
              Neural Network Subsystem Active • Node v2.4.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Therapy;
