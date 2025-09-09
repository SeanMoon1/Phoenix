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
import { User } from '../../modules/users/entities/user.entity';
import { Admin } from './admin.entity';

@Entity('inquiry')
export class Inquiry {
  @ApiProperty({ description: '문의 ID' })
  @PrimaryGeneratedColumn({ name: 'inquiry_id' })
  id: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: '사용자 ID' })
  @Column({ name: 'user_id' })
  userId: number;

  @ApiProperty({ description: '문의 코드' })
  @Column({ name: 'inquiry_code', length: 50 })
  inquiryCode: string;

  @ApiProperty({ description: '카테고리' })
  @Column({ name: 'category', length: 100 })
  category: string;

  @ApiProperty({ description: '제목' })
  @Column({ name: 'title', length: 255 })
  title: string;

  @ApiProperty({ description: '내용' })
  @Column({ name: 'content', type: 'text' })
  content: string;

  @ApiProperty({ description: '상태' })
  @Column({ name: 'status', length: 20, default: '접수' })
  status: string;

  @ApiProperty({ description: '관리자 답변', required: false })
  @Column({ name: 'admin_response', type: 'text', nullable: true })
  adminResponse?: string;

  @ApiProperty({ description: '답변일시', required: false })
  @Column({ name: 'responded_at', type: 'datetime', nullable: true })
  respondedAt?: Date;

  @ApiProperty({ description: '답변자 ID', required: false })
  @Column({ name: 'responded_by', nullable: true })
  respondedBy?: number;

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

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Admin)
  @JoinColumn({ name: 'responded_by' })
  responder?: Admin;
}
