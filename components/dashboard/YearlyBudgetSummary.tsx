import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';

interface SummaryItem {
  centreAbbr: string;
  yearlyBudget: number;
  yearlySpending: number;
  spendingPercentage: number;
}

interface YearlyBudgetSummaryProps {
  summary: SummaryItem[];
  totals: {
    budget: number;
    spending: number;
    percentage: number;
  };
  year: number;
  onDownloadPdf: () => void;
}

const YearlyBudgetSummary: React.FC<YearlyBudgetSummaryProps> = ({ summary, totals, year, onDownloadPdf }) => {
  const { t } = useContext(LanguageContext);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.yearlyBudgetSummary', { year })}</h3>
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
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('research.yearlyBudgetLimit')} (RM)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('research.yearlySpending')} (RM)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('dashboard.spent')} %</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {summary.map(item => (
              <tr key={item.centreAbbr}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.centreAbbr}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.yearlyBudget.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.yearlySpending.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.spendingPercentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{t('pdf.total')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.budget.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.spending.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">{totals.percentage.toFixed(2)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default YearlyBudgetSummary;
