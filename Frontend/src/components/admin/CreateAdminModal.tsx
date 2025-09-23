import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Input, Modal } from '../ui';
import { adminApi } from '../../services/api';
import type { CreateAdminData, AdminLevel, Team } from '../../types';

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const schema = yup.object({
  loginId: yup
    .string()
    .required('로그인 ID는 필수입니다')
    .min(3, '로그인 ID는 최소 3자 이상이어야 합니다')
    .max(50, '로그인 ID는 최대 50자까지 가능합니다'),
  password: yup
    .string()
    .required('비밀번호는 필수입니다')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(255, '비밀번호는 최대 255자까지 가능합니다'),
  name: yup
    .string()
    .required('관리자명은 필수입니다')
    .max(100, '관리자명은 최대 100자까지 가능합니다'),
  email: yup
    .string()
    .required('이메일은 필수입니다')
    .email('올바른 이메일 형식이 아닙니다')
    .max(200, '이메일은 최대 200자까지 가능합니다'),
  phone: yup
    .string()
    .required('연락처는 필수입니다')
    .max(20, '연락처는 최대 20자까지 가능합니다'),
  teamId: yup
    .number()
    .required('팀을 선택해주세요')
    .positive('올바른 팀을 선택해주세요'),
  adminLevelId: yup
    .number()
    .required('권한 레벨을 선택해주세요')
    .positive('올바른 권한 레벨을 선택해주세요'),
});

const CreateAdminModal: React.FC<CreateAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [adminLevels, setAdminLevels] = useState<AdminLevel[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateAdminData>({
    resolver: yupResolver(schema),
  });

  // 데이터 로드
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('관리자 모달 데이터 로드 시작...');

      const [levelsResponse, teamsResponse] = await Promise.all([
        adminApi.getAdminLevels(),
        adminApi.getTeams(), // teamApi.getAll() 대신 adminApi.getTeams() 사용
      ]);

      console.log('권한 레벨 응답:', levelsResponse);
      console.log('팀 목록 응답:', teamsResponse);

      if (levelsResponse.success && levelsResponse.data) {
        setAdminLevels(levelsResponse.data);
        console.log('권한 레벨 설정됨:', levelsResponse.data);
      } else {
        console.error('권한 레벨 로드 실패:', levelsResponse.error);
      }

      if (teamsResponse.success && teamsResponse.data) {
        setTeams(teamsResponse.data);
        console.log('팀 목록 로드됨:', teamsResponse.data);
      } else {
        console.error('팀 목록 로드 실패:', teamsResponse.error);
        console.error('팀 응답 상세:', teamsResponse);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateAdminData) => {
    setIsSubmitting(true);
    try {
      const response = await adminApi.createAdmin(data);

      if (response.success) {
        onSuccess();
        onClose();
        reset();
      } else {
        throw new Error(response.error || '관리자 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('관리자 생성 실패:', error);
      alert(error.message || '관리자 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="새 관리자 계정 생성">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="로그인 ID"
            type="text"
            placeholder="admin001"
            error={errors.loginId?.message}
            {...register('loginId')}
          />

          <Input
            label="비밀번호"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="관리자명"
            type="text"
            placeholder="김관리"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="이메일"
            type="email"
            placeholder="admin@phoenix.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="연락처"
            type="text"
            placeholder="010-1234-5678"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              팀 선택
            </label>
            {isLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
                <span className="text-gray-500 dark:text-gray-400">
                  팀 목록을 불러오는 중...
                </span>
              </div>
            ) : (
              <select
                {...register('teamId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">팀을 선택하세요</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.teamCode})
                  </option>
                ))}
              </select>
            )}
            {errors.teamId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.teamId.message}
              </p>
            )}
            {!isLoading && teams.length === 0 && (
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                생성된 팀이 없습니다. 먼저 팀을 생성해주세요.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              권한 레벨
            </label>
            <select
              {...register('adminLevelId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">권한 레벨을 선택하세요</option>
              {adminLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.levelName} - {level.description}
                </option>
              ))}
            </select>
            {errors.adminLevelId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.adminLevelId.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isLoading}>
            {isSubmitting ? '생성 중...' : '관리자 생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAdminModal;
