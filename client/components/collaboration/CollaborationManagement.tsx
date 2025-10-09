
import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import type { Collaboration, TranslationPayload } from '../../types';
import CollaborationList from './CollaborationList';
import AddEditCollaborationModal from '../modals/AddEditCollaborationModal';
import ConfirmationModal from '../common/ConfirmationModal';
import { downloadCollaborationsPDF } from '../../utils/pdfGenerator';
import { collaborationStatusTranslationKeys, roleTranslationKeys, externalResearchStatusTranslationKeys, researchStatusTranslationKeys } from '../../utils/translations';

const CollaborationManagement: React.FC = () => {
    // FIX: Property 'setCollaborations' does not exist on type 'AppContextType'. Use context functions instead.
    const { collaborations, addCollaboration, updateCollaboration, deleteCollaboration, showNotification, academicCentres, currentUser } = useContext(AppContext);
    const { t, language } = useContext(LanguageContext);
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedCollab, setSelectedCollab] = useState<Collaboration | null>(null);

    const handleAdd = () => {
        setSelectedCollab(null);
        setModalOpen(true);
    };

    const handleEdit = (collab: Collaboration) => {
        setSelectedCollab(collab);
        setModalOpen(true);
    };
    
    const handleDelete = (collab: Collaboration) => {
        setSelectedCollab(collab);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedCollab) return;
        await deleteCollaboration(selectedCollab.id);
        showNotification(t('notifications.collaborationDeleted'), 'success');
        setDeleteModalOpen(false);
        setSelectedCollab(null);
    };

    const handleSave = async (collabToSave: Collaboration) => {
        const { id, ...data } = collabToSave;
        if (selectedCollab) { // Editing
            await updateCollaboration(id, data);
            showNotification(t('notifications.collaborationUpdated'), 'success');
        } else { // Adding
            await addCollaboration(data);
            showNotification(t('notifications.collaborationAdded'), 'success');
        }
        setModalOpen(false);
        setSelectedCollab(null);
    };
    
    const getTranslationPayload = (): TranslationPayload => ({
      t,
      locale: language,
      statusTranslationKeys: { ...researchStatusTranslationKeys, ...collaborationStatusTranslationKeys },
      roleTranslationKeys,
      // FIX: Corrected typo from externalStatusTranslationKeys to externalResearchStatusTranslationKeys
      externalStatusTranslationKeys: externalResearchStatusTranslationKeys,
    });
    
    const canPerformActions = currentUser?.role === 'host' || currentUser?.role === 'co-host';

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">{t('collaboration.managementTitle')}</h2>
                {canPerformActions && (
                    <button onClick={handleAdd} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-300">
                        <i className="fas fa-plus mr-2"></i>{t('collaboration.addCollab')}
                    </button>
                )}
            </div>
            
            <div className="mb-4">
                <button onClick={() => downloadCollaborationsPDF(collaborations, academicCentres, getTranslationPayload())} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300">
                    <i className="fas fa-download mr-2"></i>{t('common.downloadPdf')}
                </button>
            </div>

            <CollaborationList collaborations={collaborations} onEdit={canPerformActions ? handleEdit : undefined} onDelete={canPerformActions ? handleDelete : undefined} />

            <AddEditCollaborationModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                collaborationData={selectedCollab}
            />

            {selectedCollab && (
                 <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title={t('collaboration.deleteTitle')}
                    message={t('collaboration.deleteMessage', { organization: selectedCollab.organization })}
                />
            )}
        </div>
    );
};

export default CollaborationManagement;
