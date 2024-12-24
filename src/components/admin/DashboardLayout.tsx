import React, { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close mobile menu when clicking outside
  const handleBackdropClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <DashboardHeader 
        className="lg:pl-72" 
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-surface-900/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={handleBackdropClick}
        />
      )}
      
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} />
      
      <main className="pt-16 lg:pl-72">
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
