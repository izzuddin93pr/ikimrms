
import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification, login, loginAsGuest } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user) {
        // The error message is now handled by the API response via AppContext
        showNotification(t('notifications.invalidCredentials'), 'error');
      }
      // AppContext now handles setting the current user state
    } catch (error: any) {
      console.error("Login error:", error);
      showNotification(error.message || 'An unexpected error occurred during login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      loginAsGuest();
      showNotification(t('notifications.guestWelcome'), 'info');
    } catch (error) {
        console.error("Anonymous login error:", error);
        showNotification('Could not log in as guest.', 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">{t('auth.loginTitle')}</h2>
      <p className="text-gray-500 mb-8 text-center">{t('auth.loginSubtitle')}</p>
      
      <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.emailLabel')}</label>
          <div className="relative">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-envelope text-gray-400"></i>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.emailPlaceholder')}
                required
                disabled={loading}
              />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.passwordLabel')}</label>
           <div className="relative">
             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <i className="fas fa-lock text-gray-400"></i>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.passwordPlaceholder')}
                required
                disabled={loading}
              />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Logging in...' : t('auth.loginButton')}
        </button>
      </form>
      
      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">{t('auth.or')}</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      
      <button
        onClick={handleGuestLogin}
        disabled={loading}
        className="w-full bg-gray-100 text-gray-700 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-200 transition duration-300 flex items-center justify-center disabled:opacity-50"
      >
        <i className="fas fa-eye mr-2"></i>
        {t('auth.guestLoginButton')}
      </button>

    </div>
  );
};

export default LoginForm;
