
import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import type { User } from '../../types';

interface SignupFormProps {
  onSwitch: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitch }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification, signup } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const newUserPayload = {
        name,
        email,
        organization,
      };

      const newUser = await signup(newUserPayload);

      if (newUser) {
        showNotification(t('notifications.registrationSuccess'), 'success');
        onSwitch(); // Switch to login view
      } else {
        showNotification(t('notifications.emailExists'), 'error');
      }
    } catch (error: any) {
        console.error("Signup error:", error);
        showNotification(error.message, 'error');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">{t('auth.signupTitle')}</h2>
      <p className="text-gray-500 mb-8 text-center">{t('auth.signupSubtitle')}</p>

      <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.fullNameLabel')}</label>
           <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><i className="fas fa-user text-gray-400"></i></span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('auth.fullNamePlaceholder')}
              required
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.emailLabel')}</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><i className="fas fa-envelope text-gray-400"></i></span>
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
            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><i className="fas fa-lock text-gray-400"></i></span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('auth.passwordPlaceholderSignup')}
              required
              minLength={6}
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.organization')}</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3"><i className="fas fa-building text-gray-400"></i></span>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('auth.organizationPlaceholder')}
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
          {loading ? 'Registering...' : t('auth.registerButton')}
        </button>
      </form>
      <div className="mt-8 text-center">
        <p className="text-gray-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <button onClick={onSwitch} className="font-semibold text-blue-600 hover:text-blue-800 transition">
            {t('auth.loginLink')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;
