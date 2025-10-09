
import React, { useContext } from 'react';
import type { User } from '../../types';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import { roleTranslationKeys } from '../../utils/translations';


interface AllUsersListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
}

const AllUsersList: React.FC<AllUsersListProps> = ({ users, onEdit, onDelete, onResetPassword }) => {
  const { currentUser } = useContext(AppContext);
  const { t } = useContext(LanguageContext);
  const roleColor = {
    host: 'bg-purple-100 text-purple-800',
    'co-host': 'bg-blue-100 text-blue-800',
    guest: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 bg-gray-50 border border-gray-200 rounded-lg gap-4">
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email} - {user.organization}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${roleColor[user.role]}`}>
                {t(roleTranslationKeys[user.role])}
              </span>
              {currentUser?.role === 'host' && user.role !== 'host' && (
                <>
                  <button onClick={() => onResetPassword(user)} className="text-gray-500 hover:text-yellow-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-yellow-50" title={t('settings.resetPassword')}>
                    <i className="fas fa-key"></i>
                  </button>
                  <button onClick={() => onEdit(user)} className="text-gray-500 hover:text-blue-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-blue-50" title={t('common.edit')}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button onClick={() => onDelete(user)} className="text-gray-500 hover:text-red-600 transition-colors duration-200 h-8 w-8 rounded-full flex items-center justify-center hover:bg-red-50" title={t('common.delete')}>
                    <i className="fas fa-trash"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsersList;