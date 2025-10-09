

import React, { useContext, useMemo } from 'react';
import type { Research, ResearchStatus, TranslationPayload } from '../../types';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import { getOrdinal } from '../../utils/helpers';
import { downloadSingleResearchPDF } from '../../utils/pdfGenerator';
import { useFormatDate } from '../../hooks/useFormatDate';
import { researchStatusTranslationKeys, roleTranslationKeys, externalResearchStatusTranslationKeys } from '../../utils/translations';


interface ResearchCardProps {
  research: Research;
  onView: (research: Research) => void;
  onEdit?: (research: Research) => void;
  onDelete?: (research: Research) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}

const ResearchCard: React.FC<ResearchCardProps> = ({ research, onView, onEdit, onDelete, isSelected, onToggleSelect }) => {
  const { academicCentres } = useContext(AppContext);
  const { t, language } = useContext(LanguageContext);
  const formatDate = useFormatDate();

  // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
  // FIX: Corrected comparison to be between two strings.
  const centre = academicCentres.find(c => c.id === research.centreId);

  const statusColor: Record<ResearchStatus, string> = {
    'Active-Ongoing (From Past Years)': 'bg-blue-100 text-blue-800',
    'Active-Ongoing (New)': 'bg-blue-100 text-blue-800',
    'Unregistered': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
  };
  const displayStatus = research.status.includes('Ongoing') ? t('research.ongoing') : t(researchStatusTranslationKeys[research.status]);
  
  const getTranslationPayload = (): TranslationPayload => ({
      t,
      locale: language,
      statusTranslationKeys: researchStatusTranslationKeys,
      roleTranslationKeys,
      externalStatusTranslationKeys: externalResearchStatusTranslationKeys,
  });

  const handleDownloadReport = () => {
    downloadSingleResearchPDF(research, academicCentres, getTranslationPayload());
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 transition-shadow hover:shadow-lg">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 pr-2">
            <input 
                type="checkbox" 
                checked={isSelected}
                onChange={() => onToggleSelect(research.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer flex-shrink-0"
                aria-label={`Select research titled ${research.title}`}
            />
            <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">{research.title}</h3>
                <div className="mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor[research.status]}`}>{displayStatus}</span>
                </div>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-1 flex-shrink-0">
            <button onClick={() => onView(research)} className="text-gray-500 hover:text-green-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-green-50" title={t('common.view')}><i className="fas fa-eye"></i></button>
            {onEdit && <button onClick={() => onEdit(research)} className="text-gray-500 hover:text-blue-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-blue-50" title={t('common.edit')}><i className="fas fa-edit"></i></button>}
            {onDelete && <button onClick={() => onDelete(research)} className="text-gray-500 hover:text-red-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-50" title={t('common.delete')}><i className="fas fa-trash"></i></button>}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('common.centre')}</p>
              <p className="font-bold text-gray-800">{centre ? centre.abbr : t('common.na')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">{t('common.period')}</p>
              <p className="font-bold text-gray-800 text-sm">{formatDate(research.startDate)} - {formatDate(research.endDate)}</p>
              {research.extensionPeriods && research.extensionPeriods.length > 0 && (
                <div className="mt-1 text-xs text-blue-600"><span className="font-semibold">{t('research.extensions')}:</span>{research.extensionPeriods.map((date, i) => (<p key={i}>{getOrdinal(i + 1, language)}: {formatDate(date)}</p>))}</div>
              )}
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-sm text-gray-500 mb-1">{t('dashboard.overallProgress')}</p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${research.progress}%` }}></div></div>
                <p className="text-sm font-bold text-gray-700 w-10 text-right">{research.progress.toFixed(0)}%</p>
              </div>
            </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <div>
            <p className="text-sm text-gray-700 font-medium">{t('common.team')}: {t('research.teamMembers', { count: research.team.length })}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {research.id}</p>
        </div>
        <button onClick={handleDownloadReport} className="bg-red-600 text-white px-3 py-2 sm:px-4 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all duration-300 flex items-center flex-shrink-0 transform hover:scale-105"><i className="fas fa-download mr-1 sm:mr-2"></i><span className="hidden sm:inline">{t('research.downloadReport')}</span><span className="sm:hidden">{t('common.download')}</span></button>
      </div>
    </div>
  );
};

export default ResearchCard;
