import React from 'react';
import { useAdminAuthStore } from '../../stores/adminAuthStore';
import MyPage from '../../pages/mypage/MyPage';
import AdminPage from '../../pages/admin/AdminPage';
import AdminGuard from '../guards/AdminGuard';

const UserDashboard: React.FC = () => {
  const { admin, isAuthenticated: isAdminAuthenticated } = useAdminAuthStore();

  // 관리자 인증이 되어 있는 경우 관리자 페이지 표시
  if (isAdminAuthenticated && admin?.isAdmin) {
    return (
      <AdminGuard>
        <AdminPage />
      </AdminGuard>
    );
  }

  // 일반 사용자의 경우 마이페이지 표시
  return <MyPage />;
};

export default UserDashboard;
