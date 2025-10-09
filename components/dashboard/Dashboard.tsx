
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import StatCard from './StatCard';
import { ResearchStatus, TranslationPayload } from '../../types';
import { getCollaborationStatus } from '../../utils/helpers';
import { useTimeAgo } from '../../hooks/useTimeAgo';
import { researchStatusTranslationKeys, roleTranslationKeys, externalResearchStatusTranslationKeys, collaborationStatusTranslationKeys } from '../../utils/translations';
import YearlyBudgetSummary from './YearlyBudgetSummary';
import { downloadYearlyBudgetSummaryPDF, downloadProjectStatusSummaryPDF } from '../../utils/pdfGenerator';
import ProjectStatusSummary from './ProjectStatusSummary';

const Dashboard: React.FC = () => {
  const { research, collaborations, researchers, academicCentres } = useContext(AppContext);
  const { t, language } = useContext(LanguageContext);
  const getTimeAgo = useTimeAgo();

  const getTranslationPayload = (): TranslationPayload => ({
      t,
      locale: language,
      statusTranslationKeys: { ...researchStatusTranslationKeys, ...collaborationStatusTranslationKeys },
      roleTranslationKeys,
      externalStatusTranslationKeys: externalResearchStatusTranslationKeys,
  });

  const dashboardStats = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const yearlyDataByCentre = academicCentres.map(centre => {
        // FIX: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centreResearch = research.filter(r => r.centreId === centre.id);
        const yearlyProgressForCurrentYear = centreResearch.flatMap(r => r.yearlyProgress || [])
            .filter(yp => yp.year === currentYear);
        
        const yearlyBudget = yearlyProgressForCurrentYear.reduce((sum, yp) => sum + (yp.budgetLimit || 0), 0);
        const yearlySpending = yearlyProgressForCurrentYear.reduce((sum, yp) => sum + (yp.budgetSpent || 0), 0);

        return {
            centreId: centre.id,
            centreAbbr: centre.abbr,
            yearlyBudget,
            yearlySpending,
            spendingPercentage: yearlyBudget > 0 ? (yearlySpending / yearlyBudget) * 100 : 0
        };
    });
    
    const yearlyCentreSummary = yearlyDataByCentre.filter(d => d.yearlyBudget > 0);

    const totalYearlyBudget = yearlyCentreSummary.reduce((sum, item) => sum + item.yearlyBudget, 0);
    const totalYearlySpending = yearlyCentreSummary.reduce((sum, item) => sum + item.yearlySpending, 0);
    const totalSpendingPercentage = totalYearlyBudget > 0 ? (totalYearlySpending / totalYearlyBudget) * 100 : 0;

    const totalBudget = totalYearlyBudget;
    const totalSpending = totalYearlySpending;

    const statusCounts = research.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
    }, {} as Record<ResearchStatus, number>);

    const progressDistribution: Record<string, number> = {
        '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0,
    };
    research.forEach(r => {
        if (r.progress <= 25) progressDistribution['0-25']++;
        else if (r.progress <= 50) progressDistribution['26-50']++;
        else if (r.progress <= 75) progressDistribution['51-75']++;
        else progressDistribution['76-100']++;
    });

    const totalOngoing = (statusCounts['Active-Ongoing (From Past Years)'] || 0) + (statusCounts['Active-Ongoing (New)'] || 0);
    const activeCollabCount = collaborations.filter(c => !getCollaborationStatus(c).includes('Expired')).length;
    const piCount = new Set(researchers.flatMap(r => r.involvements.filter(i => i.role === 'Principal Investigator').map(() => r.id))).size;
    
    const financialsByCentre = academicCentres.map(centre => {
        // FIX: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centreResearch = research.filter(r => r.centreId === centre.id);
        const budget = centreResearch.reduce((sum, r) => sum + r.budget, 0);
        const spending = centreResearch.reduce((sum, r) => sum + r.spending, 0);

        const yearlyDataMap = centreResearch.reduce((acc, r) => {
            (r.yearlyProgress || []).forEach(yp => {
                const yearData = acc.get(yp.year) || { budget: 0, spending: 0 };
                yearData.budget += yp.budgetLimit || 0;
                yearData.spending += yp.budgetSpent || 0;
                acc.set(yp.year, yearData);
            });
            return acc;
        }, new Map<number, { budget: number; spending: number }>());

        const yearlyData = Array.from(yearlyDataMap.entries())
            .map(([year, data]) => ({ year, ...data }))
            .filter(y => y.budget > 0).sort((a, b) => b.year - a.year);

        return { ...centre, budget, spending, yearlyData };
    }).filter(c => c.budget > 0 || c.yearlyData.length > 0);

    const projectStatusSummary = academicCentres.map(centre => {
        // FIX: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centreResearch = research.filter(r => r.centreId === centre.id);
        const counts: Record<ResearchStatus, number> = {
            'Active-Ongoing (New)': centreResearch.filter(r => r.status === 'Active-Ongoing (New)').length,
            'Active-Ongoing (From Past Years)': centreResearch.filter(r => r.status === 'Active-Ongoing (From Past Years)').length,
            'Unregistered': centreResearch.filter(r => r.status === 'Unregistered').length,
            'Completed': centreResearch.filter(r => r.status === 'Completed').length,
        };
        const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
        return {
            centreId: centre.id,
            centreAbbr: centre.abbr,
            counts,
            total,
        };
    }).filter(summary => summary.total > 0);

    const totalStatusCounts: Record<ResearchStatus, number> = {
        'Active-Ongoing (New)': projectStatusSummary.reduce((sum, s) => sum + s.counts['Active-Ongoing (New)'], 0),
        'Active-Ongoing (From Past Years)': projectStatusSummary.reduce((sum, s) => sum + s.counts['Active-Ongoing (From Past Years)'], 0),
        'Unregistered': projectStatusSummary.reduce((sum, s) => sum + s.counts['Unregistered'], 0),
        'Completed': projectStatusSummary.reduce((sum, s) => sum + s.counts['Completed'], 0),
    };
    const grandTotalProjects = Object.values(totalStatusCounts).reduce((sum, count) => sum + count, 0);

    return {
      totalResearch: research.length,
      ongoingResearch: totalOngoing,
      totalCollaborations: collaborations.length,
      activeCollaborations: activeCollabCount,
      totalResearchers: researchers.length,
      principalInvestigators: piCount,
      totalBudget,
      totalSpending,
      statusCounts,
      progressDistribution,
      financialsByCentre,
      yearlyCentreSummary,
      totalYearlyBudget,
      totalYearlySpending,
      totalSpendingPercentage,
      currentYear,
      projectStatusSummary,
      totalStatusCounts,
      grandTotalProjects
    };
  }, [research, collaborations, researchers, academicCentres]);

  const handleDownloadSummaryPdf = () => {
    downloadYearlyBudgetSummaryPDF(
        dashboardStats.yearlyCentreSummary,
        {
            budget: dashboardStats.totalYearlyBudget,
            spending: dashboardStats.totalYearlySpending,
            percentage: dashboardStats.totalSpendingPercentage,
        },
        dashboardStats.currentYear,
        getTranslationPayload()
    );
  };
  
   const handleDownloadProjectStatusPdf = () => {
    downloadProjectStatusSummaryPDF(
        dashboardStats.projectStatusSummary,
        dashboardStats.totalStatusCounts,
        dashboardStats.grandTotalProjects,
        getTranslationPayload()
    );
  };

  const recentActivities = useMemo(() => {
    const activities: any[] = [];
    research.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3).forEach(r => {
        // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centre = academicCentres.find(c => c.id === r.centreId);
        activities.push({
            type: 'research',
            title: t('dashboard.newResearch', { title: r.title }),
            subtitle: `${centre ? centre.abbr : '...'}`,
            date: new Date(r.createdAt),
            icon: 'fas fa-flask',
            color: 'text-blue-600'
        });
    });
     collaborations.slice().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2).forEach(c => {
        activities.push({
            type: 'collaboration',
            title: t('dashboard.newCollab', { organization: c.organization }),
            subtitle: c.type,
            date: new Date(c.createdAt),
            icon: 'fas fa-handshake',
            color: 'text-purple-600'
        });
    });

    return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);
  }, [research, collaborations, academicCentres, t]);

  const statusDisplayOrder: ResearchStatus[] = ['Active-Ongoing (New)', 'Active-Ongoing (From Past Years)', 'Unregistered', 'Completed'];
  const statusColorMapping: Record<ResearchStatus, string> = {
    'Active-Ongoing (New)': 'bg-teal-500', 'Active-Ongoing (From Past Years)': 'bg-blue-500',
    'Unregistered': 'bg-yellow-500', 'Completed': 'bg-green-500',
  };
  const progressDisplayOrder: (keyof typeof dashboardStats.progressDistribution)[] = ['76-100', '51-75', '26-50', '0-25'];
  const progressColorMapping = { '76-100': 'bg-green-500', '51-75': 'bg-blue-500', '26-50': 'bg-orange-500', '0-25': 'bg-red-500' };

  return (
    <div id="dashboardSection" className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{t('dashboard.title')}</h2>
        <p className="text-sm sm:text-base text-gray-600">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard titleKey="dashboard.totalResearch" value={dashboardStats.totalResearch.toString()} subtitle={`${dashboardStats.ongoingResearch} ${t('dashboard.ongoing')}`} icon="fa-flask" color="blue" />
        <StatCard titleKey="dashboard.collaborations" value={dashboardStats.totalCollaborations.toString()} subtitle={`${dashboardStats.activeCollaborations} ${t('dashboard.active')}`} icon="fa-handshake" color="purple" />
        <StatCard titleKey="dashboard.researchers" value={dashboardStats.totalResearchers.toString()} subtitle={`${dashboardStats.principalInvestigators} ${t('dashboard.principalInvestigators')}`} icon="fa-user-graduate" color="green" />
        <StatCard titleKey="dashboard.totalBudget" value={`RM ${dashboardStats.totalBudget.toLocaleString()}`} subtitle={`RM ${dashboardStats.totalSpending.toLocaleString()} ${t('dashboard.spent')}`} icon="fa-dollar-sign" color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.statusDistribution')}</h3>
            <div className="space-y-4">
                {statusDisplayOrder.map((status) => {
                    const count = dashboardStats.statusCounts[status] || 0;
                    const percentage = dashboardStats.totalResearch > 0 ? (count / dashboardStats.totalResearch) * 100 : 0;
                    return (
                        <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center"><div className={`w-4 h-4 ${statusColorMapping[status]} rounded-full mr-3`}></div><span className="text-gray-700">{t(researchStatusTranslationKeys[status])}</span></div>
                            <div className="flex items-center"><span className="text-gray-900 font-medium mr-2">{count}</span><div className="w-32 bg-gray-200 rounded-full h-2"><div className={`${statusColorMapping[status]} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div></div></div>
                        </div>
                    );
                })}
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.overallProgress')}</h3>
            <div className="space-y-4">
                {progressDisplayOrder.map((range) => {
                    const count = dashboardStats.progressDistribution[range];
                    const percentage = dashboardStats.totalResearch > 0 ? (count / dashboardStats.totalResearch) * 100 : 0;
                    return (
                        <div key={range}>
                            <div className="flex justify-between items-center mb-1"><span className="text-sm text-gray-700">{range}%</span><span className="text-sm font-medium text-gray-900">{count} {count === 1 ? t('dashboard.project') : t('dashboard.projects')}</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5"><div className={`${progressColorMapping[range]} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div></div>
                        </div>
                    );
                })}
            </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.researchByCentre')}</h3>
            <div className="space-y-3">
                {academicCentres.map(centre => {
                    // FIX: This comparison appears to be unintentional because the types 'number' and 'string' have no overlap.
                    // FIX: Corrected comparison to be between two strings.
                    const count = research.filter(r => r.centreId === centre.id).length;
                    const percentage = dashboardStats.totalResearch > 0 ? (count / dashboardStats.totalResearch) * 100 : 0;
                    if(count === 0) return null;
                    return (
                        <div key={centre.id} className="flex items-center justify-between">
                            <div className="flex items-center"><div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div><span className="text-gray-700 text-sm">{centre.abbr}</span></div>
                            <div className="flex items-center"><span className="text-gray-900 font-medium text-sm mr-2">{count}</span><div className="w-20 bg-gray-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percentage}%` }}></div></div></div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.financialOverview')}</h3>
                <div className="mb-8">
                    <div className="flex justify-between items-end mb-1"><span className="text-gray-600">{t('dashboard.overallUtilization')} ({dashboardStats.currentYear})</span><div className="flex items-baseline"><span className="font-bold text-xl text-gray-800">RM {dashboardStats.totalSpending.toLocaleString()}</span><span className="text-gray-500 ml-2"> / RM {dashboardStats.totalBudget.toLocaleString()}</span><span className="font-semibold text-blue-600 ml-3 text-lg">({(dashboardStats.totalBudget > 0 ? (dashboardStats.totalSpending / dashboardStats.totalBudget) * 100 : 0).toFixed(1)}%)</span></div></div>
                    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner"><div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-500" style={{ width: `${(dashboardStats.totalBudget > 0 ? (dashboardStats.totalSpending / dashboardStats.totalBudget) * 100 : 0).toFixed(2)}%` }}></div></div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-800 mb-3 border-t pt-4">{t('dashboard.breakdownByCentre')}</h4>
                     <div className="space-y-2">
                        {dashboardStats.financialsByCentre.map(centre => {
                            const percentage = centre.budget > 0 ? (centre.spending / centre.budget) * 100 : 0;
                            return (
                            <div key={centre.id} className="py-2 border-b border-gray-100 last:border-b-0">
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm"><span className="font-medium text-gray-700">{centre.abbr} - {t('dashboard.overall')}</span><div className="flex items-center"><span className="text-gray-600">RM {centre.spending.toLocaleString()} / <span className="text-gray-500">RM {centre.budget.toLocaleString()}</span></span><span className="font-semibold text-blue-600 w-16 text-right">({percentage.toFixed(1)}%)</span></div></div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percentage.toFixed(2)}%` }}></div></div>
                                </div>
                                {centre.yearlyData && centre.yearlyData.length > 0 && (
                                    <div className="pl-4 mt-3 space-y-3">
                                        {centre.yearlyData.map(yearData => {
                                            const yearlyPercentage = yearData.budget > 0 ? (yearData.spending / yearData.budget) * 100 : 0;
                                            return (
                                                <div key={yearData.year}>
                                                    <div className="flex justify-between items-center mb-1 text-xs"><span className="font-medium text-gray-600">{yearData.year}</span><div className="flex items-center"><span className="text-gray-600">RM {yearData.spending.toLocaleString()} / <span className="text-gray-500">RM {yearData.budget.toLocaleString()}</span></span><span className="font-semibold text-teal-600 w-16 text-right">({yearlyPercentage.toFixed(1)}%)</span></div></div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${yearlyPercentage.toFixed(2)}%` }}></div></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            );
                        })}
                        {dashboardStats.financialsByCentre.length === 0 && (<p className="text-gray-500 text-sm text-center py-4">{t('dashboard.noCentreBudgetData')}</p>)}
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.recentActivity')}</h3>
                <div className="space-y-4">
                {recentActivities.length > 0 ? recentActivities.map(activity => (
                    <div key={activity.date.toISOString()} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0"><div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm"><i className={`${activity.icon} ${activity.color} text-sm`}></i></div></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p><p className="text-xs text-gray-500">{activity.subtitle}</p><p className="text-xs text-gray-400 mt-1">{getTimeAgo(activity.date.toISOString())}</p></div>
                    </div>
                )) : <p className="text-gray-500 text-sm">{t('dashboard.noRecentActivity')}</p>}
                </div>
            </div>
        </div>
        
        <div>
            {dashboardStats.yearlyCentreSummary.length > 0 && (
                <YearlyBudgetSummary
                    summary={dashboardStats.yearlyCentreSummary}
                    totals={{
                        budget: dashboardStats.totalYearlyBudget,
                        spending: dashboardStats.totalYearlySpending,
                        percentage: dashboardStats.totalSpendingPercentage,
                    }}
                    year={dashboardStats.currentYear}
                    onDownloadPdf={handleDownloadSummaryPdf}
                />
            )}
        </div>
        
        <div>
            {dashboardStats.projectStatusSummary.length > 0 && (
                <ProjectStatusSummary
                    summary={dashboardStats.projectStatusSummary}
                    totals={dashboardStats.totalStatusCounts}
                    grandTotal={dashboardStats.grandTotalProjects}
                    onDownloadPdf={handleDownloadProjectStatusPdf}
                />
            )}
        </div>
    </div>
  );
};

export default Dashboard;
