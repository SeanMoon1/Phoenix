import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProgress } from '../../database/entities/user-progress.entity';
import { Achievement } from '../../database/entities/achievement.entity';
import { UserScenarioStats } from '../../database/entities/user-scenario-stats.entity';
import { UserLevelHistory } from '../../database/entities/user-level-history.entity';
import { CommonService } from '../common/common.service';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private userProgressRepository: Repository<UserProgress>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserScenarioStats)
    private userScenarioStatsRepository: Repository<UserScenarioStats>,
    @InjectRepository(UserLevelHistory)
    private userLevelHistoryRepository: Repository<UserLevelHistory>,
    private commonService: CommonService,
  ) {}

  // 사용자 진행상황 관리
  async createUserProgress(data: Partial<UserProgress>): Promise<UserProgress> {
    const progress = this.userProgressRepository.create(data);
    return this.userProgressRepository.save(progress);
  }

  async getUserProgress(userId: number): Promise<UserProgress> {
    return this.userProgressRepository.findOne({
      where: { userId, isActive: true },
      relations: ['user', 'team'],
    });
  }

  async updateUserProgress(
    userId: number,
    data: Partial<UserProgress>,
  ): Promise<UserProgress> {
    const progress = await this.userProgressRepository.findOne({
      where: { userId, isActive: true },
    });

    if (!progress) {
      throw new Error('사용자 진행상황을 찾을 수 없습니다.');
    }

    Object.assign(progress, data);
    return this.userProgressRepository.save(progress);
  }

  // 레벨업 시스템
  async addExperience(
    userId: number,
    expGained: number,
    reason?: string,
    scenarioId?: number,
  ): Promise<UserProgress> {
    const progress = await this.getUserProgress(userId);

    if (!progress) {
      throw new Error('사용자 진행상황을 찾을 수 없습니다.');
    }

    const oldLevel = progress.userLevel;
    progress.userExp += expGained;

    // 레벨업 체크
    const requiredExp = this.commonService.calculateExpForLevel(
      progress.userLevel + 1,
    );
    if (progress.userExp >= requiredExp) {
      progress.userLevel += 1;
      progress.userExp -= requiredExp;

      // 레벨업 히스토리 기록
      await this.createLevelHistory(
        userId,
        progress.teamId,
        oldLevel,
        progress.userLevel,
        expGained,
        reason,
        scenarioId,
      );
    }

    return this.userProgressRepository.save(progress);
  }

  async createLevelHistory(
    userId: number,
    teamId: number,
    oldLevel: number,
    newLevel: number,
    expGained: number,
    reason?: string,
    scenarioId?: number,
  ): Promise<UserLevelHistory> {
    const history = this.userLevelHistoryRepository.create({
      userId,
      teamId,
      oldLevel,
      newLevel,
      expGained,
      levelUpReason: reason,
      scenarioId,
      completedAt: new Date(),
    });
    return this.userLevelHistoryRepository.save(history);
  }

  // 성취 시스템
  async createAchievement(data: Partial<Achievement>): Promise<Achievement> {
    const achievement = this.achievementRepository.create(data);
    return this.achievementRepository.save(achievement);
  }

  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return this.achievementRepository.find({
      where: { userId, isActive: true },
      relations: ['user', 'team'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateAchievementProgress(
    userId: number,
    achievementType: string,
    progress: number,
  ): Promise<Achievement> {
    let achievement = await this.achievementRepository.findOne({
      where: { userId, achievementType, isActive: true },
    });

    if (!achievement) {
      achievement = this.achievementRepository.create({
        userId,
        teamId: (await this.getUserProgress(userId)).teamId,
        achievementType,
        progress,
      });
    } else {
      achievement.progress = progress;
      if (progress >= 100 && !achievement.isCompleted) {
        achievement.isCompleted = true;
        achievement.unlockedAt = new Date();
      }
    }

    return this.achievementRepository.save(achievement);
  }

  // 시나리오별 통계
  async updateScenarioStats(
    userId: number,
    teamId: number,
    scenarioType: string,
    score: number,
    timeSpent: number,
  ): Promise<UserScenarioStats> {
    let stats = await this.userScenarioStatsRepository.findOne({
      where: { userId, scenarioType, isActive: true },
    });

    if (!stats) {
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
    } else {
      stats.completedCount += 1;
      stats.totalScore += score;
      stats.bestScore = Math.max(stats.bestScore, score);
      stats.averageScore = stats.totalScore / stats.completedCount;
      stats.totalTimeSpent += timeSpent;
      stats.lastCompletedAt = new Date();
    }

    return this.userScenarioStatsRepository.save(stats);
  }

  async getUserScenarioStats(userId: number): Promise<UserScenarioStats[]> {
    return this.userScenarioStatsRepository.find({
      where: { userId, isActive: true },
      relations: ['user', 'team'],
      order: { lastCompletedAt: 'DESC' },
    });
  }

  async getLevelHistory(userId: number): Promise<UserLevelHistory[]> {
    return this.userLevelHistoryRepository.find({
      where: { userId, isActive: true },
      relations: ['user', 'team', 'scenario'],
      order: { completedAt: 'DESC' },
    });
  }
}
