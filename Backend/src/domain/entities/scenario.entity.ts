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
import { Team } from './team.entity';

@Entity('scenario')
export class Scenario {
  @ApiProperty({ description: '시나리오 ID' })
  @PrimaryGeneratedColumn({ name: 'scenario_id' })
  id: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '시나리오 코드' })
  @Column({ name: 'scenario_code', length: 50 })
  scenarioCode: string;

  @ApiProperty({ description: '시나리오 제목' })
  @Column({ name: 'title', length: 255 })
  title: string;

  @ApiProperty({ description: '재난 유형' })
  @Column({ name: 'disaster_type', length: 50 })
  disasterType: string;

  @ApiProperty({ description: '시나리오 설명' })
  @Column({ name: 'description', type: 'text' })
  description: string;

  @ApiProperty({ description: '위험도' })
  @Column({ name: 'risk_level', length: 20 })
  riskLevel: string;

  @ApiProperty({ description: '발생 조건', required: false })
  @Column({ name: 'occurrence_condition', type: 'text', nullable: true })
  occurrenceCondition?: string;

  @ApiProperty({ description: '시나리오 상태' })
  @Column({ name: 'status', length: 20, default: '임시저장' })
  status: string;

  @ApiProperty({ description: '승인 코멘트', required: false })
  @Column({ name: 'approval_comment', type: 'text', nullable: true })
  approvalComment?: string;

  @ApiProperty({ description: '이미지 URL', required: false })
  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl?: string;

  @ApiProperty({ description: '비디오 URL', required: false })
  @Column({ name: 'video_url', length: 500, nullable: true })
  videoUrl?: string;

  @ApiProperty({ description: '생성자 ID' })
  @Column({ name: 'created_by' })
  createdBy: number;

  @ApiProperty({ description: '승인일시', required: false })
  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt?: Date;

  @ApiProperty({ description: '승인자 ID', required: false })
  @Column({ name: 'approved_by', nullable: true })
  approvedBy?: number;

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
}
