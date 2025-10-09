
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import { downloadResearchersSummaryPDF, downloadFullResearchersReport } from '../../utils/pdfGenerator';
import { TranslationPayload } from '../../types';
import { researchStatusTranslationKeys, researchRoleTranslationKeys, externalResearchStatusTranslationKeys, roleTranslationKeys } from '../../utils/translations';


interface ResearcherFiltersProps {
  filters: { searchTerm: string; role: string; centreId: string };
  setFilters: React.Dispatch<React.SetStateAction<{ searchTerm: string; role: string; centreId: string }>>;
}

const ResearcherFilters: React.FC<ResearcherFiltersProps> = ({ filters, setFilters }) => {
  const { academicCentres, researchers, research } = useContext(AppContext);
  const { t, language } = useContext(LanguageContext);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const getTranslationPayload = (): TranslationPayload => ({
      t,
      locale: language,
      statusTranslationKeys: researchStatusTranslationKeys,
      roleTranslationKeys: {...roleTranslationKeys, ...researchRoleTranslationKeys},
      // FIX: Corrected typo from externalStatusTranslationKeys to externalResearchStatusTranslationKeys
      externalStatusTranslationKeys: externalResearchStatusTranslationKeys,
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">{t('common.search')}</label>
          <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleChange} placeholder={t('researchers.searchPlaceholder')} className="input" />
        </div>
        <div>
          <label className="label">{t('researchers.filterByRole')}</label>
          <select name="role" value={filters.role} onChange={handleChange} className="input">
            <option value="">{t('researchers.allRoles')}</option>
            <option value="Principal Investigator">{t('roles.Principal Investigator')}</option>
            <option value="Research Secretary">{t('roles.Research Secretary')}</option>
            <option value="Research Member">{t('roles.Research Member')}</option>
          </select>
        </div>
        <div>
          <label className="label">{t('researchers.filterByCentre')}</label>
          <select name="centreId" value={filters.centreId} onChange={handleChange} className="input">
            <option value="">{t('researchers.allCentres')}</option>
            {academicCentres.map(c => <option key={c.id} value={c.id}>{c.abbr}</option>)}
          </select>
        </div>
      </div>
       <div className="mt-4 flex flex-wrap gap-4">
            <button onClick={() => downloadResearchersSummaryPDF(researchers, academicCentres, getTranslationPayload())} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300">
                <i className="fas fa-download mr-2"></i>{t('researchers.downloadSummary')}
            </button>
            <button onClick={() => downloadFullResearchersReport(researchers, academicCentres, research, getTranslationPayload())} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300">
                <i className="fas fa-file-pdf mr-2"></i>{t('researchers.downloadFullReport')}
            </button>
        </div>
    </div>
  );
};

export default ResearcherFilters;
