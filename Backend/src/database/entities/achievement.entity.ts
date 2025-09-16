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
import { User } from '../../domain/entities/user.entity';
import { Team } from '../../domain/entities/team.entity';

@Entity('achievement')
export class Achievement {
  @ApiProperty({ description: '성취 ID' })
  @PrimaryGeneratedColumn({ name: 'achievement_id' })
  id: number;

  @ApiProperty({ description: '사용자 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '성취명' })
  @Column({ name: 'achievement_name', length: 100 })
  achievementName: string;

  @ApiProperty({ description: '성취 설명', required: false })
  @Column({ name: 'achievement_description', type: 'text', nullable: true })
  achievementDescription?: string;

  @ApiProperty({ description: '성취 유형' })
  @Column({ name: 'achievement_type', length: 50 })
  achievementType: string;

  @ApiProperty({ description: '달성도 (0-100%)' })
  @Column({
    name: 'progress',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.0,
  })
  progress: number;

  @ApiProperty({ description: '완료 여부' })
  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @ApiProperty({ description: '달성일시', required: false })
  @Column({ name: 'unlocked_at', type: 'datetime', nullable: true })
  unlockedAt?: Date;

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
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team: Team;
}
