import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id: number;

  @Column({ name: 'team_id', nullable: true })
  teamId?: number;

  @Column({ name: 'user_code', length: 50, nullable: true })
  userCode?: string;

  @Column({ name: 'login_id', length: 50, unique: true })
  loginId: string;

  @Column({ name: 'password', length: 255 })
  password: string;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Column({ name: 'email', length: 200 })
  email: string;

  @Column({ name: 'oauth_provider', length: 50, nullable: true })
  oauthProvider?: string;

  @Column({ name: 'oauth_provider_id', length: 100, nullable: true })
  oauthProviderId?: string;

  @Column({ name: 'profile_image_url', length: 500, nullable: true })
  profileImageUrl?: string;

  @Column({ name: 'use_yn', length: 1, default: 'Y' })
  useYn: string;

  @Column({ name: 'user_level', default: 1 })
  userLevel: number;

  @Column({ name: 'user_exp', default: 0 })
  userExp: number;

  @Column({ name: 'total_score', default: 0 })
  totalScore: number;

  @Column({ name: 'completed_scenarios', default: 0 })
  completedScenarios: number;

  @Column({ name: 'current_tier', length: 20, default: 'BRONZE' })
  currentTier: string;

  @Column({
    name: 'level_progress',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.0,
  })
  levelProgress: number;

  @Column({ name: 'next_level_exp', default: 100 })
  nextLevelExp: number;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: number;

  @Column({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
