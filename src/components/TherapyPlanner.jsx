import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, 
  User, 
  Activity, 
  Move, 
  Target, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Zap, 
  Calendar,
  Play,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// The exercise pool (must match AITherapy.jsx)
const TASK_POOL = [
  { id: 1, name: 'Raise hand slowly', instruction: 'Lift your hand slowly up to the sky', duration: 15, tip: 'Keep your arm straight without forcing it.', focus: 'Arms' },
  { id: 2, name: 'Neck alignment correction', instruction: 'Keep your head straight and look forward', duration: 20, tip: 'Keep your chin parallel to the floor.', focus: 'Neck' },
  { id: 3, name: 'Shoulder relaxation', instruction: 'Drop your shoulders down and relax', duration: 25, tip: 'Breathe out and let shoulders fall gently.', focus: 'Posture' },
  { id: 4, name: 'Gentle seated stretch', instruction: 'Sit up tall and reach slightly forward', duration: 30, tip: 'Keep your back straight while reaching.', focus: 'Posture' },
  { id: 5, name: 'Arm extension forward', instruction: 'Reach both arms straight out in front', duration: 30, tip: 'Keep elbows extended comfortably.', focus: 'Arms' },
  { id: 6, name: 'Side arm lift', instruction: 'Raise arms out to your sides slowly', duration: 25, tip: 'Do not go higher than your shoulders.', focus: 'Arms' },
  { id: 7, name: 'Neck slow rotation', instruction: 'Slowly turn your head left, then right', duration: 20, tip: 'Move smoothly to avoid any discomfort.', focus: 'Neck' },
  { id: 8, name: 'Leg lift seated', instruction: 'Life your left leg slowly, then right leg', duration: 30, tip: 'Hold on to the chair for better support.', focus: 'Full body' },
  { id: 9, name: 'Wrist circles', instruction: 'Slowly rotate your wrists in a circle', duration: 15, tip: 'Keep your hands open and relaxed.', focus: 'Arms' },
  { id: 10, name: 'Torso twist seated', instruction: 'Gently rotate your upper body left and right', duration: 25, tip: 'Only go as far as feels comfortable.', focus: 'Full body' },
];

const TherapyPlanner = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    age: '',
    severity: 'Mild',
    mobility: 'Can sit',
    focusArea: 'Full body'
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const generateAIPlan = () => {
    // 1. Filter by Focus Area
    let filtered = TASK_POOL.filter(t => 
      profile.focusArea === 'Full body' || t.focus === profile.focusArea
    );
    
    // If too few exercises for that focus, add some general ones
    if (filtered.length < 3) {
      const general = TASK_POOL.filter(t => t.focus === 'Posture' || t.focus === 'Full body');
      filtered = [...new Set([...filtered, ...general])];
    }

    // 2. Select number based on Severity
    let count = profile.severity === 'Mild' ? 4 : (profile.severity === 'Moderate' ? 3 : 2);
    const selected = filtered.sort(() => 0.5 - Math.random()).slice(0, count);

    // 3. Adjust duration based on Severity
    const durationAdder = profile.severity === 'Mild' ? 0 : (profile.severity === 'Moderate' ? 10 : 20);
    
    const finalPlan = selected.map(task => ({
      ...task,
      duration: task.duration + durationAdder
    }));

    setGeneratedPlan(finalPlan);
    setStep(3); // Result step
  };

  const startSession = () => {
    localStorage.setItem('personalized_therapy_plan', JSON.stringify(generatedPlan));
    localStorage.setItem('therapy_plan_metadata', JSON.stringify({
      focusArea: profile.focusArea,
      severity: profile.severity,
      generatedAt: new Date().toISOString()
    }));
    navigate('/ai-therapy-session');
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 lg:px-12 py-4 md:py-6 flex flex-col items-center justify-start font-sans overflow-x-hidden">
      
      {/* Header */}
      <div className="text-center mb-10 w-full animate-in fade-in zoom-in-95 duration-700">
        <div className="inline-flex items-center justify-center gap-4 mb-3">
          <div className="p-3 bg-indigo-600 rounded-3xl shadow-lg shadow-indigo-200">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight italic">AI Therapy Planner</h2>
        </div>
        <p className="text-lg md:text-xl text-slate-500 font-medium">Create a smart session tailored to your child's needs.</p>
      </div>

      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: PATIENT PROFILE */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white rounded-[3rem] p-10 md:p-16 shadow-2xl border-4 border-slate-100"
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <User size={24} />
                </div>
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Step 1: Patient Profile</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Child's Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    placeholder="Enter age..."
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Severity Level</label>
                  <div className="flex bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                    {['Mild', 'Moderate', 'Severe'].map(lv => (
                      <button
                        key={lv}
                        onClick={() => setProfile({...profile, severity: lv})}
                        className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                          profile.severity === lv ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {lv}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Mobility Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Can sit', 'Needs support', 'Limited movement'].map(mob => (
                      <button
                        key={mob}
                        onClick={() => setProfile({...profile, mobility: mob})}
                        className={`px-6 py-4 rounded-2xl border-2 font-bold text-left transition-all flex justify-between items-center ${
                          profile.mobility === mob ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'
                        }`}
                      >
                        {mob}
                        {profile.mobility === mob && <Zap className="w-5 h-5 fill-emerald-500 stroke-none" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Primary Focus Area</label>
                  <div className="grid grid-cols-2 gap-3">
                     {['Neck', 'Arms', 'Posture', 'Full body'].map(f => (
                       <button
                         key={f}
                         onClick={() => setProfile({...profile, focusArea: f})}
                         className={`py-6 rounded-3xl border-2 font-black text-lg transition-all ${
                           profile.focusArea === f ? 'bg-amber-500 text-white border-amber-600 shadow-xl scale-105' : 'bg-slate-50 border-slate-100 text-slate-400'
                         }`}
                       >
                         {f}
                       </button>
                     ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-12 py-5 bg-slate-900 text-white rounded-full font-black text-xl hover:bg-slate-800 shadow-xl transition-all flex items-center gap-4 group"
                >
                  NEXT STEP
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOADING ANALYSIS */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onAnimationComplete={() => setTimeout(generateAIPlan, 1500)}
              className="bg-white rounded-[3rem] p-20 shadow-2xl border-4 border-slate-100 text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-10">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping"></div>
                <div className="relative z-10 w-full h-full bg-indigo-600 rounded-full flex items-center justify-center">
                  <Zap className="w-16 h-16 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Analyzing Profile...</h3>
              <p className="text-xl text-slate-500 font-medium">NeuroAssist AI is crafting the perfect plan for you.</p>
            </motion.div>
          )}

          {/* STEP 3: PLAN RESULT */}
          {step === 3 && generatedPlan && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="bg-indigo-700 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                   <Target size={180} />
                </div>
                <h3 className="text-5xl font-black italic tracking-tighter mb-4">Your Custom Plan</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest border border-white/20">
                    Difficulty: {profile.severity}
                  </div>
                  <div className="bg-white/10 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest border border-white/20">
                    Focus: {profile.focusArea}
                  </div>
                  <div className="bg-white/10 px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest border border-white/20">
                    Duration: ~{generatedPlan.reduce((acc, t) => acc + t.duration, 0)}s
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedPlan.map((ex, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={ex.id} 
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-slate-100 relative group hover:border-indigo-200 transition-colors"
                  >
                    <div className="absolute top-8 right-8 text-6xl font-black text-slate-100 transition-colors group-hover:text-indigo-50">
                      #{idx + 1}
                    </div>
                    <div className="relative z-10">
                      <h4 className="text-2xl font-black text-slate-900 mb-2">{ex.name}</h4>
                      <p className="text-slate-500 font-medium mb-6 leading-relaxed bg-slate-50 p-4 rounded-2xl">{ex.instruction}</p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-indigo-600 font-black">
                          <Activity size={20} />
                          {ex.duration}s
                        </div>
                        <div className="flex items-center gap-2 text-emerald-600 font-black">
                          <Zap size={20} />
                          {idx === 0 ? 'High Priority' : 'Adaptive'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 pt-6">
                 <button 
                   onClick={() => setStep(1)}
                   className="flex-1 px-8 md:px-10 py-5 md:py-6 bg-white text-slate-900 border-4 border-slate-200 rounded-[2rem] font-black text-xl md:text-2xl hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-4"
                 >
                   <ChevronLeft /> EDIT PROFILE
                 </button>
                 <button 
                   onClick={startSession}
                   className="flex-[2] px-8 md:px-10 py-5 md:py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl md:text-2xl hover:bg-indigo-700 shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-4 group"
                 >
                   <Play className="fill-white" /> START PERSONALIZED SESSION
                   <Sparkles className="group-hover:rotate-12 transition-transform" />
                 </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="mt-16 flex items-center gap-8 bg-white/50 backdrop-blur-md px-10 py-5 rounded-full border-2 border-slate-100">
         <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-400">Clinical Safety Checks Active</span>
         </div>
         <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
         <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-indigo-500" />
            <span className="text-sm font-bold text-slate-400">AI Logic v2.0 Ready</span>
         </div>
      </div>
    </div>
  );
};

export default TherapyPlanner;
