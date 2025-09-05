import React from 'react';
import Header from './Header';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 메인페이지와 동일한 Header */}
      <Header />

      {/* 메인 콘텐츠 */}
      <main className="w-full py-6">{children}</main>
    </div>
  );
};

export default AdminLayout;
