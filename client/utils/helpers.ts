

import type { Collaboration, CollaborationStatus } from '../types';

export const formatDate = (dateString?: string, locale: 'en' | 'ms' = 'en') => {
  if (!dateString) return 'N/A';
  const aLocale = locale === 'ms' ? 'ms-MY' : 'en-GB';
  return new Date(dateString).toLocaleDateString(aLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getOrdinal = (num: number, lang: 'en' | 'ms' = 'en') => {
  if (lang === 'ms') {
    return `ke-${num}`;
  }
  const s = ['th', 'st', 'nd', 'rd'];
  const v = num % 100;
  return num + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getCollaborationStatus = (collaboration: Pick<Collaboration, 'endDate' | 'extensionPeriods'>): CollaborationStatus[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates without time

    const validPeriods = (collaboration.extensionPeriods || []).filter(d => d);
    const allEndDatesStrings = [collaboration.endDate, ...validPeriods];

    const allEndDates = allEndDatesStrings
        .filter(Boolean)
        .map(d => {
            const parts = d.split('-').map(Number);
            return new Date(parts[0], parts[1] - 1, parts[2]);
        });
    
    if (allEndDates.length === 0) return ['Expired'];

    const latestEndDate = new Date(Math.max(...allEndDates.map(d => d.getTime())));

    if (latestEndDate < today) {
        return ['Expired'];
    }
    
    if (validPeriods.length > 0) {
        return ['Active', 'Extended'];
    }

    return ['Active'];
};
