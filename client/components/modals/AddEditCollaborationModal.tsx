

import React, { useState, useEffect, useContext } from 'react';
import type { Collaboration, CollaborationStatus } from '../../types';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import Modal from '../common/Modal';
import { getCollaborationStatus } from '../../utils/helpers';
import { collaborationStatusTranslationKeys } from '../../utils/translations';


interface AddEditCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (collaboration: Collaboration) => void;
  collaborationData: Collaboration | null;
}

const AddEditCollaborationModal: React.FC<AddEditCollaborationModalProps> = ({ isOpen, onClose, onSave, collaborationData }) => {
  const { academicCentres, currentUser } = useContext(AppContext);
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    organization: '',
    type: 'MoU' as 'MoU' | 'MoA',
    startDate: '',
    endDate: '',
    extensionPeriods: [] as string[],
    centreId: '',
  });
  
  useEffect(() => {
    if (collaborationData) {
      setFormData({
        organization: collaborationData.organization,
        type: collaborationData.type,
        startDate: collaborationData.startDate,
        endDate: collaborationData.endDate,
        extensionPeriods: collaborationData.extensionPeriods || [],
        centreId: collaborationData.centreId,
      });
    } else {
      setFormData({
        organization: '',
        type: 'MoU',
        startDate: '',
        endDate: '',
        extensionPeriods: [],
        centreId: '',
      });
    }
  }, [collaborationData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleExtensionChange = (index: number, value: string) => {
    const newPeriods = [...formData.extensionPeriods];
    newPeriods[index] = value;
    setFormData(prev => ({ ...prev, extensionPeriods: newPeriods }));
  };

  const addExtension = () => {
    setFormData(prev => ({ ...prev, extensionPeriods: [...prev.extensionPeriods, ''] }));
  };

  const removeExtension = (index: number) => {
    setFormData(prev => ({ ...prev, extensionPeriods: prev.extensionPeriods.filter((_, i) => i !== index) }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalData: Collaboration = {
      ...formData,
      extensionPeriods: formData.extensionPeriods.filter(Boolean),
      id: collaborationData?.id || Date.now().toString(),
      createdBy: collaborationData?.createdBy || currentUser!.id,
      createdAt: collaborationData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(finalData);
  };
  
  const currentStatuses = getCollaborationStatus({
    endDate: formData.endDate,
    extensionPeriods: formData.extensionPeriods
  });

  const statusColors: Record<CollaborationStatus, string> = {
      Active: 'bg-green-100 text-green-800',
      Expired: 'bg-gray-100 text-gray-800',
      Extended: 'bg-blue-100 text-blue-800',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={collaborationData ? t('collaboration.editTitle') : t('collaboration.addTitle')} size="3xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
                <label className="label">{t('common.organization')}</label>
                <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="input" required />
            </div>
            <div>
                <label className="label">{t('collaboration.type')}</label>
                <select name="type" value={formData.type} onChange={handleChange} className="input">
                    <option value="MoU">{t('collaboration.mou')}</option>
                    <option value="MoA">{t('collaboration.moa')}</option>
                </select>
            </div>
            <div>
                <label className="label">{t('collaboration.centreInCharge')}</label>
                <select name="centreId" value={formData.centreId} onChange={handleChange} className="input" required>
                    <option value="">{t('collaboration.selectCentre')}</option>
                    {academicCentres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </div>
            <div>
                <label className="label">{t('research.startDate')}</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input" required />
            </div>
            <div>
                <label className="label">{t('research.endDate')}</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input" required />
            </div>
            <div className="md:col-span-2">
                <label className="label">{t('collaboration.extensionPeriodsOptional')}</label>
                <div className="space-y-2">
                    {formData.extensionPeriods.map((period, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <input type="date" value={period} onChange={e => handleExtensionChange(index, e.target.value)} className="input flex-1" />
                            <button type="button" onClick={() => removeExtension(index)} className="text-red-500 hover:text-red-700 h-9 w-9 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"><i className="fas fa-trash"></i></button>
                        </div>
                    ))}
                </div>
                 <button type="button" onClick={addExtension} className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                    <i className="fas fa-plus mr-1"></i> {t('collaboration.addExtension')}
                </button>
            </div>
            <div className="md:col-span-2">
                <label className="label">{t('collaboration.statusAuto')}</label>
                <div className="mt-2 flex items-center space-x-2">
                    {currentStatuses.map(status => (
                         <div key={status} className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${statusColors[status]}`}>
                            {t(collaborationStatusTranslationKeys[status])}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-6 mt-4 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition duration-300">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditCollaborationModal;
