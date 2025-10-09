
import React, { useContext } from 'react';
import LoginForm from './LoginForm';
import { IKIM_LOGO_URL } from '../../constants';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';


const AuthScreen: React.FC = () => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
        {/* Left Branding Panel */}
        <div className="w-full md:w-2/5 bg-gradient-to-br from-blue-700 to-indigo-800 p-8 sm:p-12 text-white flex flex-col justify-center items-center text-center">
            <img src={IKIM_LOGO_URL} alt="IKIM Logo" className="h-24 w-24 mb-6" />
            <h1 className="text-3xl font-bold mb-2">{t('header.title')}</h1>
            <p className="text-indigo-200 text-lg leading-relaxed">
              {t('header.subtitle')}
            </p>
            <div className="w-24 border-b-2 border-indigo-400 my-8"></div>
            <p className="text-indigo-200 text-md leading-relaxed italic">
              "{t('header.motto')}"
            </p>
        </div>
        
        {/* Right Form Panel */}
        <div className="w-full md:w-3/5 p-8 sm:p-12">
          <LoginForm />
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
