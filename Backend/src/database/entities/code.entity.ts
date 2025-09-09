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

@Entity('code')
export class Code {
  @ApiProperty({ description: '코드 ID' })
  @PrimaryGeneratedColumn({ name: 'code_id' })
  id: number;

  @ApiProperty({
    description: '팀 ID (NULL이면 시스템 공통 코드)',
    required: false,
  })
  @Column({ name: 'team_id', nullable: true })
  teamId?: number;

  @ApiProperty({ description: '코드 분류' })
  @Column({ name: 'code_class', length: 100 })
  codeClass: string;

  @ApiProperty({ description: '코드명' })
  @Column({ name: 'code_name', length: 100 })
  codeName: string;

  @ApiProperty({ description: '코드값' })
  @Column({ name: 'code_value', length: 100 })
  codeValue: string;

  @ApiProperty({ description: '코드 설명', required: false })
  @Column({ name: 'code_desc', length: 500, nullable: true })
  codeDesc?: string;

  @ApiProperty({ description: '코드 순서' })
  @Column({ name: 'code_order' })
  codeOrder: number;

  @ApiProperty({ description: '사용 여부' })
  @Column({ name: 'use_yn', length: 1, default: 'Y' })
  useYn: string;

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
  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team?: Team;
}
