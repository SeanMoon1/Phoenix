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
import { ScenarioEvent } from './scenario-event.entity';
import { ScenarioScene } from './scenario-scene.entity';

@Entity('choice_option')
export class ChoiceOption {
  @ApiProperty({ description: '선택지 ID' })
  @PrimaryGeneratedColumn({ name: 'choice_id' })
  id: number;

  @ApiProperty({ description: '이벤트 ID' })
  @Column({ name: 'event_id' })
  eventId: number;

  @ApiProperty({ description: '시나리오 ID' })
  @Column({ name: 'scenario_id' })
  scenarioId: number;

  @ApiProperty({ description: '씬 ID', required: false })
  @Column({ name: 'scene_id', nullable: true })
  sceneId?: number;

  @ApiProperty({ description: '선택지 코드' })
  @Column({ name: 'choice_code', length: 50 })
  choiceCode: string;

  @ApiProperty({ description: '선택지 텍스트' })
  @Column({ name: 'choice_text', length: 500 })
  choiceText: string;

  @ApiProperty({ description: '정답 여부' })
  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @ApiProperty({ description: '속도 점수' })
  @Column({ name: 'speed_points', default: 0 })
  speedPoints: number;

  @ApiProperty({ description: '정확도 점수' })
  @Column({ name: 'accuracy_points', default: 0 })
  accuracyPoints: number;

  @ApiProperty({ description: '경험치 점수' })
  @Column({ name: 'exp_points', default: 0 })
  expPoints: number;

  @ApiProperty({ description: '선택 후 반응 텍스트', required: false })
  @Column({ name: 'reaction_text', type: 'text', nullable: true })
  reactionText?: string;

  @ApiProperty({ description: '다음 씬 코드', required: false })
  @Column({ name: 'next_scene_code', length: 50, nullable: true })
  nextSceneCode?: string;

  @ApiProperty({ description: '점수 가중치' })
  @Column({ name: 'score_weight' })
  scoreWeight: number;

  @ApiProperty({ description: '다음 이벤트 ID', required: false })
  @Column({ name: 'next_event_id', nullable: true })
  nextEventId?: number;

  @ApiProperty({ description: '생성자 ID', required: false })
  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

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
  @ManyToOne(() => ScenarioEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: ScenarioEvent;

  @ManyToOne(() => ScenarioScene, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scene_id' })
  scene?: ScenarioScene;
}
