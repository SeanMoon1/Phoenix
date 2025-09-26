import { useCallback } from 'react';
import { trainingApi, trainingResultApi, userExpApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

// 시나리오 타입을 API용으로 변환하는 함수
const getScenarioTypeForApi = (scenarioType: string): string => {
  const typeMap: Record<string, string> = {
    fire: 'FIRE',
    'first-aid': 'EMERGENCY',
    'traffic-accident': 'TRAFFIC',
    earthquake: 'EARTHQUAKE',
    flood: 'FLOOD',
  };
  return typeMap[scenarioType] || 'FIRE';
};

export function useTrainingResult() {
  const { user } = useAuthStore();

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
        const scenarioIdMap: Record<string, number> = {
          fire: 1, // FIRE
          'first-aid': 3, // EMERGENCY (응급처치)
          'traffic-accident': 4, // TRAFFIC (교통사고)
          earthquake: 2, // EARTHQUAKE (지진)
          flood: 5, // FLOOD (홍수)
        };
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

        // 서버에 경험치 정보 전송
        try {
          const expToAdd = Math.round(
            (opts.expSystemState.totalCorrect / actualQuestionCount) * 50
          ); // 정답률에 따른 경험치
          await userExpApi.updateUserExp({
            userId: user.id,
            expToAdd,
            totalScore: resultData.totalScore,
            completedScenarios: 1,
          });
          console.log('✅ 서버에 경험치 정보 전송 완료');
        } catch (expError) {
          console.error('❌ 서버 경험치 업데이트 실패:', expError);
          // 경험치 업데이트 실패해도 훈련 결과는 저장된 상태로 처리
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
