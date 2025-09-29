import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import MyPage from '../../pages/mypage/MyPage';
import AdminPage from '../../pages/admin/AdminPage';

const UserDashboard: React.FC = () => {
  const { user } = useAuthStore();

  // 관리자 권한이 있는 경우 관리자 페이지 표시
  if (user?.isAdmin) {
    return <AdminPage />;
  }

  // 일반 사용자의 경우 마이페이지 표시
  return <MyPage />;
};

export default UserDashboard;
