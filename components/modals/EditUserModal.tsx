import React, { useState, useEffect, useContext } from 'react';
import type { User, Role } from '../../types';
import { LanguageContext } from '../../context/LanguageContext';
import Modal from '../common/Modal';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  userData: User;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, onSave, userData }) => {
  const { t } = useContext(LanguageContext);
  const [formData, setFormData] = useState<User>(userData);

  useEffect(() => {
    setFormData(userData);
  }, [userData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const roles: Role[] = ['guest', 'co-host'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit User: ${userData.name}`} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
            <label className="label">{t('common.role')}</label>
            <select name="role" value={formData.role} onChange={handleChange} className="input">
                {roles.map(role => <option key={role} value={role}>{t(`roles.${role}`)}</option>)}
            </select>
        </div>
        <div>
            <label className="flex items-center">
                <input type="checkbox" name="approved" checked={formData.approved} onChange={handleCheckboxChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-2 text-gray-700">Approved</span>
            </label>
        </div>
        <div className="flex justify-end space-x-4 pt-6 mt-4 border-t">
          <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          <button type="submit" className="btn-primary">{t('common.save')}</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditUserModal;
