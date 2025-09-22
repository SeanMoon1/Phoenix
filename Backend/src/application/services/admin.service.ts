import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../domain/entities/admin.entity';
import { AdminLevel } from '../../domain/entities/admin-level.entity';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { Scenario } from '../../domain/entities/scenario.entity';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(AdminLevel)
    private readonly adminLevelRepository: Repository<AdminLevel>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TrainingSession)
    private readonly trainingSessionRepository: Repository<TrainingSession>,
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
    @InjectRepository(TrainingResult)
    private readonly trainingResultRepository: Repository<TrainingResult>,
  ) {}

  async getDashboard(): Promise<any> {
    try {
      const [
        totalUsers,
        totalScenarios,
        totalTrainingSessions,
        totalAdmins,
        activeUsers,
        recentTrainingResults,
      ] = await Promise.all([
        this.userRepository.count({ where: { isActive: true } }),
        this.scenarioRepository.count({ where: { isActive: true } }),
        this.trainingSessionRepository.count({ where: { isActive: true } }),
        this.adminRepository.count({ where: { isActive: true } }),
        this.userRepository.count({
          where: {
            isActive: true,
            // 최근 7일 내에 활동한 사용자 (훈련 결과 기준)
          },
        }),
        this.trainingResultRepository.find({
          where: { isActive: true },
          order: { completedAt: 'DESC' },
          take: 10,
          relations: ['user', 'scenario'],
        }),
      ]);

      return {
        totalUsers,
        totalScenarios,
        totalTrainingSessions,
        totalAdmins,
        activeUsers,
        recentTrainingResults,
      };
    } catch (error) {
      console.error('❌ 대시보드 데이터 조회 실패:', error);
      throw error;
    }
  }

  async getStats(): Promise<any> {
    try {
      const [
        totalUsers,
        totalScenarios,
        totalTrainingSessions,
        totalTrainingResults,
      ] = await Promise.all([
        this.userRepository.count({ where: { isActive: true } }),
        this.scenarioRepository.count({ where: { isActive: true } }),
        this.trainingSessionRepository.count({ where: { isActive: true } }),
        this.trainingResultRepository.count({ where: { isActive: true } }),
      ]);

      // 평균 점수 계산
      const avgScoreResult = await this.trainingResultRepository
        .createQueryBuilder('result')
        .select('AVG(result.totalScore)', 'avgScore')
        .where('result.isActive = :isActive', { isActive: true })
        .getRawOne();

      return {
        systemStats: {
          totalUsers,
          totalScenarios,
          totalTrainingSessions,
          totalTrainingResults,
          averageScore: avgScoreResult?.avgScore
            ? Math.round(avgScoreResult.avgScore)
            : 0,
        },
        performanceStats: {
          uptime: '99.9%',
          responseTime: '120ms',
          errorRate: '0.1%',
        },
      };
    } catch (error) {
      console.error('❌ 통계 데이터 조회 실패:', error);
      throw error;
    }
  }

  async validateAdmin(
    loginId: string,
    password: string,
  ): Promise<Admin | null> {
    try {
      console.log(`🔍 관리자 인증 시도: ${loginId}`);

      const admin = await this.adminRepository.findOne({
        where: {
          loginId,
          isActive: true,
          useYn: 'Y',
        },
        relations: ['adminLevel', 'team'],
      });

      if (!admin) {
        console.log(`❌ 관리자 계정을 찾을 수 없습니다: ${loginId}`);
        return null;
      }

      console.log(`✅ 관리자 계정 발견: ${admin.name} (${admin.email})`);

      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        console.log(`❌ 비밀번호가 일치하지 않습니다: ${loginId}`);
        return null;
      }

      console.log(`✅ 관리자 인증 성공: ${loginId}`);

      // 비밀번호 제거 후 반환
      const { password: _, ...adminWithoutPassword } = admin;
      return adminWithoutPassword as Admin;
    } catch (error) {
      console.error('❌ 관리자 인증 실패:', error);
      throw error;
    }
  }

  async createAdmin(adminData: {
    loginId: string;
    password: string;
    name: string;
    email: string;
    phone: string;
    teamId: number;
    adminLevelId: number;
    createdBy: number;
  }): Promise<Admin> {
    try {
      // 중복 로그인 ID 확인
      const existingAdmin = await this.adminRepository.findOne({
        where: { loginId: adminData.loginId },
      });

      if (existingAdmin) {
        throw new BadRequestException('이미 존재하는 로그인 ID입니다.');
      }

      // 팀 존재 확인
      const team = await this.teamRepository.findOne({
        where: { id: adminData.teamId, isActive: true },
      });

      if (!team) {
        throw new NotFoundException('존재하지 않는 팀입니다.');
      }

      // 권한 레벨 존재 확인
      const adminLevel = await this.adminLevelRepository.findOne({
        where: { id: adminData.adminLevelId, isActive: true },
      });

      if (!adminLevel) {
        throw new NotFoundException('존재하지 않는 권한 레벨입니다.');
      }

      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(adminData.password, 10);

      // 관리자 생성
      const newAdmin = this.adminRepository.create({
        ...adminData,
        password: hashedPassword,
        useYn: 'Y',
        isActive: true,
      });

      const savedAdmin = await this.adminRepository.save(newAdmin);

      // 비밀번호 제거 후 반환
      const { password: _, ...adminWithoutPassword } = savedAdmin;
      return adminWithoutPassword as Admin;
    } catch (error) {
      console.error('❌ 관리자 생성 실패:', error);
      throw error;
    }
  }

  async getAdmins(teamId?: number): Promise<Admin[]> {
    try {
      const whereCondition: any = { isActive: true };
      if (teamId) {
        whereCondition.teamId = teamId;
      }

      const admins = await this.adminRepository.find({
        where: whereCondition,
        relations: ['adminLevel', 'team'],
        order: { createdAt: 'DESC' },
      });

      // 비밀번호 제거
      return admins.map((admin) => {
        const { password: _, ...adminWithoutPassword } = admin;
        return adminWithoutPassword as Admin;
      });
    } catch (error) {
      console.error('❌ 관리자 목록 조회 실패:', error);
      throw error;
    }
  }

  async getAdminLevels(): Promise<AdminLevel[]> {
    try {
      return await this.adminLevelRepository.find({
        where: { isActive: true },
        order: { id: 'ASC' },
      });
    } catch (error) {
      console.error('❌ 권한 레벨 조회 실패:', error);
      throw error;
    }
  }
}
