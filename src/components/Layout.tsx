import React from 'react';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobile, isTablet } = useIsMobile();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/10 to-indigo-200/10 rounded-full blur-3xl"></div>
      </div>

      <Header />
      <main className={`
        pt-5 relative z-10
        ${isMobile ? 'px-3 pb-6' : isTablet ? 'px-4 pb-8' : 'px-6 pb-10'}
        transition-all duration-300 ease-in-out
      `}>
        <div className={`
          mx-auto
          ${isMobile ? 'max-w-full' : isTablet ? 'max-w-4xl' : 'max-w-7xl'}
        `}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout; 