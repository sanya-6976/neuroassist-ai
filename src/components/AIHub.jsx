import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Bot, 
  Sparkles, 
  PenTool, 
  ArrowRight, 
  Zap,
  Activity,
  Heart
} from 'lucide-react';

const AIHubCard = ({ title, description, icon, path, color, badges }) => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-slate-50 flex flex-col justify-between h-full relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:border-blue-100"
    >
      <div className={`absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700 group-hover:scale-125 group-hover:rotate-12`}>
        {icon}
      </div>

      <div className="relative z-10">
        <div className={`w-16 h-16 ${color.bg} ${color.text} rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-3 transition-transform`}>
          {React.cloneElement(icon, { size: 32 })}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {badges.map((badge, idx) => (
            <span key={idx} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
              {badge}
            </span>
          ))}
        </div>

        <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight group-hover:text-blue-700 transition-colors">
          {title}
        </h3>
        <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8">
          {description}
        </p>
      </div>

      <button 
        onClick={() => navigate(path)}
        className={`w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${color.btn} shadow-lg shadow-current/20 group/btn`}
      >
        OPEN FEATURE
        <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
};

const AIHub = () => {
  const features = [
    {
      title: "AI Physio Coach",
      description: "Advanced real-time movement analysis to guide your therapy sessions with professional precision.",
      icon: <Activity />,
      path: "/ai-therapy",
      badges: ["Therapy", "Computer Vision"],
      color: {
        bg: "bg-indigo-100",
        text: "text-indigo-600",
        btn: "bg-indigo-600 text-white hover:bg-indigo-700"
      }
    },
    {
      title: "Health Advisor",
      description: "AI-powered medical assistant to answer your health queries and guide your recovery journey.",
      icon: <Bot />,
      path: "/ai-assistant",
      badges: ["Chat", "Smart Advice"],
      color: {
        bg: "bg-emerald-100",
        text: "text-emerald-600",
        btn: "bg-emerald-600 text-white hover:bg-emerald-700"
      }
    },
    {
      title: "Magic Trace",
      description: "Fun, interactive drawing games that use hand tracking to build fine motor skills and creativity.",
      icon: <PenTool />,
      path: "/draw-game",
      badges: ["Game", "Motor Skills"],
      color: {
        bg: "bg-rose-100",
        text: "text-rose-600",
        btn: "bg-rose-600 text-white hover:bg-rose-700"
      }
    },
    {
      title: "Intelligent Guide",
      description: "Step-by-step assistant that helps you navigate the app and learn how to use every feature.",
      icon: <Sparkles />,
      path: "/guide",
      badges: ["Support", "Voice Enabled"],
      color: {
        bg: "bg-amber-100",
        text: "text-amber-600",
        btn: "bg-amber-600 text-white hover:bg-amber-700"
      }
    }
  ];

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-7xl mx-auto animate-in fade-in duration-1000 overflow-x-hidden">
      <header className="mb-12 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-600 font-black uppercase tracking-[0.2em] text-sm">
            <Zap size={20} className="fill-blue-600" />
            Neuro-AI Platform
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            Neuro-AI <br/>
            <span className="text-blue-700">Exploration Hub</span>
          </h2>
          <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-2xl leading-relaxed italic">
            "Your dedicated space for all AI-powered specialized features, designed for growth and progress."
          </p>
        </div>
        <div className="hidden lg:block">
           <div className="relative w-48 h-48">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
              <div className="absolute inset-4 bg-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-inner">
                 <Brain size={80} className="text-blue-700" />
              </div>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <AIHubCard key={idx} {...feature} />
        ))}
      </div>

      <footer className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
           <Heart size={150} />
        </div>
        <div className="relative z-10 space-y-4">
          <h3 className="text-3xl font-black tracking-tight">AI with Purpose</h3>
          <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
            Every AI feature here is specifically tuned to be accessible, patient, and empowering for the NeuroAssist community.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AIHub;
