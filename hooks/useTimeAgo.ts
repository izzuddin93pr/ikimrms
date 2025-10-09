
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useFormatDate } from './useFormatDate';

export const useTimeAgo = () => {
    const { t } = useContext(LanguageContext);
    const formatDate = useFormatDate();

    return (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('common.justNow');
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes === 1) return t('common.minuteAgo');
        if (diffInMinutes < 60) return t('common.minutesAgo', { count: diffInMinutes });

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours === 1) return t('common.hourAgo');
        if (diffInHours < 24) return t('common.hoursAgo', { count: diffInHours });

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return t('common.dayAgo');
        if (diffInDays < 30) return t('common.daysAgo', { count: diffInDays });
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths === 1) return t('common.monthAgo');
        if (diffInMonths < 12) return t('common.monthsAgo', { count: diffInMonths });
        
        const diffInYears = Math.floor(diffInMonths / 12);
        if (diffInYears === 1) return t('common.yearAgo');
        if (diffInYears > 1) return t('common.yearsAgo', { count: diffInYears });

        return formatDate(dateString);
    };
};
