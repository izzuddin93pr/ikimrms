


import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import { Research, TranslationPayload } from '../../types';
import ResearchFilters from './ResearchFilters';
import ResearchList from './ResearchList';
import ViewResearchModal from '../modals/ViewResearchModal';
import AddEditResearchModal from '../modals/AddEditResearchModal';
import UploadDocumentModal from '../modals/UploadDocumentModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { downloadSelectedResearchReportPDF } from '../../utils/pdfGenerator';
import { researchStatusTranslationKeys, roleTranslationKeys, externalResearchStatusTranslationKeys } from '../../utils/translations';


const ResearchManagement: React.FC = () => {
    const { 
      research, 
      academicCentres, 
      showNotification, 
      currentUser, 
      researchers, 
      updateResearcher,
      addResearch,
      updateResearch,
      deleteResearch,
    } = useContext(AppContext);
    const { t, language } = useContext(LanguageContext);
    
    const [filters, setFilters] = useState({ status: '', centreId: '', startYear: '', completionYear: '' });
    const [isViewModalOpen, setViewModalOpen] = useState(false);
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    
    const [selectedResearch, setSelectedResearch] = useState<Research | null>(null);
    const [selectedResearchIds, setSelectedResearchIds] = useState<string[]>([]);

    const filteredResearch = useMemo(() => {
        return research.filter(r => {
            const startDate = new Date(r.startDate);
            const endDate = new Date(r.endDate);
            return (
                (filters.status === '' || r.status === filters.status) &&
                // FIX: Changed to string comparison for centreId
                (filters.centreId === '' || r.centreId === filters.centreId) &&
                (filters.startYear === '' || startDate.getFullYear() === parseInt(filters.startYear)) &&
                (filters.completionYear === '' || (r.status === 'Completed' && endDate.getFullYear() === parseInt(filters.completionYear)))
            );
        });
    }, [research, filters]);

    const handleView = (researchItem: Research) => {
        setSelectedResearch(researchItem);
        setViewModalOpen(true);
    };

    const handleEdit = (researchItem: Research) => {
        setSelectedResearch(researchItem);
        setAddEditModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedResearch(null);
        setAddEditModalOpen(true);
    };

    const handleDelete = (researchItem: Research) => {
        setSelectedResearch(researchItem);
        setDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        if (!selectedResearch) return;

        // Clean up researcher involvements
        for (const researcher of researchers) {
            const newInvolvements = researcher.involvements.filter(inv => inv.researchId !== selectedResearch.id);
            if (newInvolvements.length !== researcher.involvements.length) {
                await updateResearcher(researcher.id, { involvements: newInvolvements });
            }
        }
        
        await deleteResearch(selectedResearch.id);
        showNotification(t('notifications.researchDeleted', { title: selectedResearch.title }), 'success');
        setDeleteModalOpen(false);
        setSelectedResearch(null);
    };

    const handleSave = async (researchToSave: Omit<Research, 'id'>, id?: string) => {
        if (id) { // Editing
            await updateResearch(id, researchToSave);
            showNotification(t('notifications.researchUpdated'), 'success');
        } else { // Adding
            await addResearch(researchToSave);
            showNotification(t('notifications.researchAdded'), 'success');
        }
        setAddEditModalOpen(false);
        setSelectedResearch(null);
    };
    
    const openUploadModal = (researchItem: Research) => {
        setSelectedResearch(researchItem);
        setViewModalOpen(false); // Close view modal before opening upload
        setUploadModalOpen(true);
    };

    const handleUploadComplete = async (updatedResearch: Research) => {
        const { id, ...dataToUpdate } = updatedResearch;
        await updateResearch(id, dataToUpdate);
        setSelectedResearch(updatedResearch);
        setUploadModalOpen(false);
        setViewModalOpen(true); // Re-open view modal
    };
    
    const handleToggleSelect = (id: string) => {
        setSelectedResearchIds(prev =>
            prev.includes(id) ? prev.filter(researchId => researchId !== id) : [...prev, id]
        );
    };
    
    const getTranslationPayload = (): TranslationPayload => ({
      t,
      locale: language,
      statusTranslationKeys: researchStatusTranslationKeys,
      roleTranslationKeys,
      externalStatusTranslationKeys: externalResearchStatusTranslationKeys,
    });

    const handleGenerateSelectedReport = () => {
        const selection = research.filter(r => selectedResearchIds.includes(r.id));
        if (selection.length > 0) {
            downloadSelectedResearchReportPDF(selection, academicCentres, getTranslationPayload());
        } else {
            showNotification(t('notifications.reportSelectionWarning'), 'warning');
        }
    };
    
    const canPerformActions = currentUser?.role === 'host' || currentUser?.role === 'co-host';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{t('research.managementTitle')}</h2>
                <div className="flex items-center space-x-4">
                    {selectedResearchIds.length > 0 && (
                        <button 
                            onClick={handleGenerateSelectedReport} 
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-300"
                        >
                            <i className="fas fa-file-pdf mr-2"></i>{t('research.generateReportSelected', { count: selectedResearchIds.length })}
                        </button>
                    )}
                    {canPerformActions && (
                        <button onClick={handleAdd} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition duration-300">
                            <i className="fas fa-plus mr-2"></i>{t('research.addResearch')}
                        </button>
                    )}
                </div>
            </div>

            <ResearchFilters filters={filters} setFilters={setFilters} />
            <ResearchList researchData={filteredResearch} onView={handleView} onEdit={canPerformActions ? handleEdit : undefined} onDelete={canPerformActions ? handleDelete : undefined} selectedResearchIds={selectedResearchIds} onToggleSelect={handleToggleSelect} />
            
            {isViewModalOpen && selectedResearch && (
                <ViewResearchModal
                    isOpen={isViewModalOpen}
                    onClose={() => setViewModalOpen(false)}
                    research={selectedResearch}
                    onEdit={canPerformActions ? () => { setViewModalOpen(false); handleEdit(selectedResearch); } : undefined}
                    onUpload={canPerformActions ? () => openUploadModal(selectedResearch) : undefined}
                />
            )}

            {isAddEditModalOpen && (
                 <AddEditResearchModal
                    isOpen={isAddEditModalOpen}
                    onClose={() => setAddEditModalOpen(false)}
                    onSave={handleSave}
                    researchData={selectedResearch}
                 />
            )}

            {isUploadModalOpen && selectedResearch && (
                <UploadDocumentModal
                    isOpen={isUploadModalOpen}
                    onClose={() => { setUploadModalOpen(false); setViewModalOpen(true); }} // Re-open view modal on close
                    research={selectedResearch}
                    onUploadComplete={handleUploadComplete}
                />
            )}

            {isDeleteModalOpen && selectedResearch && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={t('research.deleteTitle')}
                    message={t('research.deleteMessage', { title: selectedResearch.title })}
                />
            )}
        </div>
    );
};

export default ResearchManagement;
