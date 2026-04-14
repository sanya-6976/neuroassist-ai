import React, { useState, useEffect } from 'react';
import {
  Globe, Accessibility, Bell, Brain, User, Lock,
  ChevronDown, Camera, Mic, CheckCircle2, AlertTriangle, Save, RotateCcw
} from 'lucide-react';

// ── Toggle Component ───────────────────────────────────────────────────────────
const Toggle = ({ label, description, value, onChange, accent = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    violet: 'bg-violet-600',
    amber: 'bg-amber-500',
    rose: 'bg-rose-600',
  };
  return (
    <div className="flex items-start justify-between gap-4 py-5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-xl font-bold text-slate-800">{label}</p>
        {description && <p className="text-slate-400 text-sm mt-1 font-medium">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative flex-shrink-0 w-16 h-9 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-400 ${value ? colors[accent] : 'bg-slate-200'}`}
      >
        <span className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-md transition-all duration-300 ${value ? 'translate-x-7' : 'translate-x-0'}`} />
      </button>
    </div>
  );
};

// ── Section Card ───────────────────────────────────────────────────────────────
const SectionCard = ({ title, icon, children, color = 'blue' }) => {
  const iconColors = {
    blue: 'bg-blue-100 text-blue-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    violet: 'bg-violet-100 text-violet-600',
    amber: 'bg-amber-100 text-amber-600',
    rose: 'bg-rose-100 text-rose-600',
    slate: 'bg-slate-800 text-slate-200',
  };
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border-2 border-slate-100 hover:shadow-xl transition-all duration-500">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b-2 border-slate-50">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${iconColors[color]}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-black text-slate-800">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};

// ── Main Settings Page ─────────────────────────────────────────────────────────
const Settings = () => {
  // Language
  const [language, setLanguage] = useState('en');
  // Accessibility
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [voiceAssist, setVoiceAssist] = useState(true);
  // Notifications
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [therapyReminders, setTherapyReminders] = useState(true);
  const [postureAlerts, setPostureAlerts] = useState(false);
  const [reminderFreq, setReminderFreq] = useState('medium');
  // Therapy
  const [difficulty, setDifficulty] = useState('easy');
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [voiceCoaching, setVoiceCoaching] = useState(true);
  // Profile
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [severity, setSeverity] = useState('mild');
  // Permissions
  const [cameraState, setCameraState] = useState('unknown');
  const [micState, setMicState] = useState('unknown');

  const [saved, setSaved] = useState(false);

  // ─ Load from localStorage on mount ─
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem('neuroassist_settings') || '{}');
    if (s.language) setLanguage(s.language);
    if (s.largeText !== undefined) setLargeText(s.largeText);
    if (s.highContrast !== undefined) setHighContrast(s.highContrast);
    if (s.voiceAssist !== undefined) setVoiceAssist(s.voiceAssist);
    if (s.notificationsOn !== undefined) setNotificationsOn(s.notificationsOn);
    if (s.therapyReminders !== undefined) setTherapyReminders(s.therapyReminders);
    if (s.postureAlerts !== undefined) setPostureAlerts(s.postureAlerts);
    if (s.reminderFreq) setReminderFreq(s.reminderFreq);
    if (s.difficulty) setDifficulty(s.difficulty);
    if (s.autoAdjust !== undefined) setAutoAdjust(s.autoAdjust);
    if (s.voiceCoaching !== undefined) setVoiceCoaching(s.voiceCoaching);

    const patient = JSON.parse(localStorage.getItem('patient_info') || '{}');
    if (patient.fullName) setName(patient.fullName);
    if (patient.age) setAge(patient.age);
    if (patient.severityLevel) setSeverity(patient.severityLevel.toLowerCase());

    // Check permissions
    checkPermissions();
  }, []);

  // ─ Apply global accessibility classes ─
  useEffect(() => {
    const root = document.documentElement;
    largeText ? root.classList.add('accessibility-large-text') : root.classList.remove('accessibility-large-text');
  }, [largeText]);

  useEffect(() => {
    const root = document.documentElement;
    highContrast ? root.classList.add('accessibility-high-contrast') : root.classList.remove('accessibility-high-contrast');
  }, [highContrast]);

  const checkPermissions = async () => {
    try {
      const cam = await navigator.permissions.query({ name: 'camera' });
      setCameraState(cam.state);
      const micP = await navigator.permissions.query({ name: 'microphone' });
      setMicState(micP.state);
    } catch { /* some browsers don't support permissions API */ }
  };

  const requestCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setCameraState('granted');
    } catch { setCameraState('denied'); }
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicState('granted');
    } catch { setMicState('denied'); }
  };

  const PermBadge = ({ state }) => {
    if (state === 'granted') return <span className="flex items-center gap-1 text-emerald-600 font-bold text-sm"><CheckCircle2 size={16} />Granted</span>;
    if (state === 'denied') return <span className="flex items-center gap-1 text-red-500 font-bold text-sm"><AlertTriangle size={16} />Denied</span>;
    return <span className="text-slate-400 font-bold text-sm">Unknown</span>;
  };

  const saveAll = () => {
    const settings = { language, largeText, highContrast, voiceAssist, notificationsOn, therapyReminders, postureAlerts, reminderFreq, difficulty, autoAdjust, voiceCoaching };
    localStorage.setItem('neuroassist_settings', JSON.stringify(settings));
    const existing = JSON.parse(localStorage.getItem('patient_info') || '{}');
    localStorage.setItem('patient_info', JSON.stringify({ ...existing, fullName: name, age, severityLevel: severity.charAt(0).toUpperCase() + severity.slice(1) }));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    if (window.speechSynthesis && voiceAssist) {
      const u = new SpeechSynthesisUtterance('Settings saved!');
      u.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(u);
    }
  };

  const resetAll = () => {
    localStorage.removeItem('neuroassist_settings');
    window.location.reload();
  };

  const selectClass = "w-full mt-2 px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-xl text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 appearance-none cursor-pointer transition-all";

  return (
    <div className="px-4 md:px-8 lg:px-12 py-4 md:py-6 max-w-5xl mx-auto animate-in fade-in duration-1000 overflow-x-hidden">
      <header className="mb-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">⚙️ Settings</h2>
          <p className="text-lg md:text-2xl text-slate-400 font-medium mt-3">Customize your NeuroAssist experience.</p>
        </div>
        <div className="flex gap-4 flex-wrap">
          <button onClick={resetAll} className="flex items-center justify-center gap-3 px-7 py-4 rounded-2xl border-2 border-slate-200 font-black text-lg md:text-xl text-slate-600 hover:bg-slate-50 transition-all duration-300 w-full sm:w-auto">
            <RotateCcw size={20} /> Reset
          </button>
          <button onClick={saveAll} className={`flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-lg md:text-xl text-white shadow-xl transition-all duration-300 w-full sm:w-auto ${saved ? 'bg-emerald-600 shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:scale-105'}`}>
            {saved ? <><CheckCircle2 size={22} /> Saved!</> : <><Save size={22} /> Save Settings</>}
          </button>
        </div>
      </header>

      <div className="space-y-8">
        {/* Language */}
        <SectionCard title="Language" icon={<Globe size={26} />} color="blue">
          <label className="block text-xl font-bold text-slate-700 mb-2">Select App Language</label>
          <div className="relative">
            <select value={language} onChange={e => setLanguage(e.target.value)} className={selectClass}>
              <option value="en">🇺🇸 English</option>
              <option value="hi">🇮🇳 हिंदी (Hindi)</option>
            </select>
            <ChevronDown size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none mt-1" />
          </div>
          <p className="text-slate-400 text-sm mt-3 font-medium">Full translation across the entire app. Applies after saving.</p>
        </SectionCard>

        {/* Accessibility */}
        <SectionCard title="Accessibility" icon={<Accessibility size={26} />} color="violet">
          <Toggle label="Large Text Mode" description="Increases all text size for easier reading." value={largeText} onChange={setLargeText} accent="violet" />
          <Toggle label="High Contrast Mode" description="Boosts color contrast for better visibility." value={highContrast} onChange={setHighContrast} accent="violet" />
          <Toggle label="Voice Assistance" description="Enables spoken feedback throughout the app." value={voiceAssist} onChange={setVoiceAssist} accent="violet" />
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={<Bell size={26} />} color="amber">
          <Toggle label="Enable Notifications" description="Allow the app to show alerts and updates." value={notificationsOn} onChange={setNotificationsOn} accent="amber" />
          <Toggle label="Therapy Reminders" description="Get notified when it's time for your session." value={therapyReminders} onChange={v => notificationsOn && setTherapyReminders(v)} accent="amber" />
          <Toggle label="Posture Alerts" description="Reminders to sit up straight and breathe." value={postureAlerts} onChange={v => notificationsOn && setPostureAlerts(v)} accent="amber" />
          <div className="pt-4">
            <label className="block text-xl font-bold text-slate-700 mb-2">Reminder Frequency</label>
            <div className="relative">
              <select value={reminderFreq} onChange={e => setReminderFreq(e.target.value)} disabled={!notificationsOn} className={`${selectClass} ${!notificationsOn ? 'opacity-40 cursor-not-allowed' : ''}`}>
                <option value="low">🟢 Low — Every 2 hours</option>
                <option value="medium">🟡 Medium — Every hour</option>
                <option value="high">🔴 High — Every 30 minutes</option>
              </select>
              <ChevronDown size={22} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none mt-1" />
            </div>
          </div>
        </SectionCard>

        {/* Therapy */}
        <SectionCard title="Therapy Settings" icon={<Brain size={26} />} color="emerald">
          <div className="mb-6">
            <label className="block text-xl font-bold text-slate-700 mb-3">Difficulty Level</label>
            <div className="grid grid-cols-2 gap-4">
              {['easy', 'medium'].map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`py-5 px-6 rounded-2xl font-black text-xl border-2 transition-all capitalize ${difficulty === d ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
                  {d === 'easy' ? '🌱 Easy' : '🔥 Medium'}
                </button>
              ))}
            </div>
          </div>
          <Toggle label="AI Adaptive Mode" description="Automatically adjusts difficulty based on your progress." value={autoAdjust} onChange={setAutoAdjust} accent="emerald" />
          <Toggle label="Voice Coaching" description="Hear audio instructions during therapy sessions." value={voiceCoaching} onChange={setVoiceCoaching} accent="emerald" />
        </SectionCard>

        {/* Profile */}
        <SectionCard title="Profile" icon={<User size={26} />} color="rose">
          <div className="space-y-6">
            <div>
              <label className="block text-xl font-bold text-slate-700 mb-2">Child's Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter name..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-xl text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all" />
            </div>
            <div>
              <label className="block text-xl font-bold text-slate-700 mb-2">Age</label>
              <input value={age} onChange={e => setAge(e.target.value)} placeholder="Age in years..." type="number" min="1" max="18"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-slate-50 font-bold text-xl text-slate-800 focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all" />
            </div>
            <div>
              <label className="block text-xl font-bold text-slate-700 mb-3">Condition Severity</label>
              <div className="grid grid-cols-3 gap-4">
                {['mild', 'moderate', 'severe'].map(s => (
                  <button key={s} onClick={() => setSeverity(s)}
                    className={`py-5 rounded-2xl font-black text-lg border-2 transition-all capitalize ${severity === s ?
                      (s === 'mild' ? 'bg-emerald-600 text-white border-emerald-600' : s === 'moderate' ? 'bg-amber-500 text-white border-amber-500' : 'bg-rose-600 text-white border-rose-600')
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {s === 'mild' ? '🟢 Mild' : s === 'moderate' ? '🟡 Moderate' : '🔴 Severe'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Permissions */}
        <SectionCard title="Permissions" icon={<Lock size={26} />} color="slate">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Camera size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-xl">Camera</p>
                  <PermBadge state={cameraState} />
                </div>
              </div>
              {cameraState !== 'granted' && (
                <button onClick={requestCamera} className="px-7 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all text-lg">
                  Enable Camera
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Mic size={24} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-xl">Microphone</p>
                  <PermBadge state={micState} />
                </div>
              </div>
              {micState !== 'granted' && (
                <button onClick={requestMic} className="px-7 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all text-lg">
                  Enable Mic
                </button>
              )}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Sticky Save Footer */}
      <div className="mt-14 p-8 bg-slate-900 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-white font-bold text-xl">All changes are saved locally on your device.</p>
        <button onClick={saveAll} className={`flex items-center gap-3 px-12 py-5 rounded-2xl font-black text-xl text-white shadow-xl transition-all ${saved ? 'bg-emerald-500 shadow-emerald-300/20' : 'bg-blue-600 hover:bg-blue-500 hover:scale-105 shadow-blue-300/20'}`}>
          {saved ? <><CheckCircle2 size={24} /> Saved!</> : <><Save size={24} /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
};

export default Settings;
