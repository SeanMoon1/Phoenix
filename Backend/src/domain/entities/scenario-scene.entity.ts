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
import { Scenario } from './scenario.entity';
import { ChoiceOption } from './choice-option.entity';

@Entity('scenario_scene')
export class ScenarioScene {
  @ApiProperty({ description: '씬 ID' })
  @PrimaryGeneratedColumn({ name: 'scene_id' })
  id: number;

  @ApiProperty({ description: '시나리오 ID' })
  @Column({ name: 'scenario_id' })
  scenarioId: number;

  @ApiProperty({ description: '씬 코드' })
  @Column({ name: 'scene_code', length: 50 })
  sceneCode: string;

  @ApiProperty({ description: '씬 순서' })
  @Column({ name: 'scene_order' })
  sceneOrder: number;

  @ApiProperty({ description: '씬 제목' })
  @Column({ name: 'title', length: 255 })
  title: string;

  @ApiProperty({ description: '씬 내용' })
  @Column({ name: 'content', type: 'text' })
  content: string;

  @ApiProperty({ description: '씬 스크립트' })
  @Column({ name: 'scene_script', type: 'text' })
  sceneScript: string;

  @ApiProperty({ description: '씬 이미지 URL', required: false })
  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @ApiProperty({ description: '씬 비디오 URL', required: false })
  @Column({ name: 'video_url', length: 500, nullable: true })
  videoUrl?: string;

  @ApiProperty({ description: '예상 소요 시간 (초)', required: false })
  @Column({ name: 'estimated_time', nullable: true })
  estimatedTime?: number;

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
  @ManyToOne(() => Scenario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'scenario_id' })
  scenario: Scenario;

  @OneToMany(() => ChoiceOption, (choice) => choice.scene)
  choices: ChoiceOption[];
}
