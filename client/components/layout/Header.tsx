
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import { IKIM_LOGO_URL } from '../../constants';
import { roleTranslationKeys } from '../../utils/translations';
import LanguageSwitcher from '../ui/LanguageSwitcher';


const Header: React.FC = () => {
  const { currentUser, logout } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  if (!currentUser) return null;
  
  const userRole = t(roleTranslationKeys[currentUser.role] || currentUser.role);

  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <img src={IKIM_LOGO_URL} alt="IKIM Logo" className="h-10 w-10" />
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">{t('header.titleShort')}</h1>
              <p className="hidden sm:block text-xs text-gray-600">{t('header.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher />
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-600">{userRole}</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white h-10 w-10 sm:h-auto sm:w-auto sm:px-4 sm:py-2 rounded-full sm:rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center"
              title={t('header.logout')}
            >
              <i className="fas fa-sign-out-alt text-lg sm:text-base sm:mr-0 sm:mr-2"></i>
              <span className="hidden sm:inline">{t('header.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
