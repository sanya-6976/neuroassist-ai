import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  User, 
  Bot, 
  Sparkles, 
  Mic, 
  MicOff, 
  ArrowRight, 
  Info, 
  Activity, 
  ShieldCheck, 
  BarChart3, 
  Users 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_ACTIONS = [
  { label: "What should I do today?", icon: <Sparkles size={18} />, route: '/dashboard' },
  { label: "How to improve posture?", icon: <Activity size={18} />, route: '/ai-therapy-session' },
  { label: "Start therapy", icon: <ShieldCheck size={18} />, route: '/therapy' },
  { label: "View progress", icon: <BarChart3 size={18} />, route: '/dashboard' },
  { label: "Help for parents", icon: <Users size={18} />, route: '/parent-dashboard' },
];

const RESPONSES = {
  posture: "To improve posture, sit straight and follow the AI coach in the Physio session. It helps align your spine and neck! 😊",
  therapy: "You can start therapy by clicking the 'Start Session' button in the Therapy Zone. I'll guide you step-by-step!",
  exercise: "I suggest trying the 'Magic Draw' game or the light stretching modules in the Learning section.",
  progress: "Your progress is shown in the dashboard cards. You can see your streak and therapy completion rates there!",
  parent: "Parents can track improvements, manage medications, and book therapist consultations in the Parent Dashboard.",
  hello: "Hi! I’m your AI Guide 😊 I can help you with therapy, posture, exercises, and using the app. Ask me anything!",
  default: "I'm still learning! You can try clicking one of the quick buttons below or ask about 'posture', 'therapy', or 'progress'."
};

const GuideAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I’m your AI Guide 😊\nI can help you with therapy, posture, exercises, and using the app.\nAsk me anything!", 
      sender: 'ai', 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    // Rule-based Logic
    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = RESPONSES.default;
      
      if (q.includes('posture')) reply = RESPONSES.posture;
      else if (q.includes('therapy')) reply = RESPONSES.therapy;
      else if (q.includes('exercise')) reply = RESPONSES.exercise;
      else if (q.includes('progress')) reply = RESPONSES.progress;
      else if (q.includes('parent')) reply = RESPONSES.parent;
      else if (q.includes('hi') || q.includes('hello')) reply = RESPONSES.hello;

      const aiResponse = {
        id: Date.now() + 1,
        text: reply,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 8000 / 8); 
  };

  const handleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-6 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-200">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Guide Assistant</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Always Here to Help</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === 'user' ? 'bg-purple-100 text-purple-600' : 'bg-white text-slate-400 border border-slate-100'
                }`}>
                  {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                
                <div className="space-y-1">
                  <div className={`p-5 rounded-3xl shadow-sm text-lg leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
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
      <div className="bg-white border-t border-slate-100 p-4 md:p-8">
        
        {/* Quick Actions */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.route)}
              className="px-6 py-3 bg-white hover:bg-purple-50 hover:text-purple-600 text-slate-600 rounded-full border-2 border-slate-100 transition-all whitespace-nowrap font-bold text-sm flex items-center gap-2 group shadow-sm active:scale-95"
            >
              <div className="text-slate-400 group-hover:text-purple-500 transition-colors">{action.icon}</div>
              {action.label}
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
            </button>
          ))}
        </div>

        <div className="relative max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={handleVoice}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <div className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about therapy or posture..."
              className="w-full pl-8 pr-16 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-xl font-bold focus:bg-white focus:border-purple-500 transition-all outline-none shadow-inner"
            />
          </div>
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-20 h-20 bg-purple-600 text-white rounded-[2rem] flex items-center justify-center shadow-xl shadow-purple-200 hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Send size={32} />
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default GuideAssistant;
