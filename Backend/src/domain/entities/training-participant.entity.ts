import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { TrainingSession } from './training-session.entity';
import { Team } from './team.entity';
import { Scenario } from './scenario.entity';
import { User } from './user.entity';
import { TrainingResult } from './training-result.entity';

@Entity('training_participant')
export class TrainingParticipant {
  @ApiProperty({ description: '참가자 ID' })
  @PrimaryGeneratedColumn({ name: 'participant_id' })
  id: number;

  @ApiProperty({ description: '세션 ID' })
  @Column({ name: 'session_id' })
  sessionId: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '시나리오 ID' })
  @Column({ name: 'scenario_id' })
  scenarioId: number;

  @ApiProperty({ description: '사용자 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '참가자 코드' })
  @Column({ name: 'participant_code', length: 50 })
  participantCode: string;

  @ApiProperty({ description: '참가 시간' })
  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @ApiProperty({ description: '완료 시간', required: false })
  @Column({ name: 'completed_at', type: 'datetime', nullable: true })
  completedAt?: Date;

  @ApiProperty({ description: '상태' })
  @Column({ name: 'status', length: 20, default: '참여중' })
  status: string;

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
  @ManyToOne(() => TrainingSession)
  @JoinColumn({ name: 'session_id' })
  session: TrainingSession;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => Scenario)
  @JoinColumn({ name: 'scenario_id' })
  scenario: Scenario;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => TrainingResult, (result) => result.participant)
  results: TrainingResult[];
}
