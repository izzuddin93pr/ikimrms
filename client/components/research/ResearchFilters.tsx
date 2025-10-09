
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import { downloadResearchListPDF, downloadFullResearchReport } from '../../utils/pdfGenerator';
import { ResearchStatus, TranslationPayload } from '../../types';
import { researchStatusTranslationKeys, roleTranslationKeys, externalResearchStatusTranslationKeys } from '../../utils/translations';


interface ResearchFiltersProps {
  filters: { status: string; centreId: string; startYear: string; completionYear: string; };
  setFilters: React.Dispatch<React.SetStateAction<{ status: string; centreId: string; startYear: string; completionYear: string; }>>;
}

const ResearchFilters: React.FC<ResearchFiltersProps> = ({ filters, setFilters }) => {
  const { academicCentres, research } = useContext(AppContext);
  const { t, language } = useContext(LanguageContext);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', centreId: '', startYear: '', completionYear: '' });
  };
  
  const { startYears, completionYears } = useMemo(() => {
      const sYears = new Set<number>();
      const cYears = new Set<number>();
      research.forEach(r => {
          sYears.add(new Date(r.startDate).getFullYear());
          if(r.status === 'Completed') {
              cYears.add(new Date(r.endDate).getFullYear());
          }
      });
      return { 
          startYears: Array.from(sYears).sort((a,b) => b - a),
          completionYears: Array.from(cYears).sort((a,b) => b - a)
      };
  }, [research]);

  const researchStatuses: ResearchStatus[] = ['Active-Ongoing (From Past Years)', 'Active-Ongoing (New)', 'Unregistered', 'Completed'];
  
  const getTranslationPayload = (): TranslationPayload => ({
      t,
      locale: language,
      statusTranslationKeys: researchStatusTranslationKeys,
      roleTranslationKeys,
      // FIX: Corrected typo from externalStatusTranslationKeys to externalResearchStatusTranslationKeys
      externalStatusTranslationKeys: externalResearchStatusTranslationKeys,
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('research.filtersTitle')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.status')}</label>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">{t('research.allStatus')}</option>
            {researchStatuses.map(status => <option key={status} value={status}>{t(researchStatusTranslationKeys[status])}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.centre')}</label>
          <select name="centreId" value={filters.centreId} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">{t('research.allCentres')}</option>
            {academicCentres.map(c => <option key={c.id} value={c.id}>{c.abbr}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('research.startYear')}</label>
          <select name="startYear" value={filters.startYear} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">{t('research.allYears')}</option>
            {startYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('research.completionYear')}</label>
            <select name="completionYear" value={filters.completionYear} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">{t('research.allYears')}</option>
                {completionYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <button onClick={clearFilters} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300">
          {t('common.clearFilters')}
        </button>
        <button onClick={() => downloadResearchListPDF(research, academicCentres, getTranslationPayload())} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300">
          <i className="fas fa-download mr-2"></i>{t('common.downloadPdf')}
        </button>
        <button onClick={() => downloadFullResearchReport(research, academicCentres, getTranslationPayload())} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-300">
            <i className="fas fa-file-pdf mr-2"></i>{t('research.downloadFullReport')}
        </button>
      </div>
    </div>
  );
};

export default ResearchFilters;
