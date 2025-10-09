import React, { useContext } from 'react';
import type { Research } from '../../types';
import ResearchCard from './ResearchCard';
import { LanguageContext } from '../../context/LanguageContext';

interface ResearchListProps {
  researchData: Research[];
  onView: (research: Research) => void;
  onEdit?: (research: Research) => void;
  onDelete?: (research: Research) => void;
  // FIX: selectedResearchIds should be string[] to match Research.id type
  selectedResearchIds: string[];
  // FIX: onToggleSelect should accept a string to match Research.id type
  onToggleSelect: (id: string) => void;
}

const ResearchList: React.FC<ResearchListProps> = ({ researchData, onView, onEdit, onDelete, selectedResearchIds, onToggleSelect }) => {
  const { t } = useContext(LanguageContext);
  if (researchData.length === 0) {
    return <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-lg">{t('research.noResearchFound')}</div>;
  }

  return (
    <div className="space-y-4">
      {researchData.map(item => (
        <ResearchCard 
            key={item.id} 
            research={item} 
            onView={onView} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            isSelected={selectedResearchIds.includes(item.id)}
            onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
};

export default ResearchList;