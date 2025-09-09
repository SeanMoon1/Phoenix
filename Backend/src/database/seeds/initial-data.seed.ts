import { DataSource } from 'typeorm';
import { AdminLevel } from '../entities/admin-level.entity';
import { Code } from '../entities/code.entity';
import { Team } from '../../modules/teams/entities/team.entity';
import { Admin } from '../entities/admin.entity';
import { User } from '../../modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

export class InitialDataSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 초기 데이터 시드 시작...');

    // 1. 권한 레벨 데이터 삽입
    await this.seedAdminLevels();

    // 2. 시스템 공통 코드 삽입
    await this.seedSystemCodes();

    // 3. 기본 팀 생성
    const team = await this.seedDefaultTeam();

    // 4. 기본 관리자 생성
    await this.seedDefaultAdmin(team.id);

    // 5. 테스트 사용자 생성
    await this.seedTestUsers(team.id);

    console.log('✅ 초기 데이터 시드 완료!');
  }

  private async seedAdminLevels(): Promise<void> {
    const adminLevelRepository = this.dataSource.getRepository(AdminLevel);

    const adminLevels = [
      {
        levelName: '팀관리자',
        levelCode: 'TEAM_ADMIN',
        description: '팀 전체 관리자',
        canManageTeam: true,
        canManageUsers: true,
        canManageScenarios: true,
        canApproveScenarios: true,
        canViewResults: true,
      },
      {
        levelName: '팀운영자',
        levelCode: 'TEAM_OPERATOR',
        description: '팀 운영자',
        canManageTeam: false,
        canManageUsers: true,
        canManageScenarios: true,
        canApproveScenarios: false,
        canViewResults: true,
      },
      {
        levelName: '일반사용자',
        levelCode: 'GENERAL_USER',
        description: '일반 사용자',
        canManageTeam: false,
        canManageUsers: false,
        canManageScenarios: false,
        canApproveScenarios: false,
        canViewResults: false,
      },
    ];

    for (const levelData of adminLevels) {
      const existingLevel = await adminLevelRepository.findOne({
        where: { levelCode: levelData.levelCode },
      });

      if (!existingLevel) {
        const adminLevel = adminLevelRepository.create(levelData);
        await adminLevelRepository.save(adminLevel);
        console.log(`✅ 권한 레벨 생성: ${levelData.levelName}`);
      }
    }
  }

  private async seedSystemCodes(): Promise<void> {
    const codeRepository = this.dataSource.getRepository(Code);

    const systemCodes = [
      // 재난 유형
      {
        codeClass: 'DISASTER_TYPE',
        codeName: '화재',
        codeValue: 'FIRE',
        codeDesc: '화재 재난',
        codeOrder: 1,
      },
      {
        codeClass: 'DISASTER_TYPE',
        codeName: '지진',
        codeValue: 'EARTHQUAKE',
        codeDesc: '지진 재난',
        codeOrder: 2,
      },
      {
        codeClass: 'DISASTER_TYPE',
        codeName: '응급처치',
        codeValue: 'EMERGENCY',
        codeDesc: '응급처치 상황',
        codeOrder: 3,
      },
      {
        codeClass: 'DISASTER_TYPE',
        codeName: '침수홍수',
        codeValue: 'FLOOD',
        codeDesc: '침수 및 홍수',
        codeOrder: 4,
      },
      {
        codeClass: 'DISASTER_TYPE',
        codeName: '교통사고',
        codeValue: 'TRAFFIC',
        codeDesc: '교통사고 대응',
        codeOrder: 5,
      },

      // 위험도
      {
        codeClass: 'RISK_LEVEL',
        codeName: '낮음',
        codeValue: 'LOW',
        codeDesc: '위험도 낮음',
        codeOrder: 1,
      },
      {
        codeClass: 'RISK_LEVEL',
        codeName: '보통',
        codeValue: 'MEDIUM',
        codeDesc: '위험도 보통',
        codeOrder: 2,
      },
      {
        codeClass: 'RISK_LEVEL',
        codeName: '높음',
        codeValue: 'HIGH',
        codeDesc: '위험도 높음',
        codeOrder: 3,
      },
      {
        codeClass: 'RISK_LEVEL',
        codeName: '매우높음',
        codeValue: 'VERY_HIGH',
        codeDesc: '위험도 매우 높음',
        codeOrder: 4,
      },

      // 이벤트 유형
      {
        codeClass: 'EVENT_TYPE',
        codeName: '선택형',
        codeValue: 'CHOICE',
        codeDesc: '선택형 이벤트',
        codeOrder: 1,
      },
      {
        codeClass: 'EVENT_TYPE',
        codeName: '순차형',
        codeValue: 'SEQUENTIAL',
        codeDesc: '순차형 이벤트',
        codeOrder: 2,
      },

      // 문의 카테고리
      {
        codeClass: 'INQUIRY_CATEGORY',
        codeName: '기술지원',
        codeValue: 'TECHNICAL',
        codeDesc: '기술 지원 문의',
        codeOrder: 1,
      },
      {
        codeClass: 'INQUIRY_CATEGORY',
        codeName: '계정관리',
        codeValue: 'ACCOUNT',
        codeDesc: '계정 관리 문의',
        codeOrder: 2,
      },
      {
        codeClass: 'INQUIRY_CATEGORY',
        codeName: '시나리오',
        codeValue: 'SCENARIO',
        codeDesc: '시나리오 관련 문의',
        codeOrder: 3,
      },
      {
        codeClass: 'INQUIRY_CATEGORY',
        codeName: '기타',
        codeValue: 'ETC',
        codeDesc: '기타 문의',
        codeOrder: 4,
      },

      // FAQ 카테고리
      {
        codeClass: 'FAQ_CATEGORY',
        codeName: '시작하기',
        codeValue: 'GETTING_STARTED',
        codeDesc: '시작하기 관련 FAQ',
        codeOrder: 1,
      },
      {
        codeClass: 'FAQ_CATEGORY',
        codeName: '시나리오',
        codeValue: 'SCENARIO',
        codeDesc: '시나리오 관련 FAQ',
        codeOrder: 2,
      },
      {
        codeClass: 'FAQ_CATEGORY',
        codeName: '훈련',
        codeValue: 'TRAINING',
        codeDesc: '훈련 관련 FAQ',
        codeOrder: 3,
      },
      {
        codeClass: 'FAQ_CATEGORY',
        codeName: '계정',
        codeValue: 'ACCOUNT',
        codeDesc: '계정 관련 FAQ',
        codeOrder: 4,
      },
    ];

    for (const codeData of systemCodes) {
      const existingCode = await codeRepository.findOne({
        where: {
          codeClass: codeData.codeClass,
          codeValue: codeData.codeValue,
          teamId: null,
        },
      });

      if (!existingCode) {
        const code = codeRepository.create({
          ...codeData,
          teamId: null, // 시스템 공통 코드
          createdBy: 1,
        });
        await codeRepository.save(code);
        console.log(
          `✅ 시스템 코드 생성: ${codeData.codeClass} - ${codeData.codeName}`,
        );
      }
    }
  }

  private async seedDefaultTeam(): Promise<Team> {
    const teamRepository = this.dataSource.getRepository(Team);

    let team = await teamRepository.findOne({
      where: { teamCode: 'TEAM001' },
    });

    if (!team) {
      team = teamRepository.create({
        teamCode: 'TEAM001',
        name: 'Phoenix 훈련팀',
        description: 'Phoenix 재난 대응 훈련 시스템 기본 팀',
        status: 'ACTIVE',
        createdBy: 1,
      });
      team = await teamRepository.save(team);
      console.log('✅ 기본 팀 생성: Phoenix 훈련팀');
    }

    return team;
  }

  private async seedDefaultAdmin(teamId: number): Promise<void> {
    const adminRepository = this.dataSource.getRepository(Admin);
    const adminLevelRepository = this.dataSource.getRepository(AdminLevel);

    const existingAdmin = await adminRepository.findOne({
      where: { loginId: 'admin' },
    });

    if (!existingAdmin) {
      const teamAdminLevel = await adminLevelRepository.findOne({
        where: { levelCode: 'TEAM_ADMIN' },
      });

      if (teamAdminLevel) {
        const hashedPassword = await bcrypt.hash('admin123!', 10);

        const admin = adminRepository.create({
          teamId,
          adminLevelId: teamAdminLevel.id,
          loginId: 'admin',
          password: hashedPassword,
          name: '시스템 관리자',
          email: 'admin@phoenix.com',
          phone: '010-0000-0000',
          useYn: 'Y',
          createdBy: 1,
        });

        await adminRepository.save(admin);
        console.log('✅ 기본 관리자 생성: admin / admin123!');
      }
    }
  }

  private async seedTestUsers(teamId: number): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    const testUsers = [
      {
        userCode: 'USER001',
        loginId: 'user1',
        name: '김훈련',
        email: 'user1@phoenix.com',
        userLevel: 5,
        userExp: 250,
        totalScore: 1250,
        completedScenarios: 3,
        currentTier: '초급자',
      },
      {
        userCode: 'USER002',
        loginId: 'user2',
        name: '이대응',
        email: 'user2@phoenix.com',
        userLevel: 12,
        userExp: 180,
        totalScore: 2100,
        completedScenarios: 7,
        currentTier: '중급자',
      },
      {
        userCode: 'USER003',
        loginId: 'user3',
        name: '박안전',
        email: 'user3@phoenix.com',
        userLevel: 1,
        userExp: 0,
        totalScore: 0,
        completedScenarios: 0,
        currentTier: '초급자',
      },
    ];

    for (const userData of testUsers) {
      const existingUser = await userRepository.findOne({
        where: { loginId: userData.loginId },
      });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash('user123!', 10);

        const user = userRepository.create({
          ...userData,
          teamId,
          password: hashedPassword,
          useYn: 'Y',
          levelProgress: 0,
          nextLevelExp: 100,
        });

        await userRepository.save(user);
        console.log(`✅ 테스트 사용자 생성: ${userData.loginId} / user123!`);
      }
    }
  }
}
