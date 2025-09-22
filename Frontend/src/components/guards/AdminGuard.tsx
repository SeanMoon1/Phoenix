import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../stores/adminAuthStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { isAuthenticated, admin } = useAdminAuthStore();

  if (!isAuthenticated || !admin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
