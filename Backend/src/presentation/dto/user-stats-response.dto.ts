import { ApiProperty } from '@nestjs/swagger';

export class UserStatsResponseDto {
  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ApiProperty({ description: '사용자명' })
  userName: string;

  @ApiProperty({ description: '팀 ID' })
  teamId: number;

  @ApiProperty({ description: '팀명' })
  teamName: string;

  @ApiProperty({ description: '총 훈련 횟수' })
  totalTrainings: number;

  @ApiProperty({ description: '총 점수' })
  totalScore: number;

  @ApiProperty({ description: '평균 점수' })
  averageScore: number;

  @ApiProperty({ description: '최고 점수' })
  bestScore: number;

  @ApiProperty({ description: '총 소요시간 (초)' })
  totalTimeSpent: number;

  @ApiProperty({ description: '현재 레벨' })
  currentLevel: number;

  @ApiProperty({ description: '현재 경험치' })
  currentExp: number;

  @ApiProperty({ description: '현재 등급' })
  currentTier: string;

  @ApiProperty({ description: '시나리오별 통계' })
  scenarioStats: ScenarioStatsDto[];
}

export class ScenarioStatsDto {
  @ApiProperty({ description: '시나리오 유형' })
  scenarioType: string;

  @ApiProperty({ description: '완료 횟수' })
  completedCount: number;

  @ApiProperty({ description: '총 점수' })
  totalScore: number;

  @ApiProperty({ description: '평균 점수' })
  averageScore: number;

  @ApiProperty({ description: '최고 점수' })
  bestScore: number;

  @ApiProperty({ description: '총 소요시간 (초)' })
  totalTimeSpent: number;

  @ApiProperty({ description: '마지막 완료일시' })
  lastCompletedAt?: Date;
}
