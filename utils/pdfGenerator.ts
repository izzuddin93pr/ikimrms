
import type { Research, Collaboration, Researcher, AcademicCentre, TranslationPayload, ResearchStatus } from '../types';
import { formatDate, getOrdinal, getCollaborationStatus, formatFileSize } from './helpers';

// A type guard to ensure jsPDF is available on the window object
declare global {
  interface Window {
    jspdf: any;
  }
}

const addHeaderAndFooter = (doc: any, title: string, t: TranslationPayload['t']) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        // Header
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(t('pdf.ikimRms'), 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(title, 105, 22, { align: 'center' });
        
        // Footer
        doc.setFontSize(8);
        doc.text(t('pdf.page', { i, count: pageCount }), 105, 290, { align: 'center' });
        doc.text(`${t('pdf.generated')}: ${new Date().toLocaleString()}`, 20, 290);
    }
};

export const downloadResearchListPDF = (researchList: Research[], academicCentres: AcademicCentre[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t, locale, statusTranslationKeys } = translations;
    const doc = new jsPDF('landscape');

    const tableData = researchList.map(item => {
        // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centre = academicCentres.find(c => c.id === item.centreId);
        return [
            item.title.substring(0, 30),
            centre ? centre.abbr : t('common.na'),
            t(statusTranslationKeys[item.status]),
            `${formatDate(item.startDate, locale)} - ${formatDate(item.endDate, locale)}`,
            `RM ${item.budget.toLocaleString()}`,
            `RM ${item.spending.toLocaleString()}`,
            `${item.progress.toFixed(2)}%`,
        ];
    });

    doc.autoTable({
        head: [[t('pdf.title'), t('pdf.centre'), t('pdf.status'), t('pdf.period'), t('pdf.budget'), t('pdf.spending'), t('pdf.progress')]],
        body: tableData,
        startY: 30,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
    });
    
    addHeaderAndFooter(doc, t('pdf.researchReport'), t);
    doc.save(`IKIM_Research_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const downloadFullResearchReport = (researchList: Research[], academicCentres: AcademicCentre[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t, locale, statusTranslationKeys } = translations;
    const doc = new jsPDF();

    // Summary
    const ongoingCount = researchList.filter(r => r.status.startsWith('Active-Ongoing')).length;
    const completedCount = researchList.filter(r => r.status === 'Completed').length;
    const totalBudget = researchList.reduce((sum, r) => sum + r.budget, 0);
    const totalSpending = researchList.reduce((sum, r) => sum + r.spending, 0);

    const summaryData = [
        [t('pdf.totalProjects'), researchList.length],
        [t('pdf.ongoing'), ongoingCount],
        [t('pdf.completed'), completedCount],
        [t('pdf.totalBudget'), `RM ${totalBudget.toLocaleString()}`],
        [t('pdf.totalSpending'), `RM ${totalSpending.toLocaleString()}`],
    ];

    doc.autoTable({
        head: [[t('pdf.metric'), t('pdf.value')]],
        body: summaryData,
        startY: 30
    });

    // Detailed Table
     const detailedData = researchList.map(item => {
        // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centre = academicCentres.find(c => c.id === item.centreId);
        return [
            item.title.substring(0, 40),
            centre ? centre.abbr : t('common.na'),
            t(statusTranslationKeys[item.status]),
            formatDate(item.startDate, locale),
            formatDate(item.endDate, locale),
            `RM ${item.budget.toLocaleString()}`,
            `${item.progress.toFixed(2)}%`,
        ];
    });

    doc.autoTable({
        head: [[t('pdf.title'), t('pdf.centre'), t('pdf.status'), t('pdf.start'), t('pdf.end'), t('pdf.budget'), t('pdf.progress')]],
        body: detailedData,
        startY: doc.lastAutoTable.finalY + 10,
        styles: { fontSize: 8 }
    });
    
    addHeaderAndFooter(doc, t('pdf.fullResearchReport'), t);
    doc.save(`IKIM_Full_Research_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};


export const downloadSingleResearchPDF = (researchItem: Research, academicCentres: AcademicCentre[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t, locale, statusTranslationKeys } = translations;
    const doc = new jsPDF();
    // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
    // FIX: Corrected comparison to be between two strings.
    const centre = academicCentres.find(c => c.id === researchItem.centreId);
    let yPos = 30;

    const title = researchItem.title;
    const titleLines = doc.splitTextToSize(title, 170);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(titleLines, 20, yPos);
    yPos += titleLines.length * 6 + 5;

    // Basic Info
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`${t('common.centre')}: ${centre?.name || t('common.na')}`, 20, yPos);
    doc.text(`${t('common.status')}: ${t(statusTranslationKeys[researchItem.status])}`, 100, yPos);
    yPos += 7;
    doc.text(`${t('common.period')}: ${formatDate(researchItem.startDate, locale)} to ${formatDate(researchItem.endDate, locale)}`, 20, yPos);
    yPos += 10;
    
    // Description
    const descLines = doc.splitTextToSize(researchItem.description, 170);
    doc.text(descLines, 20, yPos);
    yPos += descLines.length * 5 + 10;

    // Financials
    const financialData = [
      [t('pdf.overallBudget'), `RM ${researchItem.budget.toLocaleString()}`],
      [t('pdf.overallSpending'), `RM ${researchItem.spending.toLocaleString()}`],
      [t('pdf.remainingOverall'), `RM ${(researchItem.budget - researchItem.spending).toLocaleString()}`]
    ];
    doc.autoTable({
        head: [[t('pdf.financialItem'), t('pdf.amount')]],
        body: financialData,
        startY: yPos,
    });
    yPos = doc.lastAutoTable.finalY + 10;

    // Yearly Progress/Budget Table
    if (researchItem.yearlyProgress && researchItem.yearlyProgress.length > 0) {
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(t('pdf.yearlyProgressBudget'), 20, yPos);
        yPos += 7;

        const yearlyData = researchItem.yearlyProgress.map(yp => [
            yp.year,
            `${yp.progress.toFixed(2)}%`,
            `RM ${(yp.budgetLimit || 0).toLocaleString()}`,
            `RM ${(yp.budgetSpent || 0).toLocaleString()}`,
            yp.notes || '',
        ]);

        doc.autoTable({
            head: [[t('pdf.year'), t('pdf.progress'), t('pdf.budgetLimit'), t('pdf.budgetSpent'), t('pdf.notes')]],
            body: yearlyData,
            startY: yPos,
            headStyles: { fillColor: [168, 85, 247] }, // Purple color
        });
        yPos = doc.lastAutoTable.finalY + 10;
    }

    // Team
    doc.autoTable({
        head: [[t('pdf.researchTeam')]],
        body: researchItem.team.map(member => [member]),
        startY: yPos,
    });

    addHeaderAndFooter(doc, t('pdf.individualResearchReport'), t);
    doc.save(`IKIM_Report_${title.substring(0, 20)}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const downloadSelectedResearchReportPDF = (selectedResearch: Research[], academicCentres: AcademicCentre[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t, statusTranslationKeys } = translations;
    const doc = new jsPDF();
    
    selectedResearch.forEach((item, index) => {
        if (index > 0) {
            doc.addPage();
        }
        let yPos = 30;

        // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centre = academicCentres.find(c => c.id === item.centreId);

        // Title
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        const titleLines = doc.splitTextToSize(item.title, 170);
        doc.text(titleLines, 20, yPos);
        yPos += titleLines.length * 7 + 5;

        // Sub-header info
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`${t('common.centre')}: ${centre?.abbr || t('common.na')} | ${t('common.status')}: ${t(statusTranslationKeys[item.status])}`, 20, yPos);
        yPos += 10;

        // Description
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(t('pdf.description'), 20, yPos);
        yPos += 6;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const descLines = doc.splitTextToSize(item.description, 170);
        doc.text(descLines, 20, yPos);
        yPos += descLines.length * 5 + 10;

        // Key Metrics Table
        const metricsData = [
            [t('pdf.overallBudget'), `RM ${item.budget.toLocaleString()}`],
            [t('pdf.overallSpending'), `RM ${item.spending.toLocaleString()}`],
            [t('common.progress'), `${item.progress.toFixed(2)}%`],
        ];
        doc.autoTable({
            head: [[t('pdf.keyMetrics'), t('pdf.value')]],
            body: metricsData,
            startY: yPos,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
        });
        yPos = doc.lastAutoTable.finalY + 10;

        // Documents Table
        if (item.documents && item.documents.length > 0) {
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(t('pdf.associatedDocs'), 20, yPos);
            yPos += 7;

            const docData = item.documents.map(doc => [
                doc.name,
                doc.type,
                formatFileSize(doc.fileSize),
            ]);

            doc.autoTable({
                head: [[t('pdf.docName'), t('pdf.type'), t('pdf.size')]],
                body: docData,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [107, 114, 128] }, // Gray
            });
        } else {
             doc.setFontSize(10);
             doc.setFont(undefined, 'italic');
             doc.text(t('pdf.noDocs'), 20, yPos);
        }
    });

    addHeaderAndFooter(doc, t('pdf.consolidatedResearchReport'), t);
    doc.save(`IKIM_Consolidated_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const downloadCollaborationsPDF = (collaborations: Collaboration[], academicCentres: AcademicCentre[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t, locale, statusTranslationKeys } = translations;
    const doc = new jsPDF();
    
    const tableData = collaborations.map(item => {
        // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centre = academicCentres.find(c => c.id === item.centreId);
        
        const validPeriods = (item.extensionPeriods || []).filter(d => d);
        const allEndDatesStrings = [item.endDate, ...validPeriods];
        const effectiveEndDate = allEndDatesStrings.sort().pop() || item.endDate;
        
        const statuses = getCollaborationStatus(item);

        return [
            item.organization,
            item.type,
            centre ? centre.abbr : t('common.na'),
            `${formatDate(item.startDate, locale)} - ${formatDate(effectiveEndDate, locale)}`,
            statuses.map(s => t(statusTranslationKeys[s])).join(', '),
        ];
    });

    doc.autoTable({
        head: [[t('pdf.organization'), t('pdf.type'), t('pdf.centre'), t('pdf.period'), t('pdf.status')]],
        body: tableData,
        startY: 30,
        headStyles: { fillColor: [147, 51, 234] },
    });

    addHeaderAndFooter(doc, t('pdf.collaborationsReport'), t);
    doc.save(`IKIM_Collaborations_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const downloadResearchersSummaryPDF = (researchers: Researcher[], academicCentres: AcademicCentre[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t } = translations;
    const doc = new jsPDF('landscape');

    const tableData = researchers.map(item => {
        // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centre = academicCentres.find(c => c.id === item.centreId);
        const piRoles = item.involvements.filter(inv => inv.role === 'Principal Investigator').length;
        const secretaryRoles = item.involvements.filter(inv => inv.role === 'Research Secretary').length;
        const memberRoles = item.involvements.filter(inv => inv.role === 'Research Member').length;
        return [
            item.name,
            item.email,
            centre ? centre.abbr : t('common.na'),
            item.involvements.length,
            piRoles,
            secretaryRoles,
            memberRoles
        ];
    });

    doc.autoTable({
        head: [[t('pdf.name'), t('pdf.email'), t('pdf.centre'), t('pdf.total'), t('pdf.pi'), t('pdf.secretary'), t('pdf.member')]],
        body: tableData,
        startY: 30,
        headStyles: { fillColor: [20, 184, 166] },
    });

    addHeaderAndFooter(doc, t('pdf.researchersSummaryReport'), t);
    doc.save(`IKIM_Researchers_Summary_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export const downloadSingleResearcherPDF = (researcher: Researcher, academicCentres: AcademicCentre[], researchList: Research[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t, statusTranslationKeys, roleTranslationKeys, externalStatusTranslationKeys } = translations;
    const doc = new jsPDF();
    // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
    // FIX: Corrected comparison to be between two strings.
    const centre = academicCentres.find(c => c.id === researcher.centreId);
    let yPos = 30;

    // Researcher Info
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(researcher.name, 20, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`${t('common.email')}: ${researcher.email}`, 20, yPos);
    yPos += 5;
    doc.text(`${t('common.centre')}: ${centre?.name || t('common.na')}`, 20, yPos);
    yPos += 10;

    // Involvements Table
    if (researcher.involvements && researcher.involvements.length > 0) {
        const tableData = researcher.involvements.map(inv => {
            let title = t('researchers.unknownResearch');
            let status = t('common.na');
            const type = inv.type === 'external' ? t('researchers.external') : t('researchers.internal');

            if (inv.type === 'internal' && inv.researchId) {
                const researchItem = researchList.find(r => r.id === inv.researchId);
                if (researchItem) {
                    title = researchItem.title;
                    status = t(statusTranslationKeys[researchItem.status]);
                }
            } else if (inv.type === 'external') {
                title = inv.externalProjectTitle || t('common.na');
                status = inv.externalProjectStatus ? t(externalStatusTranslationKeys[inv.externalProjectStatus]) : t('common.na');
            }
            
            return [
                title.substring(0, 50) + (title.length > 50 ? '...' : ''),
                type,
                t(roleTranslationKeys[inv.role]),
                status
            ];
        });

        doc.autoTable({
            head: [[t('pdf.projectTitle'), t('pdf.type'), t('pdf.role'), t('pdf.status')]],
            body: tableData,
            startY: yPos,
            headStyles: { fillColor: [20, 184, 166] }, // Teal color
        });
    } else {
        doc.text(t('pdf.noInvolvements'), 20, yPos);
    }
    
    addHeaderAndFooter(doc, t('pdf.researcherReport', { name: researcher.name }), t);
    doc.save(`IKIM_Researcher_Report_${researcher.name.replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const downloadFullResearchersReport = (researchers: Researcher[], academicCentres: AcademicCentre[], researchList: Research[], translations: TranslationPayload) => {
    const { jsPDF } = window.jspdf;
    const { t, statusTranslationKeys, roleTranslationKeys, externalStatusTranslationKeys } = translations;
    const doc = new jsPDF();
    let yPos = 30;
    const pageHeight = doc.internal.pageSize.height;
    const bottomMargin = 20;

    researchers.forEach((researcher) => {
        // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
        // FIX: Corrected comparison to be between two strings.
        const centre = academicCentres.find(c => c.id === researcher.centreId);
        
        const nameHeight = 7;
        const detailsHeight = 10;
        const tableHeaderHeight = 10;
        const tableRowHeight = 8;
        const sectionPadding = 15;
        const estimatedHeight = nameHeight + detailsHeight + tableHeaderHeight + (researcher.involvements.length * tableRowHeight) + sectionPadding;

        if (yPos > 30 && yPos + estimatedHeight > pageHeight - bottomMargin) {
            doc.addPage();
            yPos = 30;
        }
        
        if (yPos > 30) {
            doc.setDrawColor(200); // light gray
            doc.line(20, yPos - 5, 190, yPos - 5);
        }

        // Researcher Info
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(researcher.name, 20, yPos);
        yPos += 6;
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`${t('common.email')}: ${researcher.email} | ${t('common.centre')}: ${centre?.abbr || t('common.na')}`, 20, yPos);
        yPos += 8;

        // Involvements Table
        if (researcher.involvements && researcher.involvements.length > 0) {
            const tableData = researcher.involvements.map(inv => {
                let title = t('researchers.unknownResearch');
                let status = t('common.na');
                const type = inv.type === 'external' ? t('researchers.external') : t('researchers.internal');

                if (inv.type === 'internal' && inv.researchId) {
                    const researchItem = researchList.find(r => r.id === inv.researchId);
                    if (researchItem) {
                        title = researchItem.title;
                        status = t(statusTranslationKeys[researchItem.status]);
                    }
                } else if (inv.type === 'external') {
                    title = inv.externalProjectTitle || t('common.na');
                    status = inv.externalProjectStatus ? t(externalStatusTranslationKeys[inv.externalProjectStatus]) : t('common.na');
                }
                
                return [
                    title.substring(0, 45) + (title.length > 45 ? '...' : ''),
                    type,
                    t(roleTranslationKeys[inv.role]),
                    status
                ];
            });

            doc.autoTable({
                head: [[t('pdf.projectTitle'), t('pdf.type'), t('pdf.role'), t('pdf.status')]],
                body: tableData,
                startY: yPos,
                headStyles: { fillColor: [20, 184, 166], fontSize: 8 },
                styles: { fontSize: 8 },
            });
            yPos = doc.lastAutoTable.finalY + 10;
        } else {
            doc.setFontSize(9);
            doc.text(t('pdf.noInvolvements'), 20, yPos);
            yPos += 10;
        }
    });

    addHeaderAndFooter(doc, t('pdf.fullResearchersReport'), t);
    doc.save(`IKIM_Full_Researchers_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const downloadYearlyBudgetSummaryPDF = (
    summaryData: {
        centreAbbr: string;
        yearlyBudget: number;
        yearlySpending: number;
        spendingPercentage: number;
    }[],
    totals: { budget: number, spending: number, percentage: number },
    year: number,
    translations: TranslationPayload
) => {
    const { jsPDF } = window.jspdf;
    const { t } = translations;
    const doc = new jsPDF();

    const tableBody = summaryData.map(item => [
        item.centreAbbr,
        item.yearlyBudget.toLocaleString(),
        item.yearlySpending.toLocaleString(),
        `${item.spendingPercentage.toFixed(2)}%`
    ]);

    const tableFooter = [[
        t('pdf.total'),
        totals.budget.toLocaleString(),
        totals.spending.toLocaleString(),
        `${totals.percentage.toFixed(2)}%`
    ]];

    doc.autoTable({
        head: [[
            t('common.centre'),
            `${t('research.yearlyBudgetLimit')} (RM)`,
            `${t('research.yearlySpending')} (RM)`,
            `${t('dashboard.spent')} %`
        ]],
        body: tableBody,
        foot: tableFooter,
        startY: 30,
        headStyles: { fillColor: [59, 130, 246] },
        footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    addHeaderAndFooter(doc, t('pdf.yearlyBudgetSummaryReport', { year }), t);
    doc.save(`IKIM_Yearly_Budget_Summary_${year}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const downloadProjectStatusSummaryPDF = (
    summaryData: {
        centreAbbr: string;
        counts: Record<ResearchStatus, number>;
        total: number;
    }[],
    totals: Record<ResearchStatus, number>,
    grandTotal: number,
    translations: TranslationPayload
) => {
    const { jsPDF } = window.jspdf;
    const { t } = translations;
    const doc = new jsPDF('landscape');

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
    
    const tableHead = [
        t('common.centre'),
        ...statusOrder.map(s => t(statusHeaderKeys[s])),
        t('pdf.total')
    ];

    const tableBody = summaryData.map(item => [
        item.centreAbbr,
        ...statusOrder.map(s => item.counts[s]),
        item.total
    ]);

    const tableFooter = [[
        t('pdf.total'),
        ...statusOrder.map(s => totals[s]),
        grandTotal
    ]];

    doc.autoTable({
        head: [tableHead],
        body: tableBody,
        foot: tableFooter,
        startY: 30,
        headStyles: { fillColor: [59, 130, 246] },
        footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    addHeaderAndFooter(doc, t('pdf.projectStatusSummaryReport'), t);
    doc.save(`IKIM_Project_Status_Summary_${new Date().toISOString().slice(0, 10)}.pdf`);
};
