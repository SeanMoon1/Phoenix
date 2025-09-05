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

@Entity('faq')
export class Faq {
  @ApiProperty({ description: 'FAQ ID' })
  @PrimaryGeneratedColumn({ name: 'faq_id' })
  id: number;

  @ApiProperty({ description: '팀 ID' })
  @Column({ name: 'team_id' })
  teamId: number;

  @ApiProperty({ description: 'FAQ 코드' })
  @Column({ name: 'faq_code', length: 50 })
  faqCode: string;

  @ApiProperty({ description: '카테고리' })
  @Column({ name: 'category', length: 100 })
  category: string;

  @ApiProperty({ description: '질문' })
  @Column({ name: 'question', type: 'text' })
  question: string;

  @ApiProperty({ description: '답변' })
  @Column({ name: 'answer', type: 'text' })
  answer: string;

  @ApiProperty({ description: '정렬 순서' })
  @Column({ name: 'order_num' })
  orderNum: number;

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
}
