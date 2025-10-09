import React, { ReactNode, useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  headerActions?: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'lg', headerActions }) => {
  const { t } = useContext(LanguageContext);
  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] flex flex-col`}>
        <div className="p-4 sm:p-6 border-b">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-lg sm:text-2xl font-bold text-gray-900 truncate pr-2">{title}</h3>
            <div className="flex items-center space-x-2 flex-shrink-0">
                {headerActions}
                <button 
                  onClick={onClose} 
                  className="text-gray-400 hover:text-gray-600 h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={t('common.close')}
                >
                  <i className="fas fa-times text-lg"></i>
                </button>
            </div>
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;