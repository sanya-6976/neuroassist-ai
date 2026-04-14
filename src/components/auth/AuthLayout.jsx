import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/30 rounded-full blur-[120px] animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden relative z-10 border border-slate-100">
        
        {/* Branding Side - Hidden on toggle/mobile maybe? No, let's keep it responsive */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">NeuroAssist AI</span>
          </motion.div>

          <div className="space-y-8 relative z-10">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-5xl font-bold leading-tight">
                Empowering <br />
                <span className="text-sky-400">Neurological </span> Recovery.
              </h1>
              <p className="text-slate-400 text-lg max-w-md">
                Your intelligent companion for physiotherapy and neuro-rehabilitation.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="grid gap-4"
            >
              {[
                { icon: ShieldCheck, text: "HIPAA Compliant Data Security" },
                { icon: HeartPulse, text: "Personalized Therapy Plans" },
                { icon: Activity, text: "Real-time Progress Tracking" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-sky-400" />
                  </div>
                  <span className="text-sm font-medium">{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-500 text-sm"
          >
            © 2024 NeuroAssist AI. All rights reserved.
          </motion.div>
        </div>

        {/* Form Side */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md mx-auto"
          >
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="p-2 bg-sky-500 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">NeuroAssist AI</span>
            </div>

            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
              <p className="text-slate-500">{subtitle}</p>
            </div>

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
