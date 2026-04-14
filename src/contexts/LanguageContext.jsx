import React, { createContext, useContext, useState, useEffect } from 'react';
import { t } from '../translations';

const LanguageContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('neuroassist_settings') || '{}');
    if (saved.language) setLangState(saved.language);
  }, []);

  const setLang = (newLang) => {
    setLangState(newLang);
    const saved = JSON.parse(localStorage.getItem('neuroassist_settings') || '{}');
    localStorage.setItem('neuroassist_settings', JSON.stringify({ ...saved, language: newLang }));
  };

  const translate = (path) => t(path, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
