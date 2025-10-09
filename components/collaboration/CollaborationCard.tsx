
import React, { useContext } from 'react';
import type { Collaboration, CollaborationStatus } from '../../types';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import { getCollaborationStatus } from '../../utils/helpers';
import { useFormatDate } from '../../hooks/useFormatDate';
import { collaborationStatusTranslationKeys } from '../../utils/translations';


interface CollaborationCardProps {
  collaboration: Collaboration;
  onEdit?: (collaboration: Collaboration) => void;
  onDelete?: (collaboration: Collaboration) => void;
}

const CollaborationCard: React.FC<CollaborationCardProps> = ({ collaboration, onEdit, onDelete }) => {
  const { academicCentres } = useContext(AppContext);
  const { t } = useContext(LanguageContext);
  const formatDate = useFormatDate();
  // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
  // FIX: Corrected comparison to be between two strings.
  const centre = academicCentres.find(c => c.id === collaboration.centreId);
  
  const validPeriods = (collaboration.extensionPeriods || []).filter(d => d);
  const allEndDatesStrings = [collaboration.endDate, ...validPeriods];
  const effectiveEndDate = allEndDatesStrings.sort().pop() || collaboration.endDate;

  const statuses = getCollaborationStatus(collaboration);

  const statusColors: Record<CollaborationStatus, string> = {
    Active: 'bg-green-100 text-green-800',
    Expired: 'bg-gray-100 text-gray-800',
    Extended: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{collaboration.organization}</h3>
          <div className="flex items-center space-x-2">
            {statuses.map(status => (
                <span key={status} className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}>
                  {t(collaborationStatusTranslationKeys[status])}
                </span>
            ))}
          </div>
        </div>
        <div className="flex space-x-2">
            {onEdit && (
                <button onClick={() => onEdit(collaboration)} className="text-blue-600 hover:text-blue-800" title={t('common.edit')}>
                    <i className="fas fa-edit"></i>
                </button>
            )}
            {onDelete && (
                <button onClick={() => onDelete(collaboration)} className="text-red-600 hover:text-red-800" title={t('common.delete')}>
                    <i className="fas fa-trash"></i>
                </button>
            )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">{t('collaboration.type')}</p>
          <p className="font-medium">{collaboration.type}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{t('common.period')}</p>
          <p className="font-medium">{formatDate(collaboration.startDate)} - {formatDate(effectiveEndDate)}</p>
          {validPeriods.length > 0 && (
            <div className="mt-2 pl-2 border-l-2 border-blue-200">
                {validPeriods.map((date, index) => (
                    <p key={index} className="text-xs text-gray-600 ml-2">
                        <i className="fas fa-calendar-plus fa-fw text-blue-400 mr-1"></i>
                        <span className="font-semibold">{t('research.extensions')} {index + 1}:</span> {formatDate(date)}
                    </p>
                ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-gray-600">{t('collaboration.centreInCharge')}</p>
          <p className="font-medium">{centre ? centre.abbr : t('common.na')}</p>
        </div>
      </div>
    </div>
  );
};

export default CollaborationCard;
