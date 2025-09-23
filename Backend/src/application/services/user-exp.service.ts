import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { UpdateUserExpDto } from '../../presentation/dto/update-user-exp.dto';

@Injectable()
export class UserExpService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 사용자 경험치 및 레벨 업데이트
   * @param updateData 경험치 업데이트 데이터
   * @returns 업데이트된 사용자 정보
   */
  async updateUserExp(updateData: UpdateUserExpDto): Promise<User> {
    try {
      console.log('🔍 사용자 경험치 업데이트 시작:', updateData);

      // 사용자 조회
      const user = await this.userRepository.findOne({
        where: { id: updateData.userId },
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      // 현재 경험치에 추가
      const newExp = user.userExp + updateData.expToAdd;

      // 레벨 계산
      const { newLevel, remainingExp, tier } =
        this.calculateLevelAndTier(newExp);

      // 다음 레벨까지 필요한 경험치 계산
      const nextLevelExp = this.getExpForNextLevel(newLevel);

      // 레벨 진행도 계산 (0-100%)
      const levelProgress =
        nextLevelExp > 0 ? (remainingExp / nextLevelExp) * 100 : 0;

      // 업데이트할 데이터 준비
      const updateFields: Partial<User> = {
        userExp: newExp,
        userLevel: newLevel,
        currentTier: tier,
        levelProgress: Math.round(levelProgress * 100) / 100,
        nextLevelExp,
      };

      // 추가 점수가 있으면 총점 업데이트
      if (updateData.totalScore !== undefined) {
        updateFields.totalScore = user.totalScore + updateData.totalScore;
      }

      // 완료한 시나리오 수 업데이트
      if (updateData.completedScenarios !== undefined) {
        updateFields.completedScenarios =
          user.completedScenarios + updateData.completedScenarios;
      }

      // 사용자 정보 업데이트
      await this.userRepository.update(updateData.userId, updateFields);

      // 업데이트된 사용자 정보 조회
      const updatedUser = await this.userRepository.findOne({
        where: { id: updateData.userId },
      });

      console.log('✅ 사용자 경험치 업데이트 완료:', {
        userId: updateData.userId,
        oldLevel: user.userLevel,
        newLevel: updatedUser?.userLevel,
        oldExp: user.userExp,
        newExp: updatedUser?.userExp,
        tier: updatedUser?.currentTier,
      });

      return updatedUser!;
    } catch (error) {
      console.error('❌ 사용자 경험치 업데이트 실패:', error);
      throw error;
    }
  }

  /**
   * 경험치를 기반으로 레벨과 등급 계산
   * @param totalExp 총 경험치
   * @returns 레벨, 남은 경험치, 등급
   */
  private calculateLevelAndTier(totalExp: number): {
    newLevel: number;
    remainingExp: number;
    tier: string;
  } {
    let level = 1;
    let remainingExp = totalExp;

    // 레벨업 계산 (각 레벨마다 100 * 레벨만큼의 경험치 필요)
    while (remainingExp >= this.getExpForNextLevel(level)) {
      remainingExp -= this.getExpForNextLevel(level);
      level++;
    }

    // 등급 계산
    let tier = '초급자';
    if (level >= 20) tier = '마스터';
    else if (level >= 15) tier = '전문가';
    else if (level >= 10) tier = '고급자';
    else if (level >= 5) tier = '중급자';

    return { newLevel: level, remainingExp, tier };
  }

  /**
   * 다음 레벨까지 필요한 경험치 계산
   * @param level 현재 레벨
   * @returns 다음 레벨까지 필요한 경험치
   */
  private getExpForNextLevel(level: number): number {
    return level * 100;
  }

  /**
   * 사용자 경험치 정보 조회
   * @param userId 사용자 ID
   * @returns 사용자 경험치 정보
   */
  async getUserExpInfo(userId: number): Promise<{
    userLevel: number;
    userExp: number;
    currentTier: string;
    levelProgress: number;
    nextLevelExp: number;
    totalScore: number;
    completedScenarios: number;
  }> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        select: [
          'userLevel',
          'userExp',
          'currentTier',
          'levelProgress',
          'nextLevelExp',
          'totalScore',
          'completedScenarios',
        ],
      });

      if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      return {
        userLevel: user.userLevel,
        userExp: user.userExp,
        currentTier: user.currentTier,
        levelProgress: user.levelProgress,
        nextLevelExp: user.nextLevelExp,
        totalScore: user.totalScore,
        completedScenarios: user.completedScenarios,
      };
    } catch (error) {
      console.error('❌ 사용자 경험치 정보 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 사용자 정보 조회 (팀 확인용)
   * @param userId 사용자 ID
   * @returns 사용자 정보
   */
  async getUserById(userId: number): Promise<any> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId, isActive: true },
        select: ['id', 'teamId', 'name', 'email'],
      });
      return user;
    } catch (error) {
      console.error('❌ 사용자 정보 조회 실패:', error);
      throw error;
    }
  }
}
