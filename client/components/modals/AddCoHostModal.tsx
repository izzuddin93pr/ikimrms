
import React, { useState, useContext } from 'react';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import Modal from '../common/Modal';
import type { User } from '../../types';

interface AddCoHostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (userData: Omit<User, 'id' | 'role' | 'approved'>, password: string) => void;
}

const AddCoHostModal: React.FC<AddCoHostModalProps> = ({ isOpen, onClose, onAdd }) => {
    const { t } = useContext(LanguageContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [organization, setOrganization] = useState('IKIM');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onAdd({ name, email, organization }, password);
        } finally {
            setLoading(false);
            // Don't clear form on error, so user can correct it
        }
    };
    
    // Clear form when modal opens
    useState(() => {
        if (isOpen) {
            setName('');
            setEmail('');
            setPassword('');
            setOrganization('IKIM');
            setLoading(false);
        }
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('users.addCoHostTitle')} size="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-4">
                     <div>
                        <label className="label">{t('auth.fullNameLabel')}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required disabled={loading}/>
                    </div>
                     <div>
                        <label className="label">{t('auth.emailLabel')}</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required disabled={loading}/>
                    </div>
                     <div>
                        <label className="label">{t('auth.passwordLabel')}</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required minLength={6} disabled={loading}/>
                    </div>
                     <div>
                        <label className="label">{t('common.organization')}</label>
                        <input type="text" value={organization} onChange={(e) => setOrganization(e.target.value)} className="input" required disabled={loading}/>
                    </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-triangle text-yellow-500"></i>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">{t('users.addCoHostSecurityNotice')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
                        {t('common.cancel')}
                    </button>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? `${t('common.add')}...` : t('users.addCoHost')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddCoHostModal;
