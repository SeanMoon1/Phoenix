import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Admin } from './admin.entity';
import { Scenario } from './scenario.entity';
import { TrainingSession } from './training-session.entity';
import { Code } from './code.entity';
import { Inquiry } from './inquiry.entity';
import { Faq } from './faq.entity';

@Entity('team')
export class Team {
  @ApiProperty({ description: '팀 ID' })
  @PrimaryGeneratedColumn({ name: 'team_id' })
  id: number;

  @ApiProperty({ description: '팀 코드' })
  @Column({ name: 'team_code', length: 50, unique: true })
  teamCode: string;

  @ApiProperty({ description: '팀 이름' })
  @Column({ name: 'team_name', length: 100 })
  teamName: string;

  @ApiProperty({ description: '팀 설명', required: false })
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @ApiProperty({ description: '팀 상태' })
  @Column({ name: 'status', length: 20, default: 'ACTIVE' })
  status: string;

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
  @OneToMany(() => User, (user) => user.team)
  users: User[];

  @OneToMany(() => Admin, (admin) => admin.team)
  admins: Admin[];

  @OneToMany(() => Scenario, (scenario) => scenario.team)
  scenarios: Scenario[];

  @OneToMany(() => TrainingSession, (session) => session.team)
  trainingSessions: TrainingSession[];

  @OneToMany(() => Code, (code) => code.team)
  codes: Code[];

  @OneToMany(() => Inquiry, (inquiry) => inquiry.team)
  inquiries: Inquiry[];

  @OneToMany(() => Faq, (faq) => faq.team)
  faqs: Faq[];
}
