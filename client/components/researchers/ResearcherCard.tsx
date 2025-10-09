
import React, { useContext } from 'react';
import type { Researcher, ResearchInvolvement, ResearchStatus, ExternalResearchStatus, TranslationPayload } from '../../types';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import { downloadSingleResearcherPDF } from '../../utils/pdfGenerator';
import { researchStatusTranslationKeys, researchRoleTranslationKeys, externalResearchStatusTranslationKeys, roleTranslationKeys } from '../../utils/translations';


interface ResearcherCardProps {
  researcher: Researcher;
  onEdit?: (researcher: Researcher) => void;
  onDelete?: (researcher: Researcher) => void;
}

const ResearcherCard: React.FC<ResearcherCardProps> = ({ researcher, onEdit, onDelete }) => {
  const { academicCentres, research } = useContext(AppContext);
  const { t, language } = useContext(LanguageContext);
  // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
  // FIX: Corrected comparison to be between two strings.
  const centre = academicCentres.find(c => c.id === researcher.centreId);

  const roleColorMap: Record<ResearchInvolvement['role'], string> = {
    'Principal Investigator': 'bg-purple-100 text-purple-800',
    'Research Secretary': 'bg-blue-100 text-blue-800',
    'Research Member': 'bg-green-100 text-green-800',
  };
  
  const statusColorMap: Record<ResearchStatus, string> = {
    'Active-Ongoing (From Past Years)': 'bg-blue-100 text-blue-800',
    'Active-Ongoing (New)': 'bg-teal-100 text-teal-800',
    'Unregistered': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
  };

  const externalStatusColorMap: Record<ExternalResearchStatus, string> = {
    'Active-Ongoing': 'bg-teal-100 text-teal-800',
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
  };
  
  const getTranslationPayload = (): TranslationPayload => ({
      t,
      locale: language,
      statusTranslationKeys: researchStatusTranslationKeys,
      roleTranslationKeys: {...roleTranslationKeys, ...researchRoleTranslationKeys},
      externalStatusTranslationKeys: externalResearchStatusTranslationKeys,
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{researcher.name}</h3>
          <p className="text-gray-600 mb-2">{researcher.email}</p>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{centre ? centre.abbr : t('common.na')}</span>
        </div>
        <div className="flex items-center space-x-2">
            {onEdit && <button onClick={() => onEdit(researcher)} className="text-gray-500 hover:text-blue-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-blue-50" title={t('common.edit')}><i className="fas fa-edit"></i></button>}
            <button onClick={() => downloadSingleResearcherPDF(researcher, academicCentres, research, getTranslationPayload())} className="text-gray-500 hover:text-green-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-green-50" title={t('research.downloadReport')}><i className="fas fa-download"></i></button>}
            {onDelete && <button onClick={() => onDelete(researcher)} className="text-gray-500 hover:text-red-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-50" title={t('common.delete')}><i className="fas fa-trash"></i></button>}
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">{t('researchers.involvements', { count: researcher.involvements.length })}</h4>
        <div className="space-y-3">
          {researcher.involvements.map((involvement, index) => {
            const invType = involvement.type || 'internal'; // Backward compatibility
            let title = t('researchers.unknownResearch');
            let researchItem = null;
            let typeTagColor = 'bg-blue-100 text-blue-800';
            let typeTagText = t('researchers.internal');
            let statusTag = null;

            if (invType === 'internal' && involvement.researchId) {
                researchItem = research.find(r => r.id === involvement.researchId);
                if (researchItem) {
                    title = researchItem.title;
                    statusTag = <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColorMap[researchItem.status]}`}>{t(researchStatusTranslationKeys[researchItem.status])}</span>;
                }
            } else if (invType === 'external' && involvement.externalProjectTitle) {
                title = involvement.externalProjectTitle;
                typeTagColor = 'bg-yellow-100 text-yellow-800';
                typeTagText = t('researchers.external');
                if(involvement.externalProjectStatus) {
                    // FIX: Corrected typo from externalStatusTranslationKeys to externalResearchStatusTranslationKeys
                    statusTag = <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${externalStatusColorMap[involvement.externalProjectStatus]}`}>{t(externalResearchStatusTranslationKeys[involvement.externalProjectStatus])}</span>;
                }
            }

            const roleColor = roleColorMap[involvement.role] || 'bg-gray-100 text-gray-800';
            
            return (
              <div key={`${researcher.id}-${involvement.researchId || involvement.externalProjectTitle || index}`} className="border rounded-lg p-4 bg-gray-50">
                <p className="font-medium text-gray-900">{title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${roleColor}`}>{t(researchRoleTranslationKeys[involvement.role])}</span>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${typeTagColor}`}>{typeTagText}</span>
                    {statusTag}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResearcherCard;
