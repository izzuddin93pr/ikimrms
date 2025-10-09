import React from 'react';
import type { AcademicCentre } from '../../types';

interface CentreCardProps {
  centre: AcademicCentre;
  onEdit: (centre: AcademicCentre) => void;
  onDelete: (centre: AcademicCentre) => void;
}

const CentreCard: React.FC<CentreCardProps> = ({ centre, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{centre.name}</h3>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{centre.abbr}</span>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => onEdit(centre)} className="text-blue-600 hover:text-blue-800" title="Edit Centre">
                <i className="fas fa-edit"></i>
            </button>
            <button onClick={() => onDelete(centre)} className="text-red-600 hover:text-red-800" title="Delete Centre">
                <i className="fas fa-trash"></i>
            </button>
        </div>
      </div>
    </div>
  );
};

export default CentreCard;
