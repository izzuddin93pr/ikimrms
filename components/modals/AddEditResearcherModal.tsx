

import React, { useState, useEffect, useContext } from 'react';
import type { Researcher, ResearchInvolvement, ExternalResearchStatus } from '../../types';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import Modal from '../common/Modal';
import { researchRoleTranslationKeys } from '../../utils/translations';

interface AddEditResearcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (researcher: Omit<Researcher, 'id'>, id?:string) => void;
  researcherData: Researcher | null;
}

const AddEditResearcherModal: React.FC<AddEditResearcherModalProps> = ({ isOpen, onClose, onSave, researcherData }) => {
  const { academicCentres, research, currentUser } = useContext(AppContext);
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState({ name: '', email: '', centreId: '', involvements: [] as ResearchInvolvement[] });

  useEffect(() => {
    if (researcherData) {
      // For backward compatibility with data that doesn't have the 'type' or 'externalProjectStatus' field
      const migratedInvolvements = researcherData.involvements.map(inv => {
        let tempInv = inv.hasOwnProperty('type') ? inv : { ...inv, type: 'internal' as 'internal' };
        if (tempInv.type === 'external' && !tempInv.externalProjectStatus) {
            return { ...tempInv, externalProjectStatus: 'Active-Ongoing' as ExternalResearchStatus };
        }
        return tempInv;
      });
      setFormData({...researcherData, involvements: migratedInvolvements});
    } else {
      setFormData({ name: '', email: '', centreId: '', involvements: [] });
    }
  }, [researcherData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInvolvementChange = (index: number, field: keyof ResearchInvolvement, value: string | number) => {
    const newInvolvements = [...formData.involvements];
    const currentInvolvement = { ...newInvolvements[index] };

    if (field === 'type') {
      currentInvolvement.type = value as 'internal' | 'external';
      if (value === 'internal') {
        delete currentInvolvement.externalProjectTitle;
        delete currentInvolvement.externalProjectStatus;
        currentInvolvement.researchId = "0";
      } else {
        delete currentInvolvement.researchId;
        currentInvolvement.externalProjectTitle = '';
        currentInvolvement.externalProjectStatus = 'Active-Ongoing';
      }
    } else {
      (currentInvolvement as any)[field] = field === 'researchId' ? value : value;
    }

    newInvolvements[index] = currentInvolvement;
    setFormData(prev => ({ ...prev, involvements: newInvolvements }));
  };
  
  const addInvolvement = () => {
    setFormData(prev => ({ ...prev, involvements: [...prev.involvements, { type: 'internal', researchId: "0", role: 'Research Member' }] }));
  };

  const removeInvolvement = (index: number) => {
    setFormData(prev => ({ ...prev, involvements: prev.involvements.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const finalData = {
      ...formData,
      createdBy: researcherData?.createdBy || currentUser.id,
      createdAt: researcherData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onSave(finalData, researcherData?.id);
  };
  
  const externalStatuses: ExternalResearchStatus[] = ['Active-Ongoing', 'Pending', 'Completed'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={researcherData ? t('researchers.editTitle') : t('researchers.addTitle')} size="3xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="space-y-4 mb-4 border-b pb-6">
            <div><label className="label">{t('researchers.name')}</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required /></div>
            <div><label className="label">{t('researchers.email')}</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="input" required /></div>
            <div><label className="label">{t('common.centre')}</label><select name="centreId" value={formData.centreId} onChange={handleChange} className="input" required><option value="">{t('researchers.selectCentre')}</option>{academicCentres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>

        <div>
            <label className="label">{t('researchers.involvements', {count: ''})}</label>
            <div className="space-y-3">
                {formData.involvements.length > 0 ? (
                    formData.involvements.map((inv, index) => (
                        <div key={index} className="border p-3 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('researchers.involvementType')}</label>
                                    <select value={inv.type || 'internal'} onChange={e => handleInvolvementChange(index, 'type', e.target.value)} className="input text-sm py-1.5">
                                        <option value="internal">{t('researchers.internal')}</option>
                                        <option value="external">{t('researchers.external')}</option>
                                    </select>
                                </div>
                                <div className={`md:col-span-${(inv.type === 'external') ? '2' : '3'}`}>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('researchers.projectTitle')}</label>
                                    {(inv.type || 'internal') === 'internal' ? (
                                        <select value={inv.researchId || ''} onChange={e => handleInvolvementChange(index, 'researchId', e.target.value)} className="input text-sm py-1.5" required>
                                            <option value="">{t('researchers.selectResearch')}</option>
                                            {research.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
                                        </select>
                                    ) : (
                                        <input type="text" value={inv.externalProjectTitle || ''} onChange={e => handleInvolvementChange(index, 'externalProjectTitle', e.target.value)} className="input text-sm py-1.5" placeholder={t('researchers.enterExternalProject')} required />
                                    )}
                                </div>
                                <div className="md:col-span-1">
                                    <label className="label">{t('common.role')}</label>
                                    <select value={inv.role} onChange={e => handleInvolvementChange(index, 'role', e.target.value)} className="input text-sm py-1.5">
                                        <option value="Principal Investigator">{t(researchRoleTranslationKeys['Principal Investigator'])}</option>
                                        <option value="Research Secretary">{t(researchRoleTranslationKeys['Research Secretary'])}</option>
                                        <option value="Research Member">{t(researchRoleTranslationKeys['Research Member'])}</option>
                                    </select>
                                </div>
                                {(inv.type === 'external') && (
                                    <div className="md:col-span-1">
                                        <label className="label">{t('common.status')}</label>
                                        <select value={inv.externalProjectStatus || 'Active-Ongoing'} onChange={e => handleInvolvementChange(index, 'externalProjectStatus', e.target.value)} className="input text-sm py-1.5">
                                            {externalStatuses.map(status => <option key={status} value={status}>{t(`statuses.${status}`)}</option>)}
                                        </select>
                                    </div>
                                )}
                                <div className="md:col-span-1 text-right pt-5">
                                   <button type="button" onClick={() => removeInvolvement(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">{t('research.remove')}</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 text-gray-500 bg-gray-100 rounded-lg">
                        <p>{t('researchers.noInvolvements')}</p>
                    </div>
                )}
            </div>
            <button type="button" onClick={addInvolvement} className="mt-3 text-blue-600 text-sm"><i className="fas fa-plus mr-1"></i>{t('researchers.addInvolvement')}</button>
        </div>

        <div className="flex justify-end space-x-4 pt-4 mt-4 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition duration-300">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditResearcherModal;
