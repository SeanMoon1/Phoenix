import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('admin_level')
export class AdminLevel {
  @ApiProperty({ description: '권한 레벨 ID' })
  @PrimaryGeneratedColumn({ name: 'level_id' })
  id: number;

  @ApiProperty({ description: '권한 레벨명' })
  @Column({ name: 'level_name', length: 50 })
  levelName: string;

  @ApiProperty({ description: '권한 레벨 코드' })
  @Column({ name: 'level_code', length: 20, unique: true })
  levelCode: string;

  @ApiProperty({ description: '권한 설명', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: '팀 관리 가능 여부' })
  @Column({ name: 'can_manage_team', default: false })
  canManageTeam: boolean;

  @ApiProperty({ description: '사용자 관리 가능 여부' })
  @Column({ name: 'can_manage_users', default: false })
  canManageUsers: boolean;

  @ApiProperty({ description: '시나리오 관리 가능 여부' })
  @Column({ name: 'can_manage_scenarios', default: false })
  canManageScenarios: boolean;

  @ApiProperty({ description: '시나리오 승인 가능 여부' })
  @Column({ name: 'can_approve_scenarios', default: false })
  canApproveScenarios: boolean;

  @ApiProperty({ description: '결과 조회 가능 여부' })
  @Column({ name: 'can_view_results', default: false })
  canViewResults: boolean;

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
}
