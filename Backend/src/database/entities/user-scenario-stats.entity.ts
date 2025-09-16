import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../domain/entities/user.entity';
import { Team } from '../../domain/entities/team.entity';

@Entity('user_scenario_stats')
export class UserScenarioStats {
  @ApiProperty({ description: '통계 ID' })
  @PrimaryGeneratedColumn({ name: 'stats_id' })
  id: number;

  @ApiProperty({ description: '사용자 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '시나리오 유형' })
  @Column({ name: 'scenario_type', length: 50 })
  scenarioType: string;

  @ApiProperty({ description: '완료 횟수' })
  @Column({ name: 'completed_count', default: 0 })
  completedCount: number;

  @ApiProperty({ description: '총점' })
  @Column({ name: 'total_score', default: 0 })
  totalScore: number;

  @ApiProperty({ description: '최고점수' })
  @Column({ name: 'best_score', default: 0 })
  bestScore: number;

  @ApiProperty({ description: '평균점수' })
  @Column({
    name: 'average_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  averageScore: number;

  @ApiProperty({ description: '총 소요시간 (초)' })
  @Column({ name: 'total_time_spent', default: 0 })
  totalTimeSpent: number;

  @ApiProperty({ description: '마지막 완료일시', required: false })
  @Column({ name: 'last_completed_at', type: 'datetime', nullable: true })
  lastCompletedAt?: Date;

  @ApiProperty({ description: '수정자 ID', required: false })
  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: number;

  @ApiProperty({ description: '삭제일시', required: false })
  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: '활성화 여부' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: '생성일시' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
