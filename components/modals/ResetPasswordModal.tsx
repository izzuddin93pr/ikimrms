import React, { useContext } from 'react';
import Modal from '../common/Modal';
import { LanguageContext } from '../../context/LanguageContext';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
  const { t } = useContext(LanguageContext);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings.resetPassword')} size="md">
        <div className="p-6">
            <p className="text-gray-600 mb-6">{t('users.resetPasswordMessage', { name: userName })}</p>
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
                    className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300"
                >
                    {t('users.confirmReset')}
                </button>
            </div>
        </div>
    </Modal>
  );
};

export default ResetPasswordModal;