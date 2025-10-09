
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';

export const useFormatDate = () => {
    const { language } = useContext(LanguageContext);
    const locale = language === 'ms' ? 'ms-MY' : 'en-GB';

    return (dateString?: string): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            console.error("Invalid date string:", dateString);
            return 'Invalid Date';
        }
    };
};
