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
import { Team } from '../../modules/teams/entities/team.entity';
import { AdminLevel } from './admin-level.entity';

@Entity('admin')
export class Admin {
  @ApiProperty({ description: '관리자 ID' })
  @PrimaryGeneratedColumn({ name: 'admin_id' })
  id: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '권한 레벨 ID' })
  @Column({ name: 'admin_level_id' })
  adminLevelId: number;

  @ApiProperty({ description: '로그인 ID' })
  @Column({ name: 'login_id', length: 50, unique: true })
  loginId: string;

  @Column({ name: 'password', length: 255 })
  password: string;

  @ApiProperty({ description: '관리자명' })
  @Column({ name: 'name', length: 100 })
  name: string;

  @ApiProperty({ description: '이메일' })
  @Column({ name: 'email', length: 200 })
  email: string;

  @ApiProperty({ description: '연락처' })
  @Column({ name: 'phone', length: 20 })
  phone: string;

  @ApiProperty({ description: '추가 권한 정보 (JSON)', required: false })
  @Column({ name: 'permissions', type: 'text', nullable: true })
  permissions?: string;

  @ApiProperty({ description: '사용 여부' })
  @Column({ name: 'use_yn', length: 1, default: 'Y' })
  useYn: string;

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

  @ManyToOne(() => AdminLevel)
  @JoinColumn({ name: 'admin_level_id' })
  adminLevel: AdminLevel;
}
