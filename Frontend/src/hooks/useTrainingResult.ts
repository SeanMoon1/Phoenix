import { useCallback } from 'react';
import { trainingApi, trainingResultApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

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
          fire: 1,
          emergency: 2,
          traffic: 3,
          earthquake: 4,
          flood: 5,
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
        };
        const session = await trainingApi.createSession(sessionData as any);
        const sessionId = (session.data as any)?.id;
        const resultData = {
          sessionId,
          participantId: user.id,
          scenarioId: scenarioIdMap[opts.scenarioType || 'fire'] || 1,
          userId: user.id,
          resultCode: `RESULT${Date.now()}`,
          accuracyScore:
            opts.gameStateSummary.scenariosCount > 0
              ? Math.round(
                  (opts.expSystemState.totalCorrect /
                    opts.gameStateSummary.scenariosCount) *
                    100
                )
              : 0,
          speedScore: Math.max(0, 100 - Math.floor(timeSpent / 10)),
          totalScore:
            opts.gameStateSummary.scenariosCount > 0
              ? Math.round(
                  ((opts.expSystemState.totalCorrect /
                    opts.gameStateSummary.scenariosCount) *
                    100 +
                    Math.max(0, 100 - Math.floor(timeSpent / 10))) /
                    2
                )
              : 0,
          completionTime: timeSpent,
          feedback: `${opts.scenarioSetName} 완료 - 레벨 ${opts.expSystemState.level}, 정답 ${opts.expSystemState.totalCorrect}/${opts.gameStateSummary.scenariosCount}`,
          completedAt: new Date().toISOString(),
        };
        await trainingResultApi.save(resultData);
        return { ok: true };
      } catch (err) {
        console.error('useTrainingResult.saveTrainingResult failed', err);
        return { ok: false, error: err };
      }
    },
    [user]
  );

  return { saveTrainingResult };
}
