import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';
import { ResearchStatus } from '../../types';

interface SummaryItem {
  centreAbbr: string;
  counts: Record<ResearchStatus, number>;
  total: number;
}

interface ProjectStatusSummaryProps {
  summary: SummaryItem[];
  totals: Record<ResearchStatus, number>;
  grandTotal: number;
  onDownloadPdf: () => void;
}

const ProjectStatusSummary: React.FC<ProjectStatusSummaryProps> = ({ summary, totals, grandTotal, onDownloadPdf }) => {
  const { t } = useContext(LanguageContext);

  const statusOrder: ResearchStatus[] = [
    'Active-Ongoing (New)',
    'Active-Ongoing (From Past Years)',
    'Unregistered',
    'Completed'
  ];

  const statusHeaderKeys: Record<ResearchStatus, string> = {
    'Active-Ongoing (New)': 'pdf.activeNew',
    'Active-Ongoing (From Past Years)': 'pdf.activePast',
    'Unregistered': 'pdf.unregistered',
    'Completed': 'pdf.completed'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.projectStatusSummary')}</h3>
        <button onClick={onDownloadPdf} className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300">
          <i className="fas fa-file-pdf mr-2"></i>
          {t('common.downloadPdf')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.centre')}</th>
              {statusOrder.map(status => (
                <th key={status} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t(statusHeaderKeys[status])}</th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pdf.total')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summary.map(item => (
              <tr key={item.centreAbbr}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.centreAbbr}</td>
                {statusOrder.map(status => (
                    <td key={status} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.counts[status]}</td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 text-right">{item.total}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{t('pdf.total')}</td>
              {statusOrder.map(status => (
                <td key={status} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals[status]}</td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{grandTotal}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ProjectStatusSummary;