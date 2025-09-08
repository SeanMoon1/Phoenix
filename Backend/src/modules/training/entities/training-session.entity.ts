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
import { Team } from '../../teams/entities/team.entity';
import { Scenario } from '../../scenarios/entities/scenario.entity';

@Entity('training_session')
export class TrainingSession {
  @ApiProperty({ description: '세션 ID' })
  @PrimaryGeneratedColumn({ name: 'session_id' })
  id: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '시나리오 ID' })
  @Column({ name: 'scenario_id' })
  scenarioId: number;

  @ApiProperty({ description: '세션 코드' })
  @Column({ name: 'session_code', length: 50 })
  sessionCode: string;

  @ApiProperty({ description: '세션명' })
  @Column({ name: 'session_name', length: 255 })
  sessionName: string;

  @ApiProperty({ description: '시작 시간' })
  @Column({ name: 'start_time', type: 'datetime' })
  startTime: Date;

  @ApiProperty({ description: '종료 시간', required: false })
  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime?: Date;

  @ApiProperty({ description: '최대 참가자 수', required: false })
  @Column({ name: 'max_participants', nullable: true })
  maxParticipants?: number;

  @ApiProperty({ description: '상태' })
  @Column({ name: 'status', length: 20, default: '준비중' })
  status: string;

  @ApiProperty({ description: '생성자 ID' })
  @Column({ name: 'created_by' })
  createdBy: number;

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
  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => Scenario)
  @JoinColumn({ name: 'scenario_id' })
  scenario: Scenario;
}
