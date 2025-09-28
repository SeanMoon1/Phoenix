import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import Layout from '../../components/layout/Layout';
import { api } from '../../services/api';
import { Icon } from '../../utils/icons';

const requestResetSchema = yup.object({
  email: yup
    .string()
    .email('올바른 이메일 형식을 입력해주세요.')
    .required('이메일을 입력해주세요.'),
});

const verifyCodeSchema = yup.object({
  email: yup
    .string()
    .email('올바른 이메일 형식을 입력해주세요.')
    .required('이메일을 입력해주세요.'),
  code: yup
    .string()
    .length(6, '인증 코드는 6자리여야 합니다.')
    .required('인증 코드를 입력해주세요.'),
});

const resetPasswordSchema = yup.object({
  email: yup
    .string()
    .email('올바른 이메일 형식을 입력해주세요.')
    .required('이메일을 입력해주세요.'),
  code: yup
    .string()
    .length(6, '인증 코드는 6자리여야 합니다.')
    .required('인증 코드를 입력해주세요.'),
  newPassword: yup
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
    .required('새 비밀번호를 입력해주세요.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], '비밀번호가 일치하지 않습니다.')
    .required('비밀번호 확인을 입력해주세요.'),
});

type RequestResetFormData = yup.InferType<typeof requestResetSchema>;
type VerifyCodeFormData = yup.InferType<typeof verifyCodeSchema>;
type ResetPasswordFormData = yup.InferType<typeof resetPasswordSchema>;

type Step = 'request' | 'verify' | 'reset' | 'complete';

const ResetPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [email, setEmail] = useState('');

  const requestForm = useForm<RequestResetFormData>({
    resolver: yupResolver(requestResetSchema),
  });

  const verifyForm = useForm<VerifyCodeFormData>({
    resolver: yupResolver(verifyCodeSchema),
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const handleRequestReset = async (data: RequestResetFormData) => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await api.post('/auth/request-password-reset', data);
      const responseData = response.data as {
        success: boolean;
        message: string;
      };

      if (responseData.success) {
        setEmail(data.email);
        setStep('verify');
        setResult({
          success: true,
          message: responseData.message,
        });
      } else {
        setResult({
          success: false,
          message: responseData.message,
        });
      }
    } catch (error: any) {
      console.error('비밀번호 재설정 요청 오류:', error);
      setResult({
        success: false,
        message:
          error.response?.data?.message ||
          '비밀번호 재설정 요청 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (data: VerifyCodeFormData) => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await api.post('/auth/verify-reset-code', data);
      const responseData = response.data as {
        success: boolean;
        message: string;
      };

      if (responseData.success) {
        setStep('reset');
        setResult({
          success: true,
          message: responseData.message,
        });
      } else {
        setResult({
          success: false,
          message: responseData.message,
        });
      }
    } catch (error: any) {
      console.error('인증 코드 검증 오류:', error);
      setResult({
        success: false,
        message:
          error.response?.data?.message ||
          '인증 코드 검증 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setResult(null);

      const response = await api.post('/auth/reset-password', {
        email: data.email,
        code: data.code,
        newPassword: data.newPassword,
      });
      const responseData = response.data as {
        success: boolean;
        message: string;
      };

      if (responseData.success) {
        setStep('complete');
        setResult({
          success: true,
          message: responseData.message,
        });
      } else {
        setResult({
          success: false,
          message: responseData.message,
        });
      }
    } catch (error: any) {
      console.error('비밀번호 재설정 오류:', error);
      setResult({
        success: false,
        message:
          error.response?.data?.message ||
          '비밀번호 재설정 중 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRequest = () => {
    setStep('request');
    setResult(null);
    setEmail('');
    requestForm.reset();
    verifyForm.reset();
    resetForm.reset();
  };

  const handleBackToVerify = () => {
    setStep('verify');
    setResult(null);
    resetForm.reset();
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-3 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl md:text-3xl dark:text-white">
              비밀번호 재설정
            </h2>
            <p className="mt-2 text-xs text-gray-600 sm:text-sm dark:text-gray-300">
              {step === 'request' && '재난훈련ON 계정의 비밀번호를 재설정하세요'}
              {step === 'verify' && '이메일로 전송된 인증 코드를 입력해주세요'}
              {step === 'reset' && '새 비밀번호를 입력해주세요'}
              {step === 'complete' && '비밀번호가 성공적으로 변경되었습니다'}
            </p>
          </div>

          <div className="p-4 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-600 rounded-xl dark:shadow-lg sm:p-6 md:p-8">
            {/* 단계 표시 */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-2">
                {['request', 'verify', 'reset', 'complete'].map(
                  (stepName, index) => (
                    <React.Fragment key={stepName}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          step === stepName
                            ? 'bg-orange-500 text-white'
                            : [
                                'request',
                                'verify',
                                'reset',
                                'complete',
                              ].indexOf(step) > index
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div
                          className={`w-8 h-0.5 ${
                            ['request', 'verify', 'reset', 'complete'].indexOf(
                              step
                            ) > index
                              ? 'bg-green-500'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      )}
                    </React.Fragment>
                  )
                )}
              </div>
            </div>

            {result && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  result.success
                    ? 'bg-green-50 border border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : 'bg-red-50 border border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                }`}
              >
                <p className="text-sm">{result.message}</p>
              </div>
            )}

            {step === 'request' && (
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={requestForm.handleSubmit(handleRequestReset)}
              >
                <Input
                  label="이메일"
                  type="email"
                  placeholder="user@example.com"
                  error={requestForm.formState.errors.email?.message}
                  {...requestForm.register('email')}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  인증 코드 전송
                </Button>
              </form>
            )}

            {step === 'verify' && (
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={verifyForm.handleSubmit(handleVerifyCode)}
              >
                <Input
                  label="이메일"
                  type="email"
                  value={email}
                  disabled
                  {...verifyForm.register('email')}
                />

                <Input
                  label="인증 코드"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  error={verifyForm.formState.errors.code?.message}
                  {...verifyForm.register('code')}
                />

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToRequest}
                  >
                    이전
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    인증 확인
                  </Button>
                </div>
              </form>
            )}

            {step === 'reset' && (
              <form
                className="space-y-4 sm:space-y-6"
                onSubmit={resetForm.handleSubmit(handleResetPassword)}
              >
                <Input
                  label="이메일"
                  type="email"
                  value={email}
                  disabled
                  {...resetForm.register('email')}
                />

                <Input
                  label="인증 코드"
                  type="text"
                  value={verifyForm.getValues('code')}
                  disabled
                  {...resetForm.register('code')}
                />

                <Input
                  label="새 비밀번호"
                  type="password"
                  placeholder="••••••••"
                  error={resetForm.formState.errors.newPassword?.message}
                  {...resetForm.register('newPassword')}
                />

                <Input
                  label="비밀번호 확인"
                  type="password"
                  placeholder="••••••••"
                  error={resetForm.formState.errors.confirmPassword?.message}
                  {...resetForm.register('confirmPassword')}
                />

                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToVerify}
                  >
                    이전
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    비밀번호 변경
                  </Button>
                </div>
              </form>
            )}

            {step === 'complete' && (
              <div className="space-y-4 text-center">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                  <div className="text-green-600 dark:text-green-400">
                    <div className="flex justify-center mb-3">
                      <Icon type="success" category="status" className="w-12 h-12" />
                    </div>
                    <p className="text-sm font-medium">{result?.message}</p>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="block w-full text-xs text-center text-orange-600 sm:text-sm dark:text-orange-400 hover:text-orange-500 dark:hover:text-orange-300"
                >
                  로그인 페이지로 이동
                </Link>
              </div>
            )}

            {step !== 'complete' && (
              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  className="text-xs text-gray-600 sm:text-sm dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
