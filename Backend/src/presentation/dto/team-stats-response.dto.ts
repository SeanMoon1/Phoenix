import { ApiProperty } from '@nestjs/swagger';

export class TeamStatsResponseDto {
  @ApiProperty({ description: '팀 ID' })
  teamId: number;

  @ApiProperty({ description: '팀명' })
  teamName: string;

  @ApiProperty({ description: '총 세션 수' })
  totalSessions: number;

  @ApiProperty({ description: '진행 중인 세션 수' })
  activeSessions: number;

  @ApiProperty({ description: '총 참가자 수' })
  totalParticipants: number;

  @ApiProperty({ description: '완료한 참가자 수' })
  completedParticipants: number;

  @ApiProperty({ description: '팀원별 상세 통계' })
  memberStats: TeamMemberStatsDto[];
}

export class TeamMemberStatsDto {
  @ApiProperty({ description: '사용자 ID' })
  userId: number;

  @ApiProperty({ description: '사용자명' })
  userName: string;

  @ApiProperty({ description: '사용자 코드' })
  userCode: string;

  @ApiProperty({ description: '총 훈련 횟수' })
  totalTrainings: number;

  @ApiProperty({ description: '총 점수' })
  totalScore: number;

  @ApiProperty({ description: '평균 점수' })
  averageScore: number;

  @ApiProperty({ description: '최고 점수' })
  bestScore: number;

  @ApiProperty({ description: '현재 레벨' })
  currentLevel: number;

  @ApiProperty({ description: '현재 등급' })
  currentTier: string;

  @ApiProperty({ description: '마지막 훈련일시' })
  lastTrainingAt?: Date;
}
