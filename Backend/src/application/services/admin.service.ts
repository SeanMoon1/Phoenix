import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../domain/entities/admin.entity';
import { User } from '../../domain/entities/user.entity';
import { TrainingResultService } from './training-result.service';
import { TeamStatsResponseDto } from '../../presentation/dto/team-stats-response.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private trainingResultService: TrainingResultService,
  ) {}

  async findByLoginId(loginId: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      where: { loginId, isActive: true },
      relations: ['team'],
    });

    if (!admin) {
      throw new NotFoundException(
        `로그인 ID '${loginId}'에 해당하는 관리자를 찾을 수 없습니다.`,
      );
    }

    return admin;
  }

  async findByTeamId(teamId: number): Promise<Admin[]> {
    return this.adminRepository.find({
      where: { teamId, isActive: true },
      relations: ['team'],
    });
  }

  // 팀원 관리 기능들
  async getTeamMembers(teamId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { teamId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getTeamMemberById(teamId: number, userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, teamId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException(
        `팀 ID ${teamId}에서 사용자 ID ${userId}를 찾을 수 없습니다.`,
      );
    }

    return user;
  }

  async updateTeamMember(
    teamId: number,
    userId: number,
    updateData: Partial<User>,
  ): Promise<User> {
    const user = await this.getTeamMemberById(teamId, userId);
    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async deactivateTeamMember(teamId: number, userId: number): Promise<void> {
    const user = await this.getTeamMemberById(teamId, userId);
    user.isActive = false;
    user.deletedAt = new Date();
    await this.userRepository.save(user);
  }

  async getTeamStats(teamId: number) {
    const totalMembers = await this.userRepository.count({
      where: { teamId, isActive: true },
    });

    const activeMembers = await this.userRepository.count({
      where: { teamId, isActive: true, useYn: 'Y' },
    });

    const completedScenarios = await this.userRepository
      .createQueryBuilder('user')
      .select('SUM(user.completedScenarios)', 'total')
      .where('user.teamId = :teamId', { teamId })
      .andWhere('user.isActive = true')
      .getRawOne();

    return {
      totalMembers,
      activeMembers,
      totalCompletedScenarios: (() => {
        const parsed = parseInt(completedScenarios.total, 10);
        return isNaN(parsed) ? 0 : parsed;
      })(),
    };
  }

  async getTeamMemberStats(teamId: number): Promise<TeamStatsResponseDto> {
    return this.trainingResultService.getTeamStats(teamId);
  }
}
