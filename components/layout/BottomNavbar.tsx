import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import type { Section } from '../../types';

interface BottomNavItemProps {
  section: Section;
  icon: string;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const BottomNavItem: React.FC<BottomNavItemProps> = ({ icon, label, onClick, isActive }) => {
  const activeClasses = 'text-blue-600 scale-110';
  const inactiveClasses = 'text-gray-500';

  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center p-2 transition-all duration-300 transform ${isActive ? activeClasses : inactiveClasses}`}
      aria-current={isActive ? 'page' : undefined}
    >
      <i className={`fas ${icon} text-2xl`}></i>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
};

const BottomNavbar: React.FC = () => {
  const { currentUser, activeSection, setActiveSection } = useContext(AppContext);
  const { t } = useContext(LanguageContext);

  const navItems: { section: Section, icon: string, labelKey: string, roles: ('host' | 'co-host' | 'guest')[] }[] = [
    { section: 'dashboard', icon: 'fa-home', labelKey: 'navbar.dashboard', roles: ['host', 'co-host', 'guest'] },
    { section: 'research', icon: 'fa-flask', labelKey: 'navbar.research', roles: ['host', 'co-host', 'guest'] },
    { section: 'collaboration', icon: 'fa-handshake', labelKey: 'navbar.collaborations', roles: ['host', 'co-host', 'guest'] },
    { section: 'centres', icon: 'fa-building', labelKey: 'navbar.centres', roles: ['host'] },
    { section: 'researchers', icon: 'fa-user-graduate', labelKey: 'navbar.researchers', roles: ['host', 'co-host', 'guest'] },
    { section: 'account & users', icon: 'fa-user-cog', labelKey: 'navbar.accountAndUsers', roles: ['host', 'co-host'] },
  ];
  
  if (!currentUser) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] flex justify-around sm:hidden z-40">
      {navItems
        .filter(item => item.roles.includes(currentUser.role))
        .map(item => (
          <BottomNavItem
            key={item.section}
            section={item.section}
            icon={item.icon}
            label={t(item.labelKey)}
            onClick={() => setActiveSection(item.section)}
            isActive={activeSection === item.section}
          />
        ))}
    </nav>
  );
};

export default BottomNavbar;