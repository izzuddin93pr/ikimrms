
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { LanguageContext } from '../../context/LanguageContext';
import type { Section } from '../../types';

interface NavItemProps {
  section: Section;
  icon: string;
  label: string;
  onClick: () => void;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ section, icon, label, onClick, isActive }) => {
  const activeClasses = 'border-white bg-white bg-opacity-20';
  const inactiveClasses = 'border-transparent';

  return (
    <button
      onClick={onClick}
      className={`nav-btn px-2 sm:px-4 py-4 font-medium hover:bg-white hover:bg-opacity-20 transition duration-300 border-b-2 hover:border-white whitespace-nowrap ${isActive ? activeClasses : inactiveClasses}`}
      data-section={section}
    >
      <i className={`fas ${icon} sm:mr-2`}></i>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const Navbar: React.FC = () => {
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
    <nav className="hidden sm:block bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 min-w-max">
          {navItems
            .filter(item => item.roles.includes(currentUser.role))
            .map(item => (
              <NavItem
                key={item.section}
                section={item.section}
                icon={item.icon}
                label={t(item.labelKey)}
                onClick={() => setActiveSection(item.section)}
                isActive={activeSection === item.section}
              />
            ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;