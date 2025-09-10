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

  @ApiProperty({ description: '참가일시' })
  @Column({ name: 'joined_at', type: 'datetime' })
  joinedAt: Date;

  @ApiProperty({ description: '상태' })
  @Column({ name: 'status', length: 20, default: '참여중' })
  status: string;

  @ApiProperty({ description: '활성화 여부' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ description: '생성일시' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
