
import React, { useContext } from 'react';
import type { Researcher } from '../../types';
import ResearcherCard from './ResearcherCard';
import { LanguageContext } from '../../context/LanguageContext';

interface ResearcherListProps {
  researchers: Researcher[];
  onEdit?: (researcher: Researcher) => void;
  onDelete?: (researcher: Researcher) => void;
}

const ResearcherList: React.FC<ResearcherListProps> = ({ researchers, onEdit, onDelete }) => {
  const { t } = useContext(LanguageContext);
  if (researchers.length === 0) {
    return <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-lg">{t('researchers.noResearchersFound')}</div>;
  }
  
  return (
    <div className="space-y-4">
      {researchers.map(researcher => (
        <ResearcherCard key={researcher.id} researcher={researcher} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default ResearcherList;
