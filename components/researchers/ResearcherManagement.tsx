

import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import type { Researcher } from '../../types';
import ResearcherFilters from './ResearcherFilters';
import ResearcherList from './ResearcherList';
import AddEditResearcherModal from '../modals/AddEditResearcherModal';
import ConfirmationModal from '../common/ConfirmationModal';

const ResearcherManagement: React.FC = () => {
    const { 
      researchers, 
      showNotification, 
      currentUser, 
      addResearcher, 
      updateResearcher, 
      deleteResearcher 
    } = useContext(AppContext);
    const { t } = useContext(LanguageContext);
    
    const [filters, setFilters] = useState({ searchTerm: '', role: '', centreId: '' });
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);

    const filteredResearchers = useMemo(() => {
        return researchers.filter(r => 
            (r.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) || r.email.toLowerCase().includes(filters.searchTerm.toLowerCase())) &&
            (filters.role === '' || r.involvements.some(inv => inv.role === filters.role)) &&
            // FIX: Changed to string comparison for centreId
            (filters.centreId === '' || r.centreId === filters.centreId)
        );
    }, [researchers, filters]);

    const handleAdd = () => {
        setSelectedResearcher(null);
        setModalOpen(true);
    };

    const handleEdit = (researcher: Researcher) => {
        setSelectedResearcher(researcher);
        setModalOpen(true);
    };

    const handleDelete = (researcher: Researcher) => {
        setSelectedResearcher(researcher);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedResearcher) return;
        await deleteResearcher(selectedResearcher.id);
        showNotification(t('notifications.researcherDeleted', { name: selectedResearcher.name }), 'success');
        setDeleteModalOpen(false);
        setSelectedResearcher(null);
    };
    
    const handleSave = async (researcherToSave: Omit<Researcher, 'id'>, id?: string) => {
        if (id) {
            await updateResearcher(id, researcherToSave);
            showNotification(t('notifications.researcherUpdated'), 'success');
        } else {
            await addResearcher(researcherToSave);
            showNotification(t('notifications.researcherAdded'), 'success');
        }
        setModalOpen(false);
        setSelectedResearcher(null);
    };

    const canPerformActions = currentUser?.role === 'host' || currentUser?.role === 'co-host';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{t('researchers.managementTitle')}</h2>
                {canPerformActions && (
                    <button onClick={handleAdd} className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 transition duration-300">
                        <i className="fas fa-plus mr-2"></i>{t('researchers.addResearcher')}
                    </button>
                )}
            </div>

            <ResearcherFilters filters={filters} setFilters={setFilters} />
            <ResearcherList researchers={filteredResearchers} onEdit={canPerformActions ? handleEdit : undefined} onDelete={canPerformActions ? handleDelete : undefined} />

            <AddEditResearcherModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                researcherData={selectedResearcher}
            />
            {selectedResearcher && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={t('researchers.deleteTitle')}
                    message={t('researchers.deleteMessage', { name: selectedResearcher.name })}
                />
            )}
        </div>
    );
};

export default ResearcherManagement;
