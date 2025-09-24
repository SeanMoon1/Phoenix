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
import { User } from './user.entity';
import { TrainingSession } from './training-session.entity';
import { Scenario } from './scenario.entity';
import { TrainingParticipant } from './training-participant.entity';
import { UserChoiceLog } from './user-choice-log.entity';

@Entity('training_result')
export class TrainingResult {
  @ApiProperty({ description: '결과 ID' })
  @PrimaryGeneratedColumn({ name: 'result_id' })
  id: number;

  @ApiProperty({ description: '참가자 ID' })
  @Column({ name: 'participant_id' })
  participantId: number;

  @ApiProperty({ description: '세션 ID' })
  @Column({ name: 'session_id' })
  sessionId: number;

  @ApiProperty({ description: '시나리오 ID' })
  @Column({ name: 'scenario_id' })
  scenarioId: number;

  @ApiProperty({ description: '시나리오 타입' })
  @Column({ name: 'scenario_type', length: 50 })
  scenarioType: string;

  @ApiProperty({ description: '사용자 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '팀 ID', required: false })
  @Column({ name: 'team_id', nullable: true })
  teamId?: number;

  @ApiProperty({ description: '결과 코드' })
  @Column({ name: 'result_code', length: 50 })
  resultCode: string;

  @ApiProperty({ description: '정확도 점수' })
  @Column({ name: 'accuracy_score' })
  accuracyScore: number;

  @ApiProperty({ description: '속도 점수' })
  @Column({ name: 'speed_score' })
  speedScore: number;

  @ApiProperty({ description: '총점' })
  @Column({ name: 'total_score' })
  totalScore: number;

  @ApiProperty({ description: '완료 시간 (초)', required: false })
  @Column({ name: 'completion_time', nullable: true })
  completionTime?: number;

  @ApiProperty({ description: '피드백', required: false })
  @Column({ name: 'feedback', type: 'text', nullable: true })
  feedback?: string;

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

  @ManyToOne(() => TrainingSession)
  @JoinColumn({ name: 'session_id' })
  session: TrainingSession;

  @ManyToOne(() => Scenario)
  @JoinColumn({ name: 'scenario_id' })
  scenario: Scenario;

  @ManyToOne(() => TrainingParticipant)
  @JoinColumn({ name: 'participant_id' })
  participant: TrainingParticipant;

  @OneToMany(() => UserChoiceLog, (log) => log.result)
  choiceLogs: UserChoiceLog[];
}
