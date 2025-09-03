import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main className="w-full py-6">{children}</main>
    </div>
  );
};

export default Layout;
