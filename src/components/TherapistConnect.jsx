import React, { useState, useEffect, useRef } from 'react';
import { Video, Calendar, MessageSquare, Mic, MicOff, VideoOff, PhoneOff, User, Clock, ChevronRight, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TherapistConnect = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [activeTab, setActiveTab] = useState('booking'); // 'booking' or 'notes'

  const videoRef = useRef(null);

  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => setSessionTime(prev => prev + 1), 1000);
    } else {
      setSessionTime(0);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const upcomingSlots = [
    { id: 1, date: 'Tue, Apr 15', time: '10:00 AM', expert: 'Dr. Sarah Wilson', focus: 'Physiotherapy' },
    { id: 2, date: 'Fri, Apr 18', time: '02:30 PM', expert: 'Dr. Mark Thompson', focus: 'Speech Therapy' },
    { id: 3, date: 'Mon, Apr 21', time: '09:00 AM', expert: 'Dr. Emily Chen', focus: 'Occupational Therapy' },
  ];

  const recentNotes = [
    { id: 1, date: 'Apr 10', content: 'Focus on slow neck rotations this week. Consistency is improving.', author: 'Dr. Sarah Wilson' },
    { id: 2, date: 'Apr 05', content: 'Patient showed great progress in arm extension. Recommended increase in reps.', author: 'Dr. Sarah Wilson' }
  ];

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 overflow-x-hidden">
      
      {!sessionActive ? (
        <>
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                 <div className="p-3 bg-blue-100 rounded-2xl">
                    <Video className="w-10 h-10 text-blue-700" />
                 </div>
                 <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Therapist Connect</h1>
              </div>
              <p className="text-lg md:text-2xl text-slate-500 font-medium font-sans">Professional guidance, anytime, anywhere.</p>
            </div>
            <button 
              onClick={() => setSessionActive(true)}
              className="group relative px-8 md:px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white text-lg md:text-2xl font-black rounded-3xl shadow-[0_10px_40px_rgba(79,70,229,0.3)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-4 overflow-hidden w-full md:w-auto justify-center"
            >
              <Video className="w-8 h-8 fill-indigo-200" />
              JOIN ACTIVE SESSION
              <div className="absolute inset-0 bg-white/20 w-1/2 translate-x-[-150%] skew-x-12 group-hover:animate-[shine_1s_ease-in-out_infinite]" />
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking & Schedule */}
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 flex flex-col justify-between">
               <div>
                  <div className="flex items-center justify-between mb-10">
                     <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Upcoming Slots</h2>
                     <Calendar className="text-blue-500 w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                     {upcomingSlots.map((slot) => (
                       <div key={slot.id} className="p-6 rounded-3xl bg-slate-50 border-2 border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all cursor-pointer">
                          <div className="flex items-center gap-5">
                             <div className="w-14 h-14 bg-white rounded-2xl flex flex-col items-center justify-center font-bold text-slate-400 text-xs shadow-sm group-hover:text-blue-600">
                                {slot.date.split(',')[0]}
                                <span className="text-lg leading-none mt-1">{slot.date.split(' ')[2]}</span>
                             </div>
                             <div>
                                <p className="text-xl font-black text-slate-800 tracking-tight">{slot.expert}</p>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{slot.focus} • {slot.time}</p>
                             </div>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                       </div>
                     ))}
                  </div>
               </div>
               <button className="mt-10 py-6 border-4 border-dashed border-slate-200 rounded-3xl text-xl font-black text-slate-400 hover:border-blue-200 hover:text-blue-500 transition-all flex items-center justify-center gap-3 group">
                  <Plus /> BOOK NEW CONSULTATION
               </button>
            </div>

            {/* Insights & Recent Notes */}
            <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
               <div className="absolute bottom-0 right-0 p-10 opacity-5">
                  <MessageSquare size={160} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                        <Info className="text-sky-400" />
                     </div>
                     <h2 className="text-3xl font-black uppercase tracking-tight">Specialist Notes</h2>
                  </div>
                  <div className="space-y-6">
                     {recentNotes.map((note) => (
                       <div key={note.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                          <div className="flex justify-between items-center mb-3">
                             <p className="text-sky-400 text-xs font-black uppercase tracking-widest">{note.author}</p>
                             <span className="text-[10px] text-slate-500 font-bold">{note.date}</span>
                          </div>
                          <p className="text-lg text-slate-300 leading-relaxed font-medium italic">"{note.content}"</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-[100] bg-slate-950 flex flex-col px-4 md:px-8 lg:px-12 py-4 md:py-6 overflow-x-hidden"
        >
          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8 px-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                   <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <div>
                   <h3 className="text-white text-2xl font-black">Dr. Sarah Wilson</h3>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Clinical Physiotherapist</p>
                </div>
             </div>
             <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-white font-mono text-2xl border border-white/10">
                {formatTime(sessionTime)}
             </div>
          </div>

          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 relative pb-32">
             {/* Therapist Video (Main) */}
             <div className="relative bg-slate-900 rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                {/* Mock Image for Therapist */}
                <div className="w-48 h-48 bg-blue-100 rounded-full flex items-center justify-center border-8 border-white/10">
                   <User size={120} className="text-blue-300" />
                </div>
                <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                   <span className="text-white font-bold tracking-widest uppercase text-sm">Therapist Stream</span>
                </div>
             </div>

             {/* Self Video (Small or Split) */}
             <div className="relative bg-slate-800 rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl flex items-center justify-center">
                {isVideoOff ? (
                  <div className="text-slate-500 flex flex-col items-center gap-4">
                     <VideoOff size={64} />
                     <p className="font-bold uppercase tracking-widest text-xs">Camera is Off</p>
                  </div>
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                     <User size={120} className="text-slate-700" />
                  </div>
                )}
                <div className="absolute bottom-8 left-8 z-20 flex items-center gap-3">
                   <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                   <span className="text-white font-bold tracking-widest uppercase text-sm">Your Stream</span>
                </div>
             </div>
          </div>

          {/* Controls Bar */}
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-2xl border-2 border-white/10 p-4 md:p-6 rounded-[2.5rem] flex items-center gap-6 md:gap-10 shadow-2xl">
             <button 
               onClick={() => setIsMuted(!isMuted)}
               className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
             >
                {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
             </button>
             <button 
               onClick={() => setIsVideoOff(!isVideoOff)}
               className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
             >
                {isVideoOff ? <VideoOff size={32} /> : <Video size={32} />}
             </button>
             <button className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all">
                <MessageSquare size={32} />
             </button>
             <button 
               onClick={() => setSessionActive(false)}
               className="px-10 h-20 bg-red-600 text-white rounded-[2rem] flex items-center gap-4 font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-900/40"
             >
                <PhoneOff size={28} />
                END CALL
             </button>
          </div>
        </motion.div>
      )}

      {/* Styles for shine effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          100% {
            transform: translateX(150%) skewX(12deg);
          }
        }
      `}} />
    </div>
  );
};

export default TherapistConnect;
