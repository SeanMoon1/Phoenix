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
import { DecisionEvent } from './decision-event.entity';
import { Scenario } from '../../modules/scenarios/entities/scenario.entity';

@Entity('choice_option')
export class ChoiceOption {
  @ApiProperty({ description: '선택지 ID' })
  @PrimaryGeneratedColumn({ name: 'choice_id' })
  id: number;

  @ApiProperty({ description: '이벤트 ID' })
  @Column({ name: 'event_id' })
  eventId: number;

  @ApiProperty({ description: '시나리오 코드' })
  @Column({ name: 'scenario_code', length: 50 })
  scenarioCode: string;

  @ApiProperty({ description: '선택지 코드' })
  @Column({ name: 'choice_code', length: 50 })
  choiceCode: string;

  @ApiProperty({ description: '선택지 텍스트' })
  @Column({ name: 'choice_text', length: 500 })
  choiceText: string;

  @ApiProperty({ description: '정답 여부' })
  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @ApiProperty({ description: '점수 가중치' })
  @Column({ name: 'score_weight' })
  scoreWeight: number;

  @ApiProperty({ description: '다음 이벤트 ID', required: false })
  @Column({ name: 'next_event_id', nullable: true })
  nextEventId?: number;

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
  @ManyToOne(() => DecisionEvent)
  @JoinColumn({ name: 'event_id' })
  event: DecisionEvent;

  @ManyToOne(() => Scenario)
  @JoinColumn({ name: 'scenario_code' })
  scenario: Scenario;

  @ManyToOne(() => DecisionEvent)
  @JoinColumn({ name: 'next_event_id' })
  nextEvent?: DecisionEvent;
}
