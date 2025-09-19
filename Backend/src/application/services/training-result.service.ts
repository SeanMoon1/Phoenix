import { Injectable, Inject } from '@nestjs/common';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserChoiceLog } from '../../domain/entities/user-choice-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TrainingResultService {
  constructor(
    @InjectRepository(TrainingResult)
    private readonly trainingResultRepository: Repository<TrainingResult>,
    @InjectRepository(UserChoiceLog)
    private readonly userChoiceLogRepository: Repository<UserChoiceLog>,
  ) {}

  async createTrainingResult(
    data: Partial<TrainingResult>,
  ): Promise<TrainingResult> {
    try {
      console.log('🔍 훈련 결과 생성 시작:', data);

      // 필수 필드 검증
      if (!data.userId || !data.sessionId || !data.scenarioId) {
        throw new Error(
          '필수 필드가 누락되었습니다: userId, sessionId, scenarioId',
        );
      }

      // 결과 코드 생성
      const resultCode = `RESULT_${Date.now()}_${data.userId}`;

      const trainingResult = this.trainingResultRepository.create({
        ...data,
        resultCode,
        completedAt: new Date(),
        isActive: true,
      });

      const savedResult =
        await this.trainingResultRepository.save(trainingResult);
      console.log('✅ 훈련 결과 생성 완료:', {
        id: savedResult.id,
        resultCode,
      });

      return savedResult;
    } catch (error) {
      console.error('❌ 훈련 결과 생성 실패:', error);
      throw error;
    }
  }

  async getTrainingResultsByUser(userId: number): Promise<TrainingResult[]> {
    try {
      console.log('🔍 사용자 훈련 결과 조회:', { userId });

      const results = await this.trainingResultRepository.find({
        where: { userId, isActive: true },
        relations: ['session', 'scenario', 'user'],
        order: { completedAt: 'DESC' },
      });

      console.log('✅ 사용자 훈련 결과 조회 완료:', { count: results.length });
      return results;
    } catch (error) {
      console.error('❌ 사용자 훈련 결과 조회 실패:', error);
      throw error;
    }
  }

  async getTrainingResultsBySession(
    sessionId: number,
  ): Promise<TrainingResult[]> {
    try {
      console.log('🔍 세션별 훈련 결과 조회:', { sessionId });

      const results = await this.trainingResultRepository.find({
        where: { sessionId, isActive: true },
        relations: ['user', 'scenario'],
        order: { completedAt: 'DESC' },
      });

      console.log('✅ 세션별 훈련 결과 조회 완료:', { count: results.length });
      return results;
    } catch (error) {
      console.error('❌ 세션별 훈련 결과 조회 실패:', error);
      throw error;
    }
  }

  async getTrainingStatistics(userId: number): Promise<any> {
    try {
      console.log('🔍 사용자 훈련 통계 조회:', { userId });

      const results = await this.trainingResultRepository.find({
        where: { userId, isActive: true },
        relations: ['scenario'],
      });

      if (results.length === 0) {
        return {
          totalSessions: 0,
          totalScore: 0,
          averageScore: 0,
          completedScenarios: 0,
          averageAccuracy: 0,
          averageSpeed: 0,
          lastTrainingDate: null,
        };
      }

      const totalSessions = results.length;
      const totalScore = results.reduce(
        (sum, result) => sum + (result.totalScore || 0),
        0,
      );
      const averageScore = totalScore / totalSessions;
      const completedScenarios = new Set(results.map((r) => r.scenarioId)).size;
      const averageAccuracy =
        results.reduce((sum, result) => sum + (result.accuracyScore || 0), 0) /
        totalSessions;
      const averageSpeed =
        results.reduce((sum, result) => sum + (result.speedScore || 0), 0) /
        totalSessions;
      const lastTrainingDate = results[0]?.completedAt || null;

      const statistics = {
        totalSessions,
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        completedScenarios,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        averageSpeed: Math.round(averageSpeed * 100) / 100,
        lastTrainingDate,
      };

      console.log('✅ 사용자 훈련 통계 조회 완료:', statistics);
      return statistics;
    } catch (error) {
      console.error('❌ 사용자 훈련 통계 조회 실패:', error);
      throw error;
    }
  }

  async getUserChoiceLogs(resultId: number): Promise<UserChoiceLog[]> {
    try {
      console.log('🔍 사용자 선택 로그 조회:', { resultId });

      const logs = await this.userChoiceLogRepository.find({
        where: { resultId, isActive: true },
        relations: ['event', 'choice'],
        order: { selectedAt: 'ASC' },
      });

      console.log('✅ 사용자 선택 로그 조회 완료:', { count: logs.length });
      return logs;
    } catch (error) {
      console.error('❌ 사용자 선택 로그 조회 실패:', error);
      throw error;
    }
  }

  async createUserChoiceLog(
    data: Partial<UserChoiceLog>,
  ): Promise<UserChoiceLog> {
    try {
      console.log('🔍 사용자 선택 로그 생성 시작:', data);

      // 필수 필드 검증
      if (!data.resultId || !data.eventId || !data.choiceId) {
        throw new Error(
          '필수 필드가 누락되었습니다: resultId, eventId, choiceId',
        );
      }

      // 로그 코드 생성
      const logCode = `LOG_${Date.now()}_${data.resultId}`;

      const userChoiceLog = this.userChoiceLogRepository.create({
        ...data,
        logCode,
        selectedAt: new Date(),
        isActive: true,
      });

      const savedLog = await this.userChoiceLogRepository.save(userChoiceLog);
      console.log('✅ 사용자 선택 로그 생성 완료:', {
        id: savedLog.id,
        logCode,
      });

      return savedLog;
    } catch (error) {
      console.error('❌ 사용자 선택 로그 생성 실패:', error);
      throw error;
    }
  }
}
