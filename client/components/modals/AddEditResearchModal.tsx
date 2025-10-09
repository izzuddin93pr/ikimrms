

import React, { useState, useEffect, useContext } from 'react';
import type { Research, YearlyProgress, ResearchStatus } from '../../types';
import { AppContext } from '../../context/AppContext';
// FIX: Corrected import path for LanguageContext to resolve type error.
import { LanguageContext } from '../../../context/LanguageContext';
import Modal from '../common/Modal';
import { getOrdinal } from '../../utils/helpers';
import { researchStatusTranslationKeys } from '../../utils/translations';


interface AddEditResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (research: Omit<Research, 'id'>, id?: string) => void;
  researchData: Research | null;
}

const AddEditResearchModal: React.FC<AddEditResearchModalProps> = ({ isOpen, onClose, onSave, researchData }) => {
  const { academicCentres, currentUser } = useContext(AppContext);
  const { t, language } = useContext(LanguageContext);
  const [formData, setFormData] = useState<Omit<Research, 'id' | 'documents' | 'createdBy' | 'createdAt'>>({
    title: '', description: '', centreId: '', startDate: '', endDate: '',
    extensionPeriods: [], budget: 0, spending: 0,
    team: [], status: 'Active-Ongoing (New)', progress: 0, yearlyProgress: [],
  });
  
  useEffect(() => {
    if (researchData) {
      setFormData({
        ...researchData,
        centreId: researchData.centreId || '',
        team: researchData.team || [],
        extensionPeriods: researchData.extensionPeriods || [],
        yearlyProgress: researchData.yearlyProgress || [],
      });
    } else {
      setFormData({
        title: '', description: '', centreId: '', startDate: '', endDate: '',
        extensionPeriods: [], budget: 0, spending: 0, team: [],
        status: 'Active-Ongoing (New)', progress: 0, yearlyProgress: []
      });
    }
  }, [researchData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'team' ? value.split('\n') : value }));
  };
  
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({...prev, [name]: value === '' ? 0 : parseFloat(value) }));
  }

  const handleYearlyProgressChange = (index: number, field: keyof YearlyProgress, value: string | number) => {
    const updatedProgress = [...formData.yearlyProgress];
    let finalValue = value;
    if (field === 'progress' || field === 'year' || field === 'budgetLimit' || field === 'budgetSpent') {
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        finalValue = Number.isNaN(numericValue) ? 0 : numericValue;
    }
    updatedProgress[index] = { ...updatedProgress[index], [field]: finalValue };
    setFormData(prev => ({ ...prev, yearlyProgress: updatedProgress }));
  };

  const addYearlyProgress = () => {
    const latestYear = formData.yearlyProgress.reduce((max, yp) => Math.max(max, yp.year), new Date().getFullYear() - 1);
    setFormData(prev => ({ ...prev, yearlyProgress: [...prev.yearlyProgress, { year: latestYear + 1, progress: 0, notes: '', budgetLimit: 0, budgetSpent: 0 }] }));
  };

  const removeYearlyProgress = (index: number) => {
    setFormData(prev => ({ ...prev, yearlyProgress: prev.yearlyProgress.filter((_, i) => i !== index) }));
  };

  const handleExtensionChange = (index: number, value: string) => {
    const updatedExtensions = [...formData.extensionPeriods];
    updatedExtensions[index] = value;
    setFormData(prev => ({ ...prev, extensionPeriods: updatedExtensions }));
  };

  const addExtension = () => setFormData(prev => ({ ...prev, extensionPeriods: [...prev.extensionPeriods, ''] }));
  const removeExtension = (index: number) => setFormData(prev => ({ ...prev, extensionPeriods: prev.extensionPeriods.filter((_, i) => i !== index) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      console.error("No user logged in");
      return;
    }

    const finalData = {
      ...formData,
      documents: researchData?.documents || [],
      createdBy: researchData?.createdBy || currentUser.id,
      createdAt: researchData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      budget: Number(formData.budget),
      spending: Number(formData.spending),
      progress: Number(formData.progress),
      centreId: formData.centreId,
    };

    onSave(finalData, researchData?.id);
  };
  
  const researchStatuses: ResearchStatus[] = ['Active-Ongoing (From Past Years)', 'Active-Ongoing (New)', 'Unregistered', 'Completed'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={researchData ? t('research.editTitle') : t('research.addTitle')} size="4xl">
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 bg-gray-50/50">
        
        <div className="form-section">
            <h3 className="form-section-title">{t('research.coreDetails')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                    <label className="label">{t('research.title')}</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} className="input" required/>
                </div>
                <div>
                    <label className="label">{t('common.centre')}</label>
                    <select name="centreId" value={formData.centreId} onChange={handleChange} className="input" required>
                        <option value="">{t('research.selectCentre')}</option>
                        {academicCentres.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                {researchData && (
                    <div>
                        <label className="label">{t('common.status')}</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="input">
                           {researchStatuses.map(status => <option key={status} value={status}>{t(researchStatusTranslationKeys[status])}</option>)}
                        </select>
                    </div>
                )}
            </div>
        </div>

        <div className="form-section">
            <h3 className="form-section-title">{t('research.financialSummary')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                 <div><label className="label">{t('common.budget')} (RM)</label><input type="number" name="budget" value={formData.budget} onChange={handleNumericChange} className="input" step="0.01" required/></div>
                 <div><label className="label">{t('common.spending')} (RM)</label><input type="number" name="spending" value={formData.spending} onChange={handleNumericChange} className="input" step="0.01" /></div>
            </div>
        </div>

        <div className="form-section">
            <h3 className="form-section-title">{t('research.timelineProgress')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div><label className="label">{t('research.startDate')}</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="input" required/></div>
                <div><label className="label">{t('research.endDate')}</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="input" required/></div>
                <div className="md:col-span-2">
                    <label className="label">{t('research.extensionPeriods')}</label>
                    <div className="space-y-2">
                        {formData.extensionPeriods.map((ext, index) => (
                            <div key={index} className="flex items-center space-x-2"><span className="text-sm font-medium text-gray-600 w-16">{getOrdinal(index + 1, language)}:</span><input type="date" value={ext} onChange={e => handleExtensionChange(index, e.target.value)} className="input flex-1"/><button type="button" onClick={() => removeExtension(index)} className="text-red-600"><i className="fas fa-times"></i></button></div>
                        ))}
                    </div>
                    <button type="button" onClick={addExtension} className="mt-2 text-blue-600 text-sm"><i className="fas fa-plus mr-1"></i>{t('research.addExtension')}</button>
                </div>
                {researchData && <div className="md:col-span-2"><label className="label">{t('dashboard.overallProgress')} (%)</label><input type="number" name="progress" value={formData.progress} onChange={handleNumericChange} className="input" min="0" max="100" step="0.01"/></div>}
            </div>
        </div>

        <div className="form-section">
             <div className="grid grid-cols-1 gap-4">
                <div><label className="label">{t('common.description')}</label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="input"></textarea></div>
                <div><label className="label">{t('research.teamOnePerLine')}</label><textarea name="team" value={formData.team.join('\n')} onChange={handleChange} rows={4} className="input"></textarea></div>
             </div>
        </div>

        <div className="form-section">
            <h3 className="form-section-title">{t('research.yearlyTracking')}</h3>
            <div className="space-y-3">
                {formData.yearlyProgress.map((yp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
                           <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-medium text-gray-700 mb-1">{t('research.year')}</label><input type="number" className="input py-1 text-sm" value={yp.year} onChange={e => handleYearlyProgressChange(index, 'year', e.target.value)} min="2000" max="2050" /></div>
                           <div className="col-span-2 sm:col-span-1"><label className="block text-xs font-medium text-gray-700 mb-1">{t('common.progress')} (%)</label><input type="number" step="0.01" className="input py-1 text-sm" value={yp.progress} onChange={e => handleYearlyProgressChange(index, 'progress', e.target.value)} min="0" max="100" /></div>
                           <div className="col-span-1"><label className="block text-xs font-medium text-gray-700 mb-1">{t('research.budgetLimit')}</label><input type="number" step="0.01" className="input py-1 text-sm" value={yp.budgetLimit || ''} onChange={e => handleYearlyProgressChange(index, 'budgetLimit', e.target.value)} placeholder="0.00" /></div>
                           <div className="col-span-1"><label className="block text-xs font-medium text-gray-700 mb-1">{t('research.budgetSpent')}</label><input type="number" step="0.01" className="input py-1 text-sm" value={yp.budgetSpent || ''} onChange={e => handleYearlyProgressChange(index, 'budgetSpent', e.target.value)} placeholder="0.00" /></div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                            <div className="col-span-full sm:col-span-3">
                               <label className="block text-xs font-medium text-gray-700 mb-1">{t('research.notes')}</label>
                               <input type="text" className="input py-1 text-sm" value={yp.notes || ''} onChange={e => handleYearlyProgressChange(index, 'notes', e.target.value)} placeholder={t('research.optionalNotes')} />
                            </div>
                           <div className="col-span-full sm:col-span-1 text-right">
                             <button type="button" onClick={() => removeYearlyProgress(index)} className="text-red-500 hover:text-red-700 text-sm font-medium w-full sm:w-auto py-2 px-3 rounded-md hover:bg-red-50">{t('research.remove')}</button>
                           </div>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={addYearlyProgress} className="mt-3 text-blue-600 text-sm font-medium"><i className="fas fa-plus mr-1"></i>{t('research.addYear')}</button>
        </div>

        <div className="flex flex-col sm:flex-row justify-end sm:space-x-4 pt-4 border-t mt-6 space-y-2 sm:space-y-0">
            <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">{t('common.cancel')}</button>
            <button type="submit" className="btn-primary w-full sm:w-auto">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditResearchModal;
