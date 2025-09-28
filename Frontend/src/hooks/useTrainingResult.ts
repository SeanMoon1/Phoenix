import { useCallback } from 'react';
import { trainingApi, trainingResultApi, api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { scenarioIdMap, getScenarioTypeForApi } from '@/utils/scenarioMaps';

export function useTrainingResult() {
  const { user, setUser } = useAuthStore();

  const saveTrainingResult = useCallback(
    async (opts: {
      scenarioSetName: string;
      scenarioType?: string;
      expSystemState: { level: number; totalCorrect: number };
      gameStateSummary: {
        scenariosCount: number;
        startTimeMs?: number;
        failedThisRun?: boolean;
      };
    }) => {
      if (!user) return { ok: false, error: 'no-user' };
      try {
        const timeSpent = opts.gameStateSummary.startTimeMs
          ? Math.floor((Date.now() - opts.gameStateSummary.startTimeMs) / 1000)
          : 0;
        const sessionData: any = {
          sessionName: `${opts.scenarioSetName} 훈련`,
          scenarioId: scenarioIdMap[opts.scenarioType || 'fire'] || 1,
          startTime: new Date(
            opts.gameStateSummary.startTimeMs ?? Date.now()
          ).toISOString(),
          endTime: new Date().toISOString(),
          status: 'completed',
          createdBy: user.id,
          teamId: user.teamId || null, // 사용자의 팀 ID 추가 (없으면 null)
        };
        const session = await trainingApi.createSession(sessionData as any);
        const sessionId = (session.data as any)?.id;
        // 실제 문제 수 사용 (이미 order가 999인 #END 슬라이드가 제외된 값)
        const actualQuestionCount = opts.gameStateSummary.scenariosCount;

        // 정확도 계산 (모든 문제를 맞춘 경우 100%)
        const accuracyPercentage =
          actualQuestionCount > 0
            ? Math.round(
                (opts.expSystemState.totalCorrect / actualQuestionCount) * 100
              )
            : 0;

        // 속도 점수 계산
        const speedScore =
          timeSpent <= 45
            ? 100
            : Math.max(0, Math.round(100 - (timeSpent - 45) / 3));

        // 총 점수 계산 (정확도 70% + 속도 30%)
        const totalScore =
          actualQuestionCount > 0
            ? Math.round(accuracyPercentage * 0.7 + speedScore * 0.3)
            : 0;

        const resultData = {
          sessionId,
          // participantId는 제거 - 서버에서 자동으로 생성하도록 함
          scenarioId: scenarioIdMap[opts.scenarioType || 'fire'] || 1,
          scenarioType: getScenarioTypeForApi(opts.scenarioType || 'fire'), // 시나리오 타입 추가
          userId: user.id,
          resultCode: `RESULT${Date.now()}`,
          accuracyScore: accuracyPercentage,
          speedScore: speedScore,
          totalScore: totalScore,
          completionTime: timeSpent,
          feedback: `${opts.scenarioSetName} 완료 - 레벨 ${opts.expSystemState.level}, 정답 ${opts.expSystemState.totalCorrect}/${actualQuestionCount}`,
          completedAt: new Date().toISOString(),
        };
        console.log('📤 훈련 결과 저장 시도:', {
          ...resultData,
          scenarioType: resultData.scenarioType,
          totalScore: resultData.totalScore,
          accuracyScore: resultData.accuracyScore,
          speedScore: resultData.speedScore,
          completionTime: resultData.completionTime,
        });

        const saveResult = await trainingResultApi.save(resultData);
        console.log('✅ 훈련 결과 저장 성공:', {
          success: saveResult.success,
          data: saveResult.data,
          error: saveResult.error,
        });

        // TrainingResultService에서 이미 경험치가 업데이트되므로 별도 호출 불필요
        // 대신 사용자 정보만 새로고침
        try {
          console.log('🔄 사용자 정보 새로고침 시작');
          const profileResponse = await api.get(`/auth/profile`);
          if (profileResponse.success && profileResponse.data) {
            console.log(
              '✅ 사용자 프로필 정보 업데이트:',
              profileResponse.data
            );
            setUser(profileResponse.data as any);
          }
        } catch (profileError) {
          console.error('❌ 사용자 프로필 새로고침 실패:', profileError);
        }

        return { ok: true };
      } catch (err) {
        console.error('❌ useTrainingResult.saveTrainingResult 실패:', {
          error: err,
          message: (err as any)?.message || '알 수 없는 오류',
          stack: (err as any)?.stack,
          data: {
            scenarioSetName: opts.scenarioSetName,
            scenarioType: opts.scenarioType,
            userId: user?.id,
          },
        });
        return { ok: false, error: err };
      }
    },
    [user]
  );

  return { saveTrainingResult };
}
