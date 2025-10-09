import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import Header from './Header';
import Navbar from './Navbar';
import BottomNavbar from './BottomNavbar';
import Dashboard from '../dashboard/Dashboard';
import ResearchManagement from '../research/ResearchManagement';
import CollaborationManagement from '../collaboration/CollaborationManagement';
import CentreManagement from '../centres/CentreManagement';
import ResearcherManagement from '../researchers/ResearcherManagement';
import AccountAndUsersManagement from '../account/AccountAndUsersManagement';

const MainLayout: React.FC = () => {
  const { activeSection } = useContext(AppContext);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'research':
        return <ResearchManagement />;
      case 'collaboration':
        return <CollaborationManagement />;
      case 'centres':
        return <CentreManagement />;
      case 'researchers':
        return <ResearcherManagement />;
      case 'account & users':
        return <AccountAndUsersManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 sm:pb-8">
        {renderSection()}
      </main>
      <BottomNavbar />
    </div>
  );
};

export default MainLayout;