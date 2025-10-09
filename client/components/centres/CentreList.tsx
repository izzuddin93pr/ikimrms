import React from 'react';
import type { AcademicCentre } from '../../types';
import CentreCard from './CentreCard';

interface CentreListProps {
  centres: AcademicCentre[];
  onEdit: (centre: AcademicCentre) => void;
  onDelete: (centre: AcademicCentre) => void;
}

const CentreList: React.FC<CentreListProps> = ({ centres, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {centres.map(centre => (
        <CentreCard key={centre.id} centre={centre} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default CentreList;
