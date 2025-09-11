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

@Entity('user')
export class User {
  @ApiProperty({ description: '사용자 ID' })
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '사용자 코드' })
  @Column({ name: 'user_code', length: 50 })
  userCode: string;

  @ApiProperty({ description: '로그인 ID' })
  @Column({ name: 'login_id', length: 50, unique: true })
  loginId: string;

  @Column({ name: 'password', length: 255 })
  password: string;

  @ApiProperty({ description: '사용자 이름' })
  @Column({ name: 'name', length: 100 })
  name: string;

  @ApiProperty({ description: '이메일 주소' })
  @Column({ name: 'email', length: 200 })
  email: string;

  // OAuth 관련 필드들
  @ApiProperty({ description: 'OAuth 제공자', required: false })
  @Column({ name: 'oauth_provider', length: 50, nullable: true })
  oauthProvider?: string;

  @ApiProperty({ description: 'OAuth 제공자 사용자 ID', required: false })
  @Column({ name: 'oauth_provider_id', length: 100, nullable: true })
  oauthProviderId?: string;

  @ApiProperty({ description: '프로필 이미지 URL', required: false })
  @Column({ name: 'profile_image_url', length: 500, nullable: true })
  profileImageUrl?: string;

  @ApiProperty({ description: '사용 여부' })
  @Column({ name: 'use_yn', length: 1, default: 'Y' })
  useYn: string;

  // 레벨업 시스템 관련 필드
  @ApiProperty({ description: '사용자 레벨' })
  @Column({ name: 'user_level', default: 1 })
  userLevel: number;

  @ApiProperty({ description: '사용자 경험치' })
  @Column({ name: 'user_exp', default: 0 })
  userExp: number;

  @ApiProperty({ description: '총점' })
  @Column({ name: 'total_score', default: 0 })
  totalScore: number;

  @ApiProperty({ description: '완료한 시나리오 개수' })
  @Column({ name: 'completed_scenarios', default: 0 })
  completedScenarios: number;

  @ApiProperty({ description: '현재 등급' })
  @Column({ name: 'current_tier', length: 20, default: '초급자' })
  currentTier: string;

  @ApiProperty({ description: '현재 레벨에서의 진행도' })
  @Column({
    name: 'level_progress',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.0,
  })
  levelProgress: number;

  @ApiProperty({ description: '다음 레벨까지 필요한 경험치' })
  @Column({ name: 'next_level_exp', default: 100 })
  nextLevelExp: number;

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
