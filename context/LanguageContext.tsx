import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';

type Language = 'en' | 'ms';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, params?: { [key: string]: string | number }) => string;
}

export const LanguageContext = createContext<LanguageContextType>(null!);

const LoadingIndicator: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border-left-color: #3b82f6;
        animation: spin 1s linear infinite;
      }
    `}</style>
    <div className="spinner"></div>
  </div>
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('ikim-lang');
    return (storedLang === 'en' || storedLang === 'ms') ? storedLang : 'en';
  });
  
  // Initialize as null to track the initial loading state.
  const [translations, setTranslations] = useState<any | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales/${language}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Could not load translations for ${language}`, error);
        // Fallback to prevent getting stuck on the loading screen
        if (translations === null) {
          setTranslations({});
        }
      }
    };

    fetchTranslations();
    localStorage.setItem('ikim-lang', language);
  }, [language]);

  const t = useCallback((key: string, params?: { [key: string]: string | number }) => {
    // While switching languages, translations will exist but might be the old ones.
    // If translations are null (initial load), return the key.
    if (!translations) {
        return key;
    }
    
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key;
      }
    }

    if (typeof result === 'string' && params) {
        Object.keys(params).forEach(pKey => {
            result = result.replace(`{{${pKey}}}`, String(params[pKey]));
        });
    }

    return result || key;
  }, [translations]);

  const value = {
    language,
    setLanguage,
    t
  };

  // Only show the loading indicator on the very first load when translations are null.
  if (translations === null) {
    return <LoadingIndicator />;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
