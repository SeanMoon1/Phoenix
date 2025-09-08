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
import { User } from '../../modules/users/entities/user.entity';
import { Team } from '../../modules/teams/entities/team.entity';

@Entity('user_progress')
export class UserProgress {
  @ApiProperty({ description: '진행 상황 ID' })
  @PrimaryGeneratedColumn({ name: 'progress_id' })
  id: number;

  @ApiProperty({ description: '사용자 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '사용자 레벨' })
  @Column({ name: 'user_level', default: 1 })
  userLevel: number;

  @ApiProperty({ description: '사용자 경험치' })
  @Column({ name: 'user_exp', default: 0 })
  userExp: number;

  @ApiProperty({ description: '총점' })
  @Column({ name: 'total_score', default: 0 })
  totalScore: number;

  @ApiProperty({ description: '완료한 시나리오 수' })
  @Column({ name: 'completed_scenarios', default: 0 })
  completedScenarios: number;

  @ApiProperty({ description: '연속 완료 횟수' })
  @Column({ name: 'current_streak', default: 0 })
  currentStreak: number;

  @ApiProperty({ description: '최장 연속 완료 횟수' })
  @Column({ name: 'longest_streak', default: 0 })
  longestStreak: number;

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
