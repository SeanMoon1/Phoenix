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
import { Scenario } from '../../modules/scenarios/entities/scenario.entity';

@Entity('decision_event')
export class DecisionEvent {
  @ApiProperty({ description: '이벤트 ID' })
  @PrimaryGeneratedColumn({ name: 'event_id' })
  id: number;

  @ApiProperty({ description: '시나리오 ID' })
  @Column({ name: 'scenario_id' })
  scenarioId: number;

  @ApiProperty({ description: '이벤트 코드' })
  @Column({ name: 'event_code', length: 50 })
  eventCode: string;

  @ApiProperty({ description: '이벤트 순서' })
  @Column({ name: 'event_order' })
  eventOrder: number;

  @ApiProperty({ description: '이벤트 설명' })
  @Column({ name: 'event_description', type: 'text' })
  eventDescription: string;

  @ApiProperty({ description: '이벤트 유형' })
  @Column({ name: 'event_type', length: 50 })
  eventType: string;

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
  @ManyToOne(() => Scenario)
  @JoinColumn({ name: 'scenario_id' })
  scenario: Scenario;
}
