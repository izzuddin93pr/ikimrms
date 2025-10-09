import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import type { User } from '../../types';
import ChangePassword from '../settings/ChangePassword';
import AllUsersList from '../users/AllUsersList';
import EditUserModal from '../modals/EditUserModal';
import ConfirmationModal from '../common/ConfirmationModal';
import AddCoHostModal from '../modals/AddCoHostModal';
import ResetPasswordModal from '../modals/ResetPasswordModal';

const AccountAndUsersManagement: React.FC = () => {
    const { currentUser, users, showNotification, updateUser, deleteUser, addCoHost, resetPasswordForUser } = useContext(AppContext);
    const { t } = useContext(LanguageContext);
    
    const [activeTab, setActiveTab] = useState('account');

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isAddCoHostModalOpen, setAddCoHostModalOpen] = useState(false);
    const [isResetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setDeleteModalOpen(true);
    };

    const handleResetPassword = (user: User) => {
        setSelectedUser(user);
        setResetPasswordModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        await deleteUser(selectedUser.id);
        showNotification(t('notifications.userDeleted', { name: selectedUser.name }), 'success');
        setDeleteModalOpen(false);
        setSelectedUser(null);
    };
    
    const handleSaveUser = async (userToSave: User) => {
        const { id, ...userData } = userToSave;
        await updateUser(id, userData);
        showNotification(`User ${userToSave.name} updated.`, 'success');
        setEditModalOpen(false);
        setSelectedUser(null);
    };

    const handleAddCoHost = async (userData: Omit<User, 'id' | 'role' | 'approved'>, password: string) => {
        const success = await addCoHost(userData, password);
        if (success) {
            setAddCoHostModalOpen(false);
        }
    };
    
    const confirmResetPassword = async () => {
        if (!selectedUser) return;
        const success = await resetPasswordForUser(selectedUser.email);
        if (success) {
            showNotification(t('notifications.passwordResetEmailSent', { email: selectedUser.email }), 'success');
        } else {
            showNotification(t('notifications.passwordResetFailed'), 'error');
        }
        setResetPasswordModalOpen(false);
        setSelectedUser(null);
    };

    if (!currentUser) return null;

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('account.managementTitle')}</h2>
                <p className="text-gray-600">{t('account.managementSubtitle')}</p>
            </div>

            {currentUser.role === 'host' ? (
                <div>
                    <div className="mb-6 border-b border-gray-200">
                        <nav className="flex space-x-2" aria-label="Tabs">
                            <button onClick={() => setActiveTab('account')} className={`tab ${activeTab === 'account' ? 'tab-active' : 'tab-inactive'}`}>
                                <i className="fas fa-user-circle mr-2"></i>{t('account.myAccountTab')}
                            </button>
                            <button onClick={() => setActiveTab('users')} className={`tab ${activeTab === 'users' ? 'tab-active' : 'tab-inactive'}`}>
                                <i className="fas fa-users-cog mr-2"></i>{t('account.userManagementTab')}
                            </button>
                        </nav>
                    </div>
                    
                    {activeTab === 'account' && <ChangePassword />}

                    {activeTab === 'users' && (
                        <div className="space-y-8">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-semibold text-gray-900">{t('users.allUsers')}</h3>
                                    <button onClick={() => setAddCoHostModalOpen(true)} className="btn-primary">
                                        <i className="fas fa-plus mr-2"></i>{t('users.addCoHost')}
                                    </button>
                                </div>
                                <AllUsersList users={users} onEdit={handleEdit} onDelete={handleDelete} onResetPassword={handleResetPassword} />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <ChangePassword />
            )}

            {isEditModalOpen && selectedUser && (
                <EditUserModal
                    isOpen={isEditModalOpen}
                    onClose={() => setEditModalOpen(false)}
                    onSave={handleSaveUser}
                    userData={selectedUser}
                />
            )}
            
            <AddCoHostModal
                isOpen={isAddCoHostModalOpen}
                onClose={() => setAddCoHostModalOpen(false)}
                onAdd={handleAddCoHost}
            />

            {selectedUser && (
                <>
                    <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={confirmDelete} title={t('users.deleteTitle')} message={t('users.deleteMessage', { name: selectedUser.name })} />
                    <ResetPasswordModal isOpen={isResetPasswordModalOpen} onClose={() => setResetPasswordModalOpen(false)} onConfirm={confirmResetPassword} userName={selectedUser.name} />
                </>
            )}
        </div>
    );
};

export default AccountAndUsersManagement;