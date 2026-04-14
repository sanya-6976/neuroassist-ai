import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, Settings, BookOpen, X, Brain, LogOut, User, Pill, Video, Zap, Mic } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Sidebar = ({ isOpen, toggle, onLogout }) => {
  const { t } = useLanguage();
  const navItems = [
    { name: t('sidebar.dashboard'), path: '/dashboard', icon: <LayoutDashboard className="w-8 h-8" /> },
    { name: t('sidebar.aiHub'), path: '/ai-hub', icon: <Zap className="w-8 h-8" /> },
    { name: '🎤 Voice Assistant', path: '/voice', icon: <Mic className="w-8 h-8" /> },
    { name: t('sidebar.therapy'), path: '/therapy', icon: <Activity className="w-8 h-8" /> },
    { name: t('sidebar.learning'), path: '/learning', icon: <BookOpen className="w-8 h-8" /> },
    { name: t('sidebar.carePortal'), path: '/care-portal', icon: <Pill className="w-8 h-8" /> },
    { name: t('sidebar.therapist'), path: '/therapist-connect', icon: <Video className="w-8 h-8" /> },
    { name: t('sidebar.parentConsole'), path: '/parent-dashboard', icon: <User className="w-8 h-8" /> },
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

      <aside className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-slate-900 text-white flex flex-col h-full shadow-2xl transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 md:p-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-wide mb-1">{t('app.title')}</h1>
            <p className="text-gray-400 text-sm md:text-lg uppercase tracking-widest font-semibold">{t('app.subtitle')}</p>
          </div>
          <button 
            onClick={toggle}
            className="lg:hidden p-3 hover:bg-white/10 rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-amber-400"
            aria-label="Close Menu"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <nav className="flex-1 px-3 md:px-4 py-5 md:py-6 space-y-3 md:space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1024) toggle(); }}
              className={({ isActive }) =>
                `w-full flex items-center space-x-5 md:space-x-6 px-5 md:px-6 py-4 md:py-5 rounded-2xl transition-all duration-300 text-lg md:text-xl font-medium focus:outline-none focus:ring-4 focus:ring-amber-400 group ${
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

        <div className="p-4 border-t border-white/5 space-y-2">
          <NavLink 
            to="/settings"
            onClick={() => { if (window.innerWidth < 1024) toggle(); }}
            className={({ isActive }) =>
              `w-full flex items-center space-x-4 px-5 py-4 text-base font-medium rounded-xl transition-all duration-300 hover:text-white focus:outline-none focus:ring-4 focus:ring-amber-400 group ${
                isActive ? 'bg-blue-700 text-white shadow-lg' : 'text-gray-400 hover:bg-white/10'
              }`
            }
          >
            <Settings className="w-5 h-5 transition-transform group-hover:rotate-45 duration-500" />
            <span>{t('sidebar.settings')}</span>
          </NavLink>
          
          {onLogout && (
            <button 
              onClick={onLogout}
              className="w-full flex items-center space-x-4 px-5 py-4 text-base font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 hover:text-red-300 focus:outline-none focus:ring-4 focus:ring-red-400 group"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1 duration-300" />
              <span>{t('sidebar.logout')}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
