import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Apple, Activity, Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  { label: 'Diet Tips', icon: <Apple size={18} />, query: 'What should my child eat?' },
  { label: 'Exercises', icon: <Activity size={18} />, query: 'What exercises should we do?' },
  { label: 'Daily Routine', icon: <Clock size={18} />, query: 'What should I do daily?' },
  { label: 'Doctor Info', icon: <ShieldAlert size={18} />, query: 'Doctor guidance' },
];

const AIChat = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your NeuroAssist Companion. I'm here to help you with daily routines, diet tips, and general guidance. How can I support you today?", 
      sender: 'ai', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getAIResponse = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('eat') || q.includes('food') || q.includes('diet')) {
      return "For children with CP, focus on: \n• **Soft Foods**: Easier to chew and swallow (mashed veggies, yogurt).\n• **Nutritious Meals**: High-energy and protein-rich foods are great.\n• **Hydration**: Ensure plenty of water throughout the day.\n*Always supervise mealtime for safety.*";
    }
    
    if (q.includes('exercise') || q.includes('move') || q.includes('physio')) {
      return "General activities to try: \n• **Light Stretching**: Helps with muscle stiffness.\n• **Hand Movement**: Use the 'Magic Draw' game in our app!\n• **Posture Exercises**: Seated stretches to align the spine.\n*Consult your therapist for a specific routine.*";
    }
    
    if (q.includes('daily') || q.includes('routine') || q.includes('day') || q.includes('schedule')) {
      return "A suggested daily companion routine: \n• **Morning**: Gentle stretches and hydration.\n• **Mid-day**: 15 mins of AI Therapy or Game time.\n• **Evening**: Relaxation and rest to recover.\n*Consistency helps in building motor memory!*";
    }
    
    if (q.includes('doctor') || q.includes('medical') || q.includes('medicine') || q.includes('guidance')) {
      return "I'm here to provide general guidance. For medications, therapy prescriptions, or diagnostic concerns, **please consult your primary doctor or a licensed physiotherapist.** Safety first! ❤️";
    }

    if (q.includes('hello') || q.includes('hi')) {
       return "Hi there! I'm here to help. You can ask me about diet, exercises, or daily routines!";
    }

    return "That's a great question. While I'm still learning, I recommend checking our 'Learning Mode' for more details, or asking me about diet and exercises specifically!";
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: getAIResponse(text),
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans overflow-x-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 md:py-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight">AI Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Companion</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex flex-col items-end">
             <span className="text-sm font-bold text-slate-700">Safe & General Guidance</span>
             <span className="text-[10px] text-slate-400 uppercase font-black tracking-tighter italic">Non-Medical Advice</span>
           </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 md:py-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-white text-slate-400 border border-slate-100'
                }`}>
                  {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className="space-y-1">
                  <div className={`p-5 rounded-3xl shadow-sm text-lg leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 rounded-tl-none border-2 border-slate-50'
                  }`}>
                    {msg.text}
                  </div>
                  <p className={`text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white px-6 py-4 rounded-full border-2 border-slate-50 flex gap-2">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-100 px-4 md:px-8 py-4 md:py-6 animate-in slide-in-from-bottom-10 duration-700">
        
        {/* Suggestion Chips */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSend(s.query)}
              className="px-6 py-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 rounded-full border-2 border-slate-100 transition-all whitespace-nowrap font-bold text-sm flex items-center gap-2 group shadow-sm active:scale-95"
            >
              <div className="text-slate-400 group-hover:text-blue-500 transition-colors">{s.icon}</div>
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto flex items-center gap-3 md:gap-4">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question here... (e.g. Diet tips)"
              className="w-full pl-6 md:pl-8 pr-14 md:pr-16 py-4 md:py-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-base md:text-xl font-bold focus:bg-white focus:border-blue-500 transition-all outline-none shadow-inner"
            />
            <div className="absolute left-0 top-0 h-full w-2 bg-blue-500 rounded-l-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
          </div>
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-14 h-14 md:w-20 md:h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send size={28} className="md:hidden" />
            <Send size={32} className="hidden md:block" />
          </button>
        </div>
        
        <p className="text-center mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Friendly Assistant • All advice should be verified with clinical professionals.
        </p>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default AIChat;
