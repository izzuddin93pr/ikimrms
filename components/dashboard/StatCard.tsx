import React, { useContext } from 'react';
import { LanguageContext } from '../../context/LanguageContext';

interface StatCardProps {
  titleKey: string;
  value: string;
  subtitle: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ titleKey, value, subtitle, icon, color }) => {
  const { t } = useContext(LanguageContext);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };
  const iconBgClasses = {
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    green: 'bg-green-400',
    orange: 'bg-orange-400',
  };
   const textColorClasses = {
    blue: 'text-blue-100',
    purple: 'text-purple-100',
    green: 'text-green-100',
    orange: 'text-orange-100',
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl shadow-lg p-4 text-white`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`${textColorClasses[color]} text-sm font-medium`}>{t(titleKey)}</p>
          <p className="text-2xl sm:text-3xl font-bold truncate">{value}</p>
        </div>
        <div className={`${iconBgClasses[color]} bg-opacity-30 rounded-full p-2 sm:p-3 ml-2`}>
          <i className={`fas ${icon} text-lg sm:text-2xl`}></i>
        </div>
      </div>
      <div className={`mt-2 flex items-center ${textColorClasses[color]} text-xs`}>
        {subtitle}
      </div>
    </div>
  );
};

export default StatCard;