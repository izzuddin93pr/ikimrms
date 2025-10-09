
import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const activeClasses = 'bg-white text-blue-600 shadow-md';
  const inactiveClasses = 'bg-transparent text-white hover:bg-white/20';

  return (
    <div className="flex items-center bg-blue-900/50 rounded-full p-1 text-sm font-semibold">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-full transition-all duration-300 ${language === 'en' ? activeClasses : inactiveClasses}`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ms')}
        className={`px-3 py-1 rounded-full transition-all duration-300 ${language === 'ms' ? activeClasses : inactiveClasses}`}
        aria-pressed={language === 'ms'}
      >
        MS
      </button>
    </div>
  );
};

export default LanguageSwitcher;
