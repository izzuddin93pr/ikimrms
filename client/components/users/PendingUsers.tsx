import React from 'react';
import type { User } from '../../types';

interface PendingUsersProps {
  users: User[];
  // FIX: User ID is a string, not a number
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

const PendingUsers: React.FC<PendingUsersProps> = ({ users, onApprove, onReject }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Guest Approvals</h3>
      <div className="space-y-3">
        {users.length > 0 ? (
          users.map(user => (
            <div key={user.id} className="flex justify-between items-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email} - {user.organization}</p>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => onApprove(user.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
                <button onClick={() => onReject(user.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Reject</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No pending approvals.</p>
        )}
      </div>
    </div>
  );
};

export default PendingUsers;
