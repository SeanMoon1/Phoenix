import React from 'react';
import Header from './Header';
import IconAttribution from '../common/IconAttribution';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="w-full py-6">{children}</main>
      <footer className="mt-auto py-4 px-6 border-t border-gray-200 dark:border-gray-700">
        <IconAttribution />
      </footer>
    </div>
  );
};

export default Layout;
