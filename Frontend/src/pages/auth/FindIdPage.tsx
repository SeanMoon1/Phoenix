import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';
import { api } from '../../services/api';
import { Icon } from '../../utils/icons';

const findIdSchema = yup.object({
  name: yup
    .string()
    .min(2, '이름은 최소 2자 이상이어야 합니다.')
    .required('이름을 입력해주세요.'),
  email: yup
    .string()
    .email('올바른 이메일 형식을 입력해주세요.')
    .required('이메일을 입력해주세요.'),
});

type FindIdFormData = yup.InferType<typeof findIdSchema>;

const FindIdPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: { loginId: string };
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FindIdFormData>({
    resolver: yupResolver(findIdSchema),
  });

  const onSubmit = async (data: FindIdFormData) => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await api.post('/auth/find-id', data);
      const responseData = response.data as {
        success: boolean;
        message: string;
        data?: { loginId: string };
      };

      if (responseData.success) {
        setResult({
          success: true,
          message: responseData.message,
          data: responseData.data,
        });
      } else {
        setResult({
          success: false,
          message: responseData.message,
        });
      }
    } catch (error: any) {
      console.error('아이디 찾기 오류:', error);
      setResult({
        success: false,
        message:
          error.response?.data?.message ||
          '아이디 찾기 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
              아이디 찾기
            </h2>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
              재난훈련ON 계정의 아이디를 찾아보세요
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 rounded-xl dark:shadow-lg sm:p-6 md:p-8">
            {!result ? (
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="space-y-3 sm:space-y-4">
                  <Input
                    label="이름"
                    type="text"
                    placeholder="홍길동"
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    label="이메일"
                    type="email"
                    placeholder="user@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  아이디 찾기
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                {result.success ? (
                  <>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
                      <div className="text-green-600 dark:text-green-400">
                        <div className="flex justify-center mb-3">
                          <Icon
                            type="success"
                            category="status"
                            className="w-12 h-12"
                          />
                        </div>
                        <p className="text-sm font-medium">{result.message}</p>
                        {result.data && (
                          <div className="mt-3 p-3 bg-white border border-green-300 rounded-lg dark:bg-gray-800 dark:border-green-700">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                              찾은 아이디
                            </p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {result.data.loginId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800">
                    <div className="text-red-600 dark:text-red-400">
                      <div className="flex justify-center mb-3">
                        <Icon
                          type="error"
                          category="status"
                          className="w-12 h-12"
                        />
                      </div>
                      <p className="text-sm font-medium">{result.message}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setResult(null)}
                  >
                    다시 찾기
                  </Button>

                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      className="flex-1 text-center text-xs text-orange-600 sm:text-sm dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/reset-password"
                      className="flex-1 text-center text-xs text-blue-600 sm:text-sm dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                    >
                      비밀번호 재설정
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FindIdPage;
