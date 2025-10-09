

import React, { useContext, useMemo, useState } from 'react';
import type { Research, Document, ResearchStatus, TranslationPayload } from '../../types';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import Modal from '../common/Modal';
import { formatFileSize } from '../../utils/helpers';
import { downloadSingleResearchPDF } from '../../utils/pdfGenerator';
import ConfirmationModal from '../common/ConfirmationModal';
import { useFormatDate } from '../../hooks/useFormatDate';
import { researchStatusTranslationKeys, roleTranslationKeys, externalResearchStatusTranslationKeys } from '../../utils/translations';

interface ViewResearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    research: Research;
    onEdit?: () => void;
    onUpload?: () => void;
}

type Tab = 'overview' | 'team' | 'progress' | 'documents';

const ViewResearchModal: React.FC<ViewResearchModalProps> = ({ isOpen, onClose, research, onEdit, onUpload }) => {
    const { academicCentres, updateResearch, showNotification, currentUser } = useContext(AppContext);
    const { t, language } = useContext(LanguageContext);
    const formatDate = useFormatDate();

    const [isDeleteDocModalOpen, setDeleteDocModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState<Document | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    // FIX: This comparison appears to be unintentional because the types 'string' and 'number' have no overlap.
    // FIX: Corrected comparison to be between two strings.
    const centre = academicCentres.find(c => c.id === research.centreId);
    
    const financialSummary = useMemo(() => {
        const budget = research.budget || 0;
        const spending = research.spending || 0;
        const remaining = budget - spending;
        const utilization = budget > 0 ? (spending / budget) * 100 : 0;
        return { budget, spending, remaining, utilization };
    }, [research.budget, research.spending]);

    const progressCircleProps = useMemo(() => {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (research.progress / 100) * circumference;
        return { circumference, offset };
    }, [research.progress]);

    const statusColors: Record<ResearchStatus, string> = {
        'Active-Ongoing (From Past Years)': 'bg-blue-100 text-blue-800',
        'Active-Ongoing (New)': 'bg-teal-100 text-teal-800',
        'Unregistered': 'bg-yellow-100 text-yellow-800',
        'Completed': 'bg-green-100 text-green-800',
    };
    
    const getTranslationPayload = (): TranslationPayload => ({
        t,
        locale: language,
        statusTranslationKeys: researchStatusTranslationKeys,
        roleTranslationKeys,
        externalStatusTranslationKeys: externalResearchStatusTranslationKeys
    });

    const handleDownloadDocument = (doc: Document) => {
        try {
            window.open(doc.fileURL, '_blank');
            showNotification(t('notifications.docDownloadStarted'), 'success');
        } catch (error) {
            console.error('Download error:', error);
            showNotification(t('notifications.docDownloadError'), 'error');
        }
    };

    const handleDeleteDocument = (doc: Document) => {
        setDocToDelete(doc);
        setDeleteDocModalOpen(true);
    };

    const confirmDeleteDocument = async () => {
        if (!docToDelete) return;
        
        try {
            // In a real app with Firebase Storage, you would delete from storage first
            // const storageRef = storage.refFromURL(docToDelete.storagePath);
            // await storageRef.delete();
            
            const updatedDocs = research.documents.filter(d => d.id !== docToDelete.id);
            await updateResearch(research.id, { documents: updatedDocs });
            showNotification(t('notifications.docDeleted'), 'success');
        } catch (error) {
            console.error("Failed to delete document:", error);
            showNotification(t('notifications.docDeleteError'), 'error');
        }
        
        setDeleteDocModalOpen(false);
        setDocToDelete(null);
    };
    
    const canPerformActions = currentUser?.role === 'host' || currentUser?.role === 'co-host';

    const modalActions = (
        <div className="flex items-center space-x-2">
            <button onClick={() => downloadSingleResearchPDF(research, academicCentres, getTranslationPayload())} className="text-gray-500 hover:text-red-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-50" title={t('research.downloadReport')}>
                <i className="fas fa-download"></i>
            </button>
            {canPerformActions && onEdit && (
                <button onClick={onEdit} className="text-gray-500 hover:text-blue-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-blue-50" title={t('common.edit')}>
                    <i className="fas fa-edit"></i>
                </button>
            )}
        </div>
    );

    return (
    <>
        <Modal isOpen={isOpen} onClose={onClose} title={research.title} size="5xl" headerActions={modalActions}>
            <div className="p-4 sm:p-6 bg-gray-50/50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="info-card">
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <div><div className="text-xs sm:text-sm text-gray-500">{t('common.status')}</div><div className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[research.status]}`}>{t(researchStatusTranslationKeys[research.status])}</div></div>
                                <div><div className="text-xs sm:text-sm text-gray-500">{t('research.startDate')}</div><div className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(research.startDate)}</div></div>
                                <div><div className="text-xs sm:text-sm text-gray-500">{t('research.endDate')}</div><div className="font-semibold text-gray-800 text-sm sm:text-base">{formatDate(research.endDate)}</div></div>
                                <div><div className="text-xs sm:text-sm text-gray-500">{t('common.centre')}</div><div className="font-semibold text-gray-800 text-sm sm:text-base">{centre?.abbr}</div></div>
                             </div>
                        </div>

                        <div className="info-card">
                            <div className="border-b border-gray-200 mb-4">
                                <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto" aria-label="Tabs">
                                    <button onClick={() => setActiveTab('overview')} className={`tab ${activeTab === 'overview' ? 'tab-active' : 'tab-inactive'}`}>{t('research.overview')}</button>
                                    <button onClick={() => setActiveTab('team')} className={`tab ${activeTab === 'team' ? 'tab-active' : 'tab-inactive'}`}>{t('common.team')}</button>
                                    <button onClick={() => setActiveTab('progress')} className={`tab ${activeTab === 'progress' ? 'tab-active' : 'tab-inactive'}`}>{t('research.yearlyProgress')}</button>
                                    <button onClick={() => setActiveTab('documents')} className={`tab ${activeTab === 'documents' ? 'tab-active' : 'tab-inactive'}`}>{t('common.documents')}</button>
                                </nav>
                            </div>
                            <div className="min-h-[200px]">
                                {activeTab === 'overview' && <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{research.description}</p>}
                                {activeTab === 'team' && <ul className="list-disc list-inside space-y-2">{research.team.map(m => <li key={m}>{m}</li>)}</ul>}
                                {activeTab === 'progress' && (
                                    <div className="space-y-4">
                                        {research.yearlyProgress?.length > 0 ? research.yearlyProgress.map(yp => {
                                            const limit = yp.budgetLimit || 0;
                                            const spent = yp.budgetSpent || 0;
                                            const remaining = limit - spent;
                                            const utilization = limit > 0 ? (spent / limit) * 100 : 0;

                                            return (
                                                <div key={yp.year} className="p-4 border rounded-lg bg-white shadow-sm">
                                                    <h5 className="text-lg font-bold text-gray-800 mb-3">{t('research.year')}: {yp.year}</h5>
                                                    
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="font-medium text-gray-700">{t('research.researchProgress')}</span>
                                                            <span className="font-bold text-blue-600">{yp.progress.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${yp.progress}%` }}></div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t">
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between"><span className="text-gray-600">{t('research.yearlyBudgetLimit')}:</span><span className="font-semibold">RM {limit.toLocaleString()}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-600">{t('research.yearlySpending')}:</span><span className="font-semibold text-red-600">RM {spent.toLocaleString()}</span></div>
                                                            <div className="flex justify-between"><span className="text-gray-600">{t('research.remainingForYear')}:</span><span className="font-semibold text-green-600">RM {remaining.toLocaleString()}</span></div>
                                                        </div>
                                                        <div className="mt-3">
                                                            <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">{t('research.budgetUtilization')}</span><span className="font-bold text-gray-600">{utilization.toFixed(1)}%</span></div>
                                                             <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${utilization}%` }}></div></div>
                                                        </div>
                                                    </div>
                                                                                                    
                                                    {yp.notes && (
                                                        <div className="mt-4 pt-3 border-t">
                                                            <h6 className="text-xs font-semibold text-gray-600 mb-1">{t('research.notes')}</h6>
                                                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{yp.notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }) : <p className="text-sm text-gray-500 text-center py-4">{t('research.noYearlyProgress')}</p>}
                                    </div>
                                )}
                                {activeTab === 'documents' && (
                                     <div className="space-y-2">
                                        {canPerformActions && onUpload && <button onClick={onUpload} className="w-full text-center py-3 bg-blue-50 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg hover:bg-blue-100 mb-4"><i className="fas fa-upload mr-2"></i>{t('research.uploadNewDoc')}</button>}
                                        {research.documents?.length > 0 ? research.documents.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                                                    <p className="text-xs text-gray-500">{doc.type} - {formatFileSize(doc.fileSize)}</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <button onClick={() => handleDownloadDocument(doc)} className="text-gray-500 hover:text-blue-600 p-1 h-7 w-7 flex items-center justify-center rounded-full hover:bg-blue-100" title={t('common.download')}><i className="fas fa-download"></i></button>
                                                    {canPerformActions && <button onClick={() => handleDeleteDocument(doc)} className="text-gray-500 hover:text-red-600 p-1 h-7 w-7 flex items-center justify-center rounded-full hover:bg-red-100" title={t('common.delete')}><i className="fas fa-trash"></i></button>}
                                                </div>
                                            </div>
                                        )) : <p className="text-gray-500 text-sm text-center py-4">{t('research.noDocsUploaded')}</p>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="info-card bg-green-50/50 border-green-200">
                            <h4 className="info-card-title">{t('research.financialSummary')}</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span>{t('research.overallBudget')}:</span> <strong>RM {financialSummary.budget.toLocaleString()}</strong></div>
                                <div className="flex justify-between"><span>{t('research.overallSpending')}:</span> <strong className="text-red-600">RM {financialSummary.spending.toLocaleString()}</strong></div>
                                <div className="flex justify-between border-t pt-2 mt-2"><span>{t('research.remaining')}:</span> <strong className="text-green-600">RM {financialSummary.remaining.toLocaleString()}</strong></div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2"><div className="bg-green-600 h-2.5 rounded-full" style={{width: `${financialSummary.utilization}%`}}></div></div>
                                <div className="text-right text-sm">{Math.round(financialSummary.utilization)}% {t('research.utilized')}</div>
                            </div>
                        </div>

                         <div className="info-card bg-purple-50/50 border-purple-200 text-center">
                            <h4 className="info-card-title">{t('dashboard.overallProgress')}</h4>
                             <div className="relative inline-flex items-center justify-center w-24 h-24">
                                <svg className="w-full h-full transform -rotate-90"><circle className="text-gray-200" strokeWidth="8" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50"/><circle className="text-purple-600" strokeWidth="8" strokeDasharray={progressCircleProps.circumference} strokeDashoffset={progressCircleProps.offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50"/></svg>
                                <span className="absolute text-xl font-bold">{research.progress.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
        {docToDelete && (
            <ConfirmationModal
                isOpen={isDeleteDocModalOpen}
                onClose={() => setDeleteDocModalOpen(false)}
                onConfirm={confirmDeleteDocument}
                title={t('research.deleteDocTitle')}
                message={t('research.deleteDocMessage', { name: docToDelete.name })}
            />
        )}
    </>
    );
};

export default ViewResearchModal;
