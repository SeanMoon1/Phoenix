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
import { Scenario } from '../../domain/entities/scenario.entity';

@Entity('user_level_history')
export class UserLevelHistory {
  @ApiProperty({ description: '히스토리 ID' })
  @PrimaryGeneratedColumn({ name: 'history_id' })
  id: number;

  @ApiProperty({ description: '사용자 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '이전 레벨' })
  @Column({ name: 'old_level' })
  oldLevel: number;

  @ApiProperty({ description: '새로운 레벨' })
  @Column({ name: 'new_level' })
  newLevel: number;

  @ApiProperty({ description: '획득한 경험치' })
  @Column({ name: 'exp_gained' })
  expGained: number;

  @ApiProperty({ description: '레벨업 사유', required: false })
  @Column({ name: 'level_up_reason', length: 200, nullable: true })
  levelUpReason?: string;

  @ApiProperty({ description: '관련 시나리오 ID', required: false })
  @Column({ name: 'scenario_id', nullable: true })
  scenarioId?: number;

  @ApiProperty({ description: '완료일시' })
  @Column({ name: 'completed_at', type: 'datetime' })
  completedAt: Date;

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

  @ManyToOne(() => Scenario)
  @JoinColumn({ name: 'scenario_id' })
  scenario?: Scenario;
}
