import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import type { Admin } from '../../types';
import { Button } from '../ui';

interface AdminListProps {
  teamId?: number;
  onCreateAdmin: () => void;
  refreshTrigger?: number; // 새로고침 트리거
}

const AdminList: React.FC<AdminListProps> = ({
  teamId,
  onCreateAdmin,
  refreshTrigger,
}) => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdmins();
  }, [teamId, refreshTrigger]);

  const loadAdmins = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getAdmins(teamId);
      if (response.success && response.data) {
        setAdmins(response.data);
      } else {
        setError(response.error || '관리자 목록을 불러올 수 없습니다.');
      }
    } catch (err: any) {
      setError(err.message || '관리자 목록을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionBadges = (admin: Admin) => {
    if (!admin.adminLevel) return null;

    const permissions = [];
    if (admin.adminLevel.canManageTeam) permissions.push('팀관리');
    if (admin.adminLevel.canManageUsers) permissions.push('사용자관리');
    if (admin.adminLevel.canManageScenarios) permissions.push('시나리오관리');
    if (admin.adminLevel.canApproveScenarios) permissions.push('승인관리');
    if (admin.adminLevel.canViewResults) permissions.push('결과조회');

    return permissions.map((permission, index) => (
      <span
        key={index}
        className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-300"
      >
        {permission}
      </span>
    ));
  };

  const getStatusBadge = (admin: Admin) => {
    if (!admin.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full dark:bg-red-900 dark:text-red-300">
          비활성
        </span>
      );
    }
    if (admin.useYn === 'Y') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
          활성
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full dark:bg-gray-900 dark:text-gray-300">
        사용안함
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <Button onClick={loadAdmins} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          관리자 목록 ({admins.length}명)
        </h3>
        <Button onClick={onCreateAdmin}>새 관리자 생성</Button>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          관리자가 없습니다.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {admins.map(admin => (
              <li key={admin.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {admin.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {admin.name}
                          </p>
                          {getStatusBadge(admin)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {admin.email} • {admin.phone}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {admin.loginId} • {admin.adminLevel?.levelName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {getPermissionBadges(admin)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      생성: {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdminList;
