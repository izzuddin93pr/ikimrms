

import React, { useContext } from 'react';
import Modal from './Modal';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useContext(LanguageContext);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
        <div className="p-6">
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end space-x-4">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300"
                >
                    {t('common.cancel')}
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
                >
                    {t('common.confirm')}
                </button>
            </div>
        </div>
    </Modal>
  );
};

export default ConfirmationModal;
