import React, { useState, useEffect } from 'react';
import type { AcademicCentre } from '../../types';
import Modal from '../common/Modal';

interface AddEditCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (centre: AcademicCentre) => void;
  centreData: AcademicCentre | null;
}

const AddEditCentreModal: React.FC<AddEditCentreModalProps> = ({ isOpen, onClose, onSave, centreData }) => {
  const [name, setName] = useState('');
  const [abbr, setAbbr] = useState('');

  useEffect(() => {
    if (centreData) {
      setName(centreData.name);
      setAbbr(centreData.abbr);
    } else {
      setName('');
      setAbbr('');
    }
  }, [centreData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // FIX: Type 'string | number' is not assignable to type 'string'.
    onSave({ id: centreData?.id || Date.now().toString(), name, abbr });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={centreData ? 'Edit Academic Centre' : 'Add Academic Centre'} size="md">
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 gap-y-4">
            <div>
                <label className="label">Centre Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" required />
            </div>
            <div>
                <label className="label">Abbreviation</label>
                <input type="text" value={abbr} onChange={e => setAbbr(e.target.value)} className="input" required />
            </div>
        </div>
        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 transition duration-300">Save Centre</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditCentreModal;
