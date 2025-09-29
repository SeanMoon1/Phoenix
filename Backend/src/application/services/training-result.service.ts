import { Injectable, Inject } from '@nestjs/common';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserChoiceLog } from '../../domain/entities/user-choice-log.entity';
import { TrainingParticipant } from '../../domain/entities/training-participant.entity';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { User } from '../../domain/entities/user.entity';
import { Scenario } from '../../domain/entities/scenario.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserExpService } from './user-exp.service';

@Injectable()
export class TrainingResultService {
  constructor(
    @InjectRepository(TrainingResult)
    private readonly trainingResultRepository: Repository<TrainingResult>,
    @InjectRepository(UserChoiceLog)
    private readonly userChoiceLogRepository: Repository<UserChoiceLog>,
    @InjectRepository(TrainingParticipant)
    private readonly trainingParticipantRepository: Repository<TrainingParticipant>,
    private readonly userExpService: UserExpService,
  ) {}

  async createTrainingResult(
    data: Partial<TrainingResult>,
  ): Promise<TrainingResult> {
    try {
      console.log('🔍 훈련 결과 생성 시작:', data);

      // 데이터베이스 연결 상태 확인 (간단한 방식)
      try {
        await this.trainingResultRepository.manager.query('SELECT 1');
        console.log('✅ 데이터베이스 연결 상태 정상');
      } catch (dbError) {
        console.error('❌ 데이터베이스 연결 실패:', dbError);
        console.error('🔧 해결 방법:');
        console.error('1. 로컬 MySQL 데이터베이스가 실행 중인지 확인하세요');
        console.error(
          '2. Database/phoenix_complete_schema.sql 파일을 실행하세요',
        );
        console.error('3. 백엔드 서버의 데이터베이스 연결 설정을 확인하세요');
        throw new Error(
          '데이터베이스 연결에 실패했습니다. 로컬 데이터베이스가 실행 중인지 확인해주세요.',
        );
      }

      // 필수 필드 검증
      if (!data.userId || !data.sessionId || !data.scenarioId) {
        throw new Error(
          '필수 필드가 누락되었습니다: userId, sessionId, scenarioId',
        );
      }

      // participantId가 없으면 자동으로 참가자 생성
      let participantId = data.participantId;
      if (!participantId) {
        participantId = await this.createOrGetParticipant(
          data.userId!,
          data.sessionId!,
          data.scenarioId!,
        );
      }

      // 결과 코드 생성 (이미 있으면 사용, 없으면 생성)
      const resultCode =
        data.resultCode || `RESULT_${Date.now()}_${data.userId}`;

      // 시나리오 타입 정보 가져오기 (Frontend에서 전송된 값 우선 사용)
      let scenarioType = data.scenarioType;
      if (!scenarioType) {
        const scenario = await this.trainingResultRepository.manager.findOne(
          Scenario,
          {
            where: { id: data.scenarioId },
          },
        );
        scenarioType = scenario?.disasterType
          ? scenario.disasterType.toUpperCase()
          : 'UNKNOWN';
      }

      const trainingResult = this.trainingResultRepository.create({
        ...data,
        participantId,
        resultCode,
        scenarioType, // 시나리오 타입 추가
        teamId: null, // 팀 상관없이 훈련 가능
        completedAt: data.completedAt ? new Date(data.completedAt) : new Date(),
        isActive: true,
      });

      // 트랜잭션을 사용하여 훈련 결과 저장과 경험치 업데이트를 함께 처리
      const savedResult =
        await this.trainingResultRepository.manager.transaction(
          async (transactionalEntityManager) => {
            console.log('🔄 트랜잭션 시작 - 훈련 결과 저장 및 경험치 업데이트');

            // 1. 훈련 결과 저장
            const result =
              await transactionalEntityManager.save(trainingResult);
            console.log('✅ 훈련 결과 저장 완료:', result.id);

            // 2. 사용자 경험치 업데이트 (같은 트랜잭션 내에서)
            try {
              // 정답률 기반 경험치 계산 (50점 만점 기준)
              const accuracyPercentage = data.totalScore
                ? (data.totalScore / 50) * 100
                : 0;
              const expToAdd = Math.round(accuracyPercentage * 0.5); // 정답률의 50%를 경험치로

              console.log('🔍 경험치 업데이트 시작:', {
                userId: data.userId,
                expToAdd,
                totalScore: data.totalScore || 0,
                accuracyPercentage,
              });

              // 사용자 조회
              const user = await transactionalEntityManager.findOne(User, {
                where: { id: data.userId! },
              });

              if (!user) {
                throw new Error('사용자를 찾을 수 없습니다.');
              }

              // 현재 경험치에 추가
              const newExp = user.userExp + expToAdd;

              // 레벨 계산
              const { newLevel, remainingExp, tier } =
                this.calculateLevelAndTier(newExp);

              // 다음 레벨까지 필요한 경험치 계산
              const nextLevelExp = this.getExpForNextLevel(newLevel);

              // 레벨 진행도 계산 (0-100%)
              const levelProgress =
                nextLevelExp > 0 ? (remainingExp / nextLevelExp) * 100 : 0;

              // 사용자 정보 업데이트
              await transactionalEntityManager.update(User, data.userId!, {
                userExp: newExp,
                userLevel: newLevel,
                currentTier: tier,
                levelProgress: Math.round(levelProgress * 100) / 100,
                nextLevelExp,
                totalScore: user.totalScore + (data.totalScore || 0),
                completedScenarios: user.completedScenarios + 1,
              });

              console.log('✅ 사용자 경험치 업데이트 완료:', {
                userId: data.userId,
                oldLevel: user.userLevel,
                newLevel,
                oldExp: user.userExp,
                newExp,
                tier,
                expAdded: expToAdd,
              });
            } catch (expError) {
              console.error('❌ 트랜잭션 내 경험치 업데이트 실패:', expError);
              throw expError; // 트랜잭션 롤백을 위해 에러 재발생
            }

            return result;
          },
        );

      return savedResult;
    } catch (error) {
      console.error('❌ 훈련 결과 생성 실패:', {
        error: error.message,
        stack: error.stack,
        data: {
          userId: data.userId,
          sessionId: data.sessionId,
          scenarioId: data.scenarioId,
          participantId: data.participantId,
          totalScore: data.totalScore,
        },
      });
      throw error;
    }
  }

  async getTrainingResultsByUser(userId: number): Promise<TrainingResult[]> {
    try {
      const results = await this.trainingResultRepository.find({
        where: { userId, isActive: true },
        relations: ['session', 'scenario', 'user', 'participant'],
        order: { completedAt: 'DESC' },
      });
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
      const results = await this.trainingResultRepository.find({
        where: { sessionId, isActive: true },
        relations: ['user', 'scenario'],
        order: { completedAt: 'DESC' },
      });
      return results;
    } catch (error) {
      console.error('❌ 세션별 훈련 결과 조회 실패:', error);
      throw error;
    }
  }

  async getTrainingStatistics(userId: number): Promise<any> {
    try {
      const results = await this.trainingResultRepository.find({
        where: { userId, isActive: true },
        relations: ['scenario'],
      });

      if (results.length === 0) {
        return {
          totalTrainings: 0, // 프론트엔드 호환성을 위해 추가
          totalSessions: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0, // 최고 점수 추가
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
        totalTrainings: totalSessions, // 프론트엔드 호환성을 위해 추가
        totalSessions,
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        bestScore: Math.max(...results.map((r) => r.totalScore || 0)), // 최고 점수 추가
        completedScenarios,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        averageSpeed: Math.round(averageSpeed * 100) / 100,
        lastTrainingDate,
      };

      return statistics;
    } catch (error) {
      console.error('❌ 사용자 훈련 통계 조회 실패:', error);
      throw error;
    }
  }

  async getUserChoiceLogs(resultId: number): Promise<UserChoiceLog[]> {
    try {
      const logs = await this.userChoiceLogRepository.find({
        where: { resultId, isActive: true },
        relations: ['event', 'choice'],
        order: { selectedAt: 'ASC' },
      });
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

      // teamId가 없으면 null로 설정 (팀 상관없이 훈련 가능)
      let teamId = session?.teamId || null;

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

  /**
   * 팀별 훈련 결과 조회 (팀 관리자용)
   * @param teamId 팀 ID
   * @returns 팀 훈련 결과 목록
   */
  async getTrainingResultsByTeam(teamId: number): Promise<TrainingResult[]> {
    try {
      // 🚀 최적화: 데이터베이스 레벨에서 필터링
      const results = await this.trainingResultRepository
        .createQueryBuilder('tr')
        .leftJoinAndSelect('tr.session', 'session')
        .leftJoinAndSelect('tr.scenario', 'scenario')
        .leftJoinAndSelect('tr.user', 'user')
        .leftJoinAndSelect('tr.participant', 'participant')
        .where('tr.isActive = :isActive', { isActive: true })
        .andWhere(
          '(user.teamId = :teamId OR session.teamId = :teamId OR participant.teamId = :teamId)',
          { teamId },
        )
        .orderBy('tr.completedAt', 'DESC')
        .limit(1000) // 🚀 결과 수 제한으로 성능 향상
        .getMany();

      return results;
    } catch (error) {
      console.error('❌ 팀별 훈련 결과 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 조회
   * @param userId 사용자 ID
   * @returns 사용자 정보
   */
  async getUserById(userId: number): Promise<any> {
    try {
      const user = await this.trainingResultRepository.manager.findOne(User, {
        where: { id: userId, isActive: true },
      });
      return user;
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 시나리오 타입별 통계 조회
   * @param userId 사용자 ID
   * @returns 시나리오 타입별 통계
   */
  async getScenarioTypeStatistics(userId: number): Promise<any> {
    try {
      console.log('🔍 시나리오 타입별 통계 조회:', { userId });

      const results = await this.trainingResultRepository.find({
        where: { userId, isActive: true },
        relations: ['scenario'],
        order: { completedAt: 'DESC' },
      });

      console.log('🔍 조회된 훈련 결과:', {
        userId,
        resultsCount: results.length,
        results: results.map((r) => ({
          id: r.id,
          scenarioType: r.scenarioType,
          totalScore: r.totalScore,
          accuracyScore: r.accuracyScore,
          speedScore: r.speedScore,
          completionTime: r.completionTime,
          completedAt: r.completedAt,
        })),
      });

      if (results.length === 0) {
        console.log(
          '⚠️ 훈련 결과가 없습니다. 사용자가 훈련을 완료했는지 확인하세요.',
        );
        return [];
      }

      // 시나리오 타입별로 그룹화
      const scenarioTypeMap = new Map<string, any>();

      results.forEach((result) => {
        // 시나리오 타입을 직접 저장된 값으로 사용 (새로운 컬럼 활용)
        const scenarioType =
          result.scenarioType || result.scenario?.disasterType || 'UNKNOWN';

        if (!scenarioTypeMap.has(scenarioType)) {
          scenarioTypeMap.set(scenarioType, {
            scenarioType,
            totalAttempts: 0,
            totalScore: 0,
            totalAccuracy: 0,
            totalSpeed: 0,
            totalTimeSpent: 0,
            bestScore: 0,
            averageScore: 0,
            averageAccuracy: 0,
            averageSpeed: 0,
            averageTimeSpent: 0,
            lastCompletedAt: null,
            scores: [],
            accuracyScores: [],
            speedScores: [],
            timeSpent: [],
          });
        }

        const stats = scenarioTypeMap.get(scenarioType);
        stats.totalAttempts++;
        stats.totalScore += result.totalScore || 0;
        stats.totalAccuracy += result.accuracyScore || 0;
        stats.totalSpeed += result.speedScore || 0;
        stats.totalTimeSpent += result.completionTime || 0;
        stats.bestScore = Math.max(stats.bestScore, result.totalScore || 0);
        stats.lastCompletedAt = result.completedAt;

        // 개별 점수들 저장 (평균 계산용)
        stats.scores.push(result.totalScore || 0);
        stats.accuracyScores.push(result.accuracyScore || 0);
        stats.speedScores.push(result.speedScore || 0);
        stats.timeSpent.push(result.completionTime || 0);
      });

      // 평균 계산
      const scenarioTypeStats = Array.from(scenarioTypeMap.values()).map(
        (stats) => {
          stats.averageScore =
            Math.round((stats.totalScore / stats.totalAttempts) * 100) / 100;
          stats.averageAccuracy =
            Math.round((stats.totalAccuracy / stats.totalAttempts) * 100) / 100;
          stats.averageSpeed =
            Math.round((stats.totalSpeed / stats.totalAttempts) * 100) / 100;
          stats.averageTimeSpent = Math.round(
            stats.totalTimeSpent / stats.totalAttempts,
          );

          // 정확도 계산 (정답률)
          const accuracyRate = stats.averageAccuracy;

          return {
            scenarioType: stats.scenarioType,
            totalAttempts: stats.totalAttempts,
            totalScore: stats.totalScore,
            bestScore: stats.bestScore,
            averageScore: stats.averageScore,
            averageAccuracy: stats.averageAccuracy,
            averageSpeed: stats.averageSpeed,
            averageTimeSpent: stats.averageTimeSpent,
            accuracyRate: Math.round(accuracyRate),
            lastCompletedAt: stats.lastCompletedAt,
          };
        },
      );

      console.log('✅ 시나리오 타입별 통계 조회 완료:', {
        userId,
        scenarioTypes: scenarioTypeStats.length,
        stats: scenarioTypeStats,
      });

      return scenarioTypeStats;
    } catch (error) {
      console.error('❌ 시나리오 타입별 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 점수를 기반으로 경험치 계산
   * @param totalScore 총 점수
   * @returns 계산된 경험치
   */
  private calculateExpFromScore(totalScore: number): number {
    // 기본 경험치: 점수 * 0.5 (최소 10, 최대 100)
    const baseExp = Math.round(totalScore * 0.5);
    return Math.max(10, Math.min(100, baseExp));
  }

  /**
   * 경험치로부터 레벨과 등급 계산
   * @param exp 경험치
   * @returns 레벨, 남은 경험치, 등급
   */
  private calculateLevelAndTier(exp: number): {
    newLevel: number;
    remainingExp: number;
    tier: string;
  } {
    let level = 1;
    let remainingExp = exp;

    // 레벨별 필요 경험치 계산
    while (remainingExp >= this.getExpForNextLevel(level)) {
      remainingExp -= this.getExpForNextLevel(level);
      level++;
    }

    // 등급 계산
    let tier = '초급자';
    if (level >= 20) tier = '전문가';
    else if (level >= 15) tier = '고급자';
    else if (level >= 10) tier = '중급자';
    else if (level >= 5) tier = '숙련자';

    return {
      newLevel: level,
      remainingExp,
      tier,
    };
  }

  /**
   * 팀원별 통계 조회
   * @param teamId 팀 ID
   * @returns 팀원별 통계 데이터
   */
  async getTeamMemberStats(teamId: number): Promise<any[]> {
    try {
      console.log('🔍 팀원별 통계 조회:', { teamId });

      // 팀의 모든 사용자 조회
      const users = await this.trainingResultRepository.manager
        .createQueryBuilder(User, 'user')
        .where('user.teamId = :teamId', { teamId })
        .andWhere('user.isActive = :isActive', { isActive: true })
        .getMany();

      const memberStats = [];

      for (const user of users) {
        // 사용자의 훈련 결과 조회
        const results = await this.trainingResultRepository
          .createQueryBuilder('tr')
          .leftJoinAndSelect('tr.session', 'session')
          .leftJoinAndSelect('tr.scenario', 'scenario')
          .where('tr.userId = :userId', { userId: user.id })
          .andWhere('tr.isActive = :isActive', { isActive: true })
          .orderBy('tr.completedAt', 'DESC')
          .getMany();

        // 통계 계산
        const totalTrainings = results.length;
        const totalScore = results.reduce(
          (sum, result) => sum + (result.totalScore || 0),
          0,
        );
        const averageScore =
          totalTrainings > 0 ? totalScore / totalTrainings : 0;
        const bestScore =
          results.length > 0
            ? Math.max(...results.map((r) => r.totalScore || 0))
            : 0;
        const lastTrainingAt =
          results.length > 0 ? results[0].completedAt : null;

        // 레벨 및 등급 계산 (간단한 로직)
        const currentLevel = Math.floor(totalScore / 1000) + 1;
        const tiers = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
        const currentTier =
          tiers[Math.min(Math.floor(currentLevel / 10), tiers.length - 1)];

        memberStats.push({
          userId: user.id,
          userName: user.name,
          userCode: user.userCode,
          totalTrainings,
          totalScore,
          averageScore: Math.round(averageScore * 100) / 100,
          bestScore,
          currentLevel,
          currentTier,
          lastTrainingAt,
        });
      }

      // 총 점수 기준으로 정렬
      memberStats.sort((a, b) => b.totalScore - a.totalScore);

      console.log('✅ 팀원별 통계 조회 완료:', {
        teamId,
        memberCount: memberStats.length,
      });
      return memberStats;
    } catch (error) {
      console.error('❌ 팀원별 통계 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 다음 레벨까지 필요한 경험치 계산
   * @param level 현재 레벨
   * @returns 필요한 경험치
   */
  private getExpForNextLevel(level: number): number {
    // 레벨이 높아질수록 더 많은 경험치 필요
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }
}
