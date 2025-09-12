import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserScenarioStats } from '../../domain/entities/user-scenario-stats.entity';
import { User } from '../../domain/entities/user.entity';
import { Team } from '../../domain/entities/team.entity';
import { CreateTrainingResultDto } from '../../presentation/dto/create-training-result.dto';
import {
  UserStatsResponseDto,
  ScenarioStatsDto,
} from '../../presentation/dto/user-stats-response.dto';
import {
  TeamStatsResponseDto,
  TeamMemberStatsDto,
} from '../../presentation/dto/team-stats-response.dto';

@Injectable()
export class TrainingResultService {
  constructor(
    @InjectRepository(TrainingResult)
    private trainingResultRepository: Repository<TrainingResult>,
    @InjectRepository(UserScenarioStats)
    private userScenarioStatsRepository: Repository<UserScenarioStats>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  /**
   * 훈련 결과 저장
   */
  async createTrainingResult(
    createTrainingResultDto: CreateTrainingResultDto,
  ): Promise<TrainingResult> {
    // 사용자 존재 확인
    const user = await this.userRepository.findOne({
      where: { id: createTrainingResultDto.userId, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 훈련 결과 저장
    const trainingResult = this.trainingResultRepository.create({
      ...createTrainingResultDto,
      completedAt: new Date(createTrainingResultDto.completedAt),
    });

    const savedResult =
      await this.trainingResultRepository.save(trainingResult);

    // 사용자 시나리오 통계 업데이트
    await this.updateUserScenarioStats(
      createTrainingResultDto.userId,
      user.teamId,
      createTrainingResultDto.scenarioId,
      createTrainingResultDto.totalScore,
      createTrainingResultDto.completionTime || 0,
    );

    // 사용자 전체 통계 업데이트
    await this.updateUserOverallStats(
      createTrainingResultDto.userId,
      createTrainingResultDto.totalScore,
    );

    return savedResult;
  }

  /**
   * 사용자 시나리오별 통계 업데이트
   */
  private async updateUserScenarioStats(
    userId: number,
    teamId: number,
    scenarioId: number,
    score: number,
    timeSpent: number,
  ): Promise<void> {
    // 시나리오 유형 가져오기 (실제로는 시나리오 테이블에서 조회해야 함)
    const scenarioType = 'fire'; // 임시로 고정, 실제로는 시나리오 테이블에서 조회

    // 기존 통계 조회
    let stats = await this.userScenarioStatsRepository.findOne({
      where: { userId, scenarioType, isActive: true },
    });

    if (stats) {
      // 기존 통계 업데이트
      stats.completedCount += 1;
      stats.totalScore += score;
      stats.bestScore = Math.max(stats.bestScore, score);
      stats.averageScore = stats.totalScore / stats.completedCount;
      stats.totalTimeSpent += timeSpent;
      stats.lastCompletedAt = new Date();
    } else {
      // 새 통계 생성
      stats = this.userScenarioStatsRepository.create({
        userId,
        teamId,
        scenarioType,
        completedCount: 1,
        totalScore: score,
        bestScore: score,
        averageScore: score,
        totalTimeSpent: timeSpent,
        lastCompletedAt: new Date(),
      });
    }

    await this.userScenarioStatsRepository.save(stats);
  }

  /**
   * 사용자 전체 통계 업데이트
   */
  private async updateUserOverallStats(
    userId: number,
    score: number,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (user) {
      // 경험치 계산 (점수 기반)
      const expGained = Math.floor(score / 10); // 점수 10당 경험치 1
      const newExp = (user.userExp || 0) + expGained;

      // 레벨 계산 (1000 경험치당 1레벨)
      const newLevel = Math.floor(newExp / 1000) + 1;

      // 등급 계산
      let newTier = '초급자';
      if (newLevel >= 20) newTier = '마스터';
      else if (newLevel >= 15) newTier = '전문가';
      else if (newLevel >= 10) newTier = '고급자';
      else if (newLevel >= 5) newTier = '중급자';

      // 사용자 정보 업데이트
      user.userExp = newExp;
      user.userLevel = newLevel;
      user.currentTier = newTier;
      user.totalScore = (user.totalScore || 0) + score;
      user.completedScenarios = (user.completedScenarios || 0) + 1;

      await this.userRepository.save(user);
    }
  }

  /**
   * 사용자 개인 통계 조회
   */
  async getUserStats(userId: number): Promise<UserStatsResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['team'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 시나리오별 통계 조회
    const scenarioStats = await this.userScenarioStatsRepository.find({
      where: { userId, isActive: true },
      order: { lastCompletedAt: 'DESC' },
    });

    // 전체 통계 계산
    const totalTrainings = scenarioStats.reduce(
      (sum, stat) => sum + stat.completedCount,
      0,
    );
    const totalScore = scenarioStats.reduce(
      (sum, stat) => sum + stat.totalScore,
      0,
    );
    const totalTimeSpent = scenarioStats.reduce(
      (sum, stat) => sum + stat.totalTimeSpent,
      0,
    );

    const scenarioStatsDto: ScenarioStatsDto[] = scenarioStats.map((stat) => ({
      scenarioType: stat.scenarioType,
      completedCount: stat.completedCount,
      totalScore: stat.totalScore,
      averageScore: stat.averageScore,
      bestScore: stat.bestScore,
      totalTimeSpent: stat.totalTimeSpent,
      lastCompletedAt: stat.lastCompletedAt,
    }));

    return {
      userId: user.id,
      userName: user.name,
      teamId: user.teamId,
      teamName: user.team?.teamName || '',
      totalTrainings,
      totalScore,
      averageScore: totalTrainings > 0 ? totalScore / totalTrainings : 0,
      bestScore: Math.max(...scenarioStats.map((s) => s.bestScore), 0),
      totalTimeSpent,
      currentLevel: user.userLevel,
      currentExp: user.userExp || 0,
      currentTier: user.currentTier,
      scenarioStats: scenarioStatsDto,
    };
  }

  /**
   * 팀 통계 조회 (관리자용)
   */
  async getTeamStats(teamId: number): Promise<TeamStatsResponseDto> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, isActive: true },
    });

    if (!team) {
      throw new NotFoundException('팀을 찾을 수 없습니다.');
    }

    // 팀원 목록 조회
    const teamMembers = await this.userRepository.find({
      where: { teamId, isActive: true },
      relations: ['team'],
    });

    // 팀원별 통계 조회
    const memberStats: TeamMemberStatsDto[] = [];
    for (const member of teamMembers) {
      const scenarioStats = await this.userScenarioStatsRepository.find({
        where: { userId: member.id, isActive: true },
      });

      const totalTrainings = scenarioStats.reduce(
        (sum, stat) => sum + stat.completedCount,
        0,
      );
      const totalScore = scenarioStats.reduce(
        (sum, stat) => sum + stat.totalScore,
        0,
      );
      const bestScore = Math.max(...scenarioStats.map((s) => s.bestScore), 0);

      memberStats.push({
        userId: member.id,
        userName: member.name,
        userCode: member.userCode || '',
        totalTrainings,
        totalScore,
        averageScore: totalTrainings > 0 ? totalScore / totalTrainings : 0,
        bestScore,
        currentLevel: member.userLevel,
        currentTier: member.currentTier,
        lastTrainingAt:
          scenarioStats.length > 0
            ? scenarioStats.sort(
                (a, b) =>
                  new Date(b.lastCompletedAt || 0).getTime() -
                  new Date(a.lastCompletedAt || 0).getTime(),
              )[0].lastCompletedAt
            : undefined,
      });
    }

    // 팀 전체 통계 계산
    const totalSessions = 0; // 실제로는 training_session 테이블에서 조회
    const activeSessions = 0; // 실제로는 training_session 테이블에서 조회
    const totalParticipants = teamMembers.length;
    const completedParticipants = memberStats.filter(
      (member) => member.totalTrainings > 0,
    ).length;

    return {
      teamId: team.id,
      teamName: team.teamName,
      totalSessions,
      activeSessions,
      totalParticipants,
      completedParticipants,
      memberStats: memberStats.sort((a, b) => b.totalScore - a.totalScore),
    };
  }

  /**
   * 사용자 훈련 기록 조회
   */
  async getUserTrainingHistory(
    userId: number,
    limit: number = 20,
    offset: number = 0,
  ): Promise<TrainingResult[]> {
    return this.trainingResultRepository.find({
      where: { userId, isActive: true },
      relations: ['scenario', 'session'],
      order: { completedAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
