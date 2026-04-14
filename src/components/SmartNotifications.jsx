import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Smile, AlertCircle, Activity, Sparkles, Clock, Target, Brain } from 'lucide-react';

const SmartNotifications = ({ therapyGoal, userStatus, user }) => {
  const [currentNotification, setCurrentNotification] = useState(null);
  const [index, setIndex] = useState(0);

  const getAdaptiveMessages = () => {
    const hour = new Date().getHours();
    const messages = [];

    // 1. Progress-Based Reminders (Highest Priority)
    if (therapyGoal < 40) {
      messages.push({
        id: 'progress-urgent',
        text: "Time to start your AI Physio session! Let's reach 50% goal today. 🧘",
        icon: <Brain className="text-indigo-600" />,
        type: 'reminder'
      });
    } else if (therapyGoal < 60) {
      messages.push({
        id: 'progress-boost',
        text: "Great start! Let's do a quick physical exercise to boost your progress. 💪",
        icon: <Activity className="text-blue-600" />,
        type: 'reminder'
      });
    } else if (therapyGoal >= 80) {
      messages.push({
        id: 'progress-award',
        text: "Incredible work! You've almost hit your daily target. You're a rockstar! 🎉",
        icon: <Sparkles className="text-amber-500" />,
        type: 'motivation'
      });
    }

    // 2. Time-Based Context
    if (hour >= 5 && hour < 11) {
      messages.push({
        id: 'time-morning-stretch',
        text: "Morning! A quick 5-minute stretch will make you feel great all day. ☀️",
        icon: <Clock className="text-emerald-500" />,
        type: 'reminder'
      });
    } else if (hour >= 12 && hour < 16) {
      messages.push({
        id: 'time-afternoon-posture',
        text: "Afternoon check: Are you sitting comfortably? Let's check your posture. 😊",
        icon: <AlertCircle className="text-orange-500" />,
        type: 'posture'
      });
    } else if (hour >= 18 && hour < 22) {
      messages.push({
        id: 'time-evening-wrap',
        text: "Evening reflection: You did amazing today. Complete your final goal! 🎯",
        icon: <Target className="text-indigo-500" />,
        type: 'motivation'
      });
    }

    // 3. Status/Activity Based
    if (userStatus === 'Idle') {
      messages.push({
        id: 'activity-idle-move',
        text: "You've been still for a bit. How about a small arm exercise? 🙋‍♂️",
        icon: <AlertCircle className="text-rose-500" />,
        type: 'posture'
      });
    } else if (userStatus === 'Active') {
      messages.push({
        id: 'activity-active-keep',
        text: "Your activity levels are great! Keep that energy flowing! 🚀",
        icon: <Activity className="text-emerald-500" />,
        type: 'motivation'
      });
    }

    // 4. Specialist Reminders
    messages.push({
      id: 'ai-coach-general',
      text: "Friendly reminder: Start your AI Physio Coach session soon!",
      icon: <Brain className="text-violet-600" />,
      type: 'reminder'
    });

    if (messages.length < 3) {
      messages.push({
        id: 'default-smile',
        text: "You are doing amazing! Keep smiling and keep moving. 😊",
        icon: <Smile className="text-sky-500" />,
        type: 'motivation'
      });
    }

    return messages;
  };

  useEffect(() => {
    const messages = getAdaptiveMessages();
    setCurrentNotification(messages[0]);

    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % messages.length;
        const nextNotif = messages[nextIndex];
        setCurrentNotification(nextNotif);
        
        // Auto-trigger browser notification if it's a reminder or posture alert
        if (nextNotif.type === 'reminder' || nextNotif.type === 'posture') {
          showBrowserNotification(nextNotif.text);
        }
        
        return nextIndex;
      });
    }, 45000); // Update every 45 seconds

    return () => clearInterval(interval);
  }, [therapyGoal, userStatus]);

  // Browser Notification capability
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (message) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("NeuroAssist AI", {
        body: message,
        icon: "/logo192.png" // Fallback to a default if logo isn't available
      });
    }
  };

  if (!currentNotification) return null;

  return (
    <div className="w-full mb-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentNotification.id}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative p-6 md:p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center gap-6 overflow-hidden group hover:border-blue-200 transition-colors"
        >
          {/* Background Decorative Element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors duration-700 -z-10" />
          
          <div className="flex-shrink-0 p-5 rounded-3xl bg-slate-50 group-hover:bg-white group-hover:shadow-lg transition-all duration-500">
            {React.cloneElement(currentNotification.icon, { size: 48, strokeWidth: 2.5 })}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] ${
                currentNotification.type === 'motivation' ? 'bg-emerald-50 text-emerald-600' :
                currentNotification.type === 'posture' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {currentNotification.type}
              </span>
              <div className="flex items-center gap-1 text-slate-300">
                <Bell size={14} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Live Alert</span>
              </div>
            </div>
            <h4 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight">
              {currentNotification.text}
            </h4>
          </div>

          <button 
            onClick={() => showBrowserNotification(currentNotification.text)}
            className="px-8 py-4 bg-slate-900 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg shadow-slate-200 flex items-center gap-3 active:scale-95"
          >
            <Sparkles size={20} />
            Show Alert
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SmartNotifications;
