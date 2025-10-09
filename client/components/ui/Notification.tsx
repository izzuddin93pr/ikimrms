

import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4700); // A bit less than the context timer to allow for fade-out
      return () => clearTimeout(timer);
    }
  }, [message, type]);

  const baseClasses = 'fixed top-4 right-4 z-[100] px-6 py-4 rounded-lg shadow-lg max-w-md transform transition-all duration-300';
  
  const typeClasses = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
    info: 'bg-blue-600 text-white',
  };

  const iconClasses = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${visible ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <i className={`fas ${iconClasses[type]} mr-3`}></i>
          <span>{message}</span>
        </div>
        <button onClick={() => setVisible(false)} className="ml-4 text-white hover:text-gray-200">
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

export default Notification;
