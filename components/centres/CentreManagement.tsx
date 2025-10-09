
import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import type { AcademicCentre } from '../../types';
import CentreList from './CentreList';
import AddEditCentreModal from '../modals/AddEditCentreModal';
import ConfirmationModal from '../common/ConfirmationModal';

const CentreManagement: React.FC = () => {
    const { academicCentres, research, collaborations, researchers, showNotification, addCentre, updateCentre, deleteCentre } = useContext(AppContext);
    const { t } = useContext(LanguageContext);

    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCentre, setSelectedCentre] = useState<AcademicCentre | null>(null);

    const handleAdd = () => {
        setSelectedCentre(null);
        setModalOpen(true);
    };

    const handleEdit = (centre: AcademicCentre) => {
        setSelectedCentre(centre);
        setModalOpen(true);
    };

    const handleDelete = (centre: AcademicCentre) => {
        // FIX: Corrected type comparison errors to use strict equality with string IDs
        const isInUse = 
            research.some(r => r.centreId === centre.id) ||
            collaborations.some(c => c.centreId === centre.id) ||
            researchers.some(r => r.centreId === centre.id);
        
        if (isInUse) {
            showNotification(t('notifications.centreDeleteInUse', { abbr: centre.abbr }), 'error');
            return;
        }
        setSelectedCentre(centre);
        setDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        if (!selectedCentre) return;
        await deleteCentre(selectedCentre.id);
        showNotification(t('notifications.centreDeleted'), 'success');
        setDeleteModalOpen(false);
        setSelectedCentre(null);
    };

    const handleSave = async (centreToSave: AcademicCentre) => {
        const { id, ...data } = centreToSave;
        if (selectedCentre) {
            await updateCentre(id, data);
            showNotification(t('notifications.centreUpdated'), 'success');
        } else {
            await addCentre(data);
            showNotification(t('notifications.centreAdded'), 'success');
        }
        setModalOpen(false);
        setSelectedCentre(null);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{t('centres.managementTitle')}</h2>
                <button onClick={handleAdd} className="add-btn bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition duration-300">
                    <i className="fas fa-plus mr-2"></i>{t('centres.addCentre')}
                </button>
            </div>
            
            <CentreList centres={academicCentres} onEdit={handleEdit} onDelete={handleDelete} />

            <AddEditCentreModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                centreData={selectedCentre}
            />

            {selectedCentre && (
                 <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={t('centres.deleteTitle')}
                    message={t('centres.deleteMessage', { name: selectedCentre.name })}
                />
            )}
        </div>
    );
};

export default CentreManagement;
