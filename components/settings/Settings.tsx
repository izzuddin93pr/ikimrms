
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import ChangePassword from './ChangePassword';
import ResetUserPasswords from './ResetUserPasswords';

const Settings: React.FC = () => {
    const { currentUser } = useContext(AppContext);
    const { t } = useContext(LanguageContext);

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('settings.title')}</h2>
                <p className="text-gray-600">{t('settings.subtitle')}</p>
            </div>
            
            <ChangePassword />

            {currentUser?.role === 'host' && <ResetUserPasswords />}
        </div>
    );
};

export default Settings;
