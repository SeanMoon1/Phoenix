import { Injectable, Inject } from '@nestjs/common';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserChoiceLog } from '../../domain/entities/user-choice-log.entity';
import { TrainingParticipant } from '../../domain/entities/training-participant.entity';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TrainingResultService {
  constructor(
    @InjectRepository(TrainingResult)
    private readonly trainingResultRepository: Repository<TrainingResult>,
    @InjectRepository(UserChoiceLog)
    private readonly userChoiceLogRepository: Repository<UserChoiceLog>,
    @InjectRepository(TrainingParticipant)
    private readonly trainingParticipantRepository: Repository<TrainingParticipant>,
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

      // participantId가 없으면 자동으로 참가자 생성
      let participantId = data.participantId;
      if (!participantId) {
        console.log('🔍 participantId가 없어서 자동 생성합니다.');
        participantId = await this.createOrGetParticipant(
          data.userId!,
          data.sessionId!,
          data.scenarioId!,
        );
        console.log('✅ 참가자 생성/조회 완료:', { participantId });
      }

      // 결과 코드 생성 (이미 있으면 사용, 없으면 생성)
      const resultCode =
        data.resultCode || `RESULT_${Date.now()}_${data.userId}`;

      const trainingResult = this.trainingResultRepository.create({
        ...data,
        participantId,
        resultCode,
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
        isActive: true,
      });

      const savedResult =
        await this.trainingResultRepository.save(trainingResult);
      console.log('✅ 훈련 결과 생성 완료:', {
        id: savedResult.id,
        resultCode,
        participantId,
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

  /**
   * 참가자 생성 또는 조회
   * @param userId 사용자 ID
   * @param sessionId 세션 ID
   * @param scenarioId 시나리오 ID
   * @returns 참가자 ID
   */
  private async createOrGetParticipant(
    userId: number,
    sessionId: number,
    scenarioId: number,
  ): Promise<number> {
    try {
      console.log('🔍 참가자 생성/조회 시작:', {
        userId,
        sessionId,
        scenarioId,
      });

      // 기존 참가자 조회
      const existingParticipant =
        await this.trainingParticipantRepository.findOne({
          where: {
            userId,
            sessionId,
            scenarioId,
            isActive: true,
          },
        });

      if (existingParticipant) {
        console.log('✅ 기존 참가자 발견:', {
          participantId: existingParticipant.id,
        });
        return existingParticipant.id;
      }

      // 세션 정보 조회하여 teamId 가져오기
      const session = await this.trainingResultRepository.manager.findOne(
        TrainingSession,
        {
          where: { id: sessionId },
        },
      );

      const teamId = session?.teamId; // 세션의 teamId가 없으면 null (팀 없이도 참가 가능)

      // 새 참가자 생성
      const participantCode = `PART_${Date.now()}_${userId}`;
      const newParticipant = this.trainingParticipantRepository.create({
        userId,
        sessionId,
        scenarioId,
        participantCode,
        status: '참여중',
        isActive: true,
        teamId, // null일 수 있음
      });

      const savedParticipant =
        await this.trainingParticipantRepository.save(newParticipant);
      console.log('✅ 새 참가자 생성 완료:', {
        participantId: savedParticipant.id,
        teamId,
      });

      return savedParticipant.id;
    } catch (error) {
      console.error('❌ 참가자 생성/조회 실패:', error);
      throw error;
    }
  }
}
