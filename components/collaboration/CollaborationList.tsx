
import React, { useContext } from 'react';
import type { Collaboration } from '../../types';
import CollaborationCard from './CollaborationCard';
import { LanguageContext } from '../../context/LanguageContext';

interface CollaborationListProps {
  collaborations: Collaboration[];
  onEdit?: (collaboration: Collaboration) => void;
  onDelete?: (collaboration: Collaboration) => void;
}

const CollaborationList: React.FC<CollaborationListProps> = ({ collaborations, onEdit, onDelete }) => {
  const { t } = useContext(LanguageContext);
  if (collaborations.length === 0) {
    return <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-lg">{t('collaboration.noCollabsFound')}</div>;
  }

  return (
    <div className="space-y-4">
      {collaborations.map(item => (
        <CollaborationCard key={item.id} collaboration={item} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default CollaborationList;
