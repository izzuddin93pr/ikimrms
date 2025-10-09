import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';

const ChangePassword = () => {
    const { showNotification, currentUser } = useContext(AppContext);
    const { t } = useContext(LanguageContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
             showNotification(t('notifications.passwordTooShort'), 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showNotification(t('notifications.passwordsNoMatch'), 'error');
            return;
        }
        
        setLoading(true);
        // Simulate an API call for password change
        setTimeout(() => {
            showNotification(t('notifications.passwordChanged'), 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setLoading(false);
        }, 1000);
    };

    if (currentUser?.id === 'guest-user') {
        return null; // Don't show password change for the default guest user
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.changeMyPassword')}</h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="md:col-span-2">
                        <label className="label">{t('settings.currentPassword')}</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input" required disabled={loading} />
                    </div>
                    <div>
                        <label className="label">{t('settings.newPassword')}</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" required disabled={loading} />
                    </div>
                     <div>
                        <label className="label">{t('settings.confirmNewPassword')}</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" required disabled={loading} />
                    </div>
                </div>
                <div className="mt-6">
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : <><i className="fas fa-key mr-2"></i>{t('settings.changePasswordButton')}</>}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;