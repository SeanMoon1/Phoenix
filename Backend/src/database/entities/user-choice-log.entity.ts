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
import { TrainingResult } from './training-result.entity';
import { ScenarioEvent } from './scenario-event.entity';
import { ChoiceOption } from './choice-option.entity';

@Entity('user_choice_log')
export class UserChoiceLog {
  @ApiProperty({ description: '로그 ID' })
  @PrimaryGeneratedColumn({ name: 'log_id' })
  id: number;

  @ApiProperty({ description: '결과 ID' })
  @Column({ name: 'result_id' })
  resultId: number;

  @ApiProperty({ description: '이벤트 ID' })
  @Column({ name: 'event_id' })
  eventId: number;

  @ApiProperty({ description: '선택지 ID' })
  @Column({ name: 'choice_id' })
  choiceId: number;

  @ApiProperty({ description: '로그 코드' })
  @Column({ name: 'log_code', length: 50 })
  logCode: string;

  @ApiProperty({ description: '응답 시간 (초)' })
  @Column({ name: 'response_time' })
  responseTime: number;

  @ApiProperty({ description: '정답 여부' })
  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @ApiProperty({ description: '선택 시간' })
  @CreateDateColumn({ name: 'selected_at' })
  selectedAt: Date;

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
  @ManyToOne(() => TrainingResult)
  @JoinColumn({ name: 'result_id' })
  result: TrainingResult;

  @ManyToOne(() => ScenarioEvent)
  @JoinColumn({ name: 'event_id' })
  event: ScenarioEvent;

  @ManyToOne(() => ChoiceOption)
  @JoinColumn({ name: 'choice_id' })
  choice: ChoiceOption;
}
