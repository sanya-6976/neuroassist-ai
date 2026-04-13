import React from 'react';
import { NavLink } from 'react-router-dom';
import { Mic, Activity, LayoutDashboard, Settings, BookOpen, X, Brain } from 'lucide-react';

const Sidebar = ({ isOpen, toggle }) => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-8 h-8" /> },
    { name: 'Voice Assistant', path: '/voice', icon: <Mic className="w-8 h-8" /> },
    { name: 'Therapy', path: '/therapy', icon: <Activity className="w-8 h-8" /> },
    { name: 'Learning Mode', path: '/learning', icon: <BookOpen className="w-8 h-8" /> },
    { name: 'AI Therapy', path: '/ai-therapy', icon: <Brain className="w-8 h-8" /> },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={toggle}
        ></div>
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-white flex flex-col h-full shadow-2xl transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-wider mb-2">NeuroAssist</h1>
            <p className="text-gray-400 text-lg uppercase tracking-widest font-semibold">AI Console</p>
          </div>
          <button 
            onClick={toggle}
            className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            aria-label="Close Menu"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) toggle(); }}
              className={({ isActive }) =>
                `w-full flex items-center space-x-6 px-6 py-5 rounded-2xl transition-all duration-300 text-xl font-medium focus:outline-none focus:ring-4 focus:ring-amber-400 group ${
                  isActive 
                    ? 'bg-blue-700 text-white shadow-lg scale-[1.02] translate-x-1' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                }`
              }
            >
              <div className="transition-transform duration-300 group-hover:scale-110">
                {item.icon}
              </div>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            className="w-full flex items-center space-x-6 px-6 py-5 text-xl font-medium text-gray-300 hover:bg-white/10 rounded-2xl transition-all hover:text-white focus:outline-none focus:ring-4 focus:ring-amber-400 group"
            aria-label="Settings"
          >
            <Settings className="w-8 h-8 transition-transform group-hover:rotate-45 duration-500" />
            <span>Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
