
import React, { useContext, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import AuthScreen from './components/auth/AuthScreen';
import MainLayout from './components/layout/MainLayout';
import Notification from './components/ui/Notification';

const App: React.FC = () => {
  const { currentUser, notification, loading } = useContext(AppContext);

  useEffect(() => {
    // Register service worker for PWA capabilities
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = () => {
        // Construct an absolute URL to sw.js to ensure it's loaded from the correct origin,
        // which prevents cross-origin errors in certain environments.
        const swUrl = new URL('/sw.js', window.location.origin).href;
        navigator.serviceWorker.register(swUrl).then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(registrationError => {
          console.log('ServiceWorker registration failed: ', registrationError);
        });
      };

      // Register the service worker after the page has fully loaded.
      // This is the most reliable approach to avoid "invalid state" errors
      // and prevent contention with the initial page load.
      window.addEventListener('load', registerServiceWorker);

      // Clean up the event listener when the component unmounts.
      return () => window.removeEventListener('load', registerServiceWorker);
    }
  }, []);


  if (loading) {
      return (
          <div className="flex justify-center items-center h-screen bg-gray-100">
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
      )
  }

  return (
    <>
      {currentUser ? <MainLayout /> : <AuthScreen />}
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
        />
      )}
    </>
  );
};

export default App;
