import React, { useEffect, useState } from 'react';
import { Bell, X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBanner = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`pointer-events-auto p-5 rounded-3xl shadow-2xl border-2 flex items-start gap-4 transition-all ${
              notif.type === 'alert' ? 'bg-red-50 border-red-100 text-red-800' :
              notif.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              'bg-blue-50 border-blue-100 text-blue-800'
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              notif.type === 'alert' ? 'bg-red-500 text-white' :
              notif.type === 'success' ? 'bg-emerald-500 text-white' :
              'bg-blue-600 text-white'
            }`}>
              {notif.type === 'alert' ? <AlertCircle size={20} /> : 
               notif.type === 'success' ? <CheckCircle2 size={20} /> : <Info size={20} />}
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-lg leading-tight">{notif.title}</h4>
              <p className="text-sm mt-1 opacity-90 font-medium">{notif.message}</p>
            </div>

            <button 
              onClick={() => onDismiss(notif.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBanner;
