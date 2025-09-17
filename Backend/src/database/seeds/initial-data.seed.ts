import { DataSource } from 'typeorm';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import { Scenario } from '../../domain/entities/scenario.entity';
import * as bcrypt from 'bcryptjs';

export class InitialDataSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    console.log('🌱 초기 데이터 시드 시작...');

    // 1. 기본 팀 생성
    const team = await this.seedDefaultTeam();

    // 2. 테스트 사용자 생성
    await this.seedTestUsers(team.id);

    // 3. 기본 시나리오 생성
    await this.seedDefaultScenarios(team.id);

    console.log('✅ 초기 데이터 시드 완료!');
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

  private async seedDefaultScenarios(teamId: number): Promise<void> {
    const scenarioRepository = this.dataSource.getRepository(Scenario);

    const testScenarios = [
      {
        scenarioCode: 'FIRE001',
        title: '화재 대응 시나리오',
        disasterType: 'fire',
        description: '건물 화재 발생 시 대응 절차를 학습하는 시나리오입니다.',
        riskLevel: 'HIGH',
        difficulty: 'medium',
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
        createdBy: 1,
      },
      {
        scenarioCode: 'EARTHQUAKE001',
        title: '지진 대응 시나리오',
        disasterType: 'earthquake',
        description: '지진 발생 시 안전한 대피 절차를 학습하는 시나리오입니다.',
        riskLevel: 'HIGH',
        difficulty: 'easy',
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
        createdBy: 1,
      },
      {
        scenarioCode: 'EMERGENCY001',
        title: '응급처치 시나리오',
        disasterType: 'emergency',
        description:
          '응급상황 발생 시 기본적인 응급처치 방법을 학습하는 시나리오입니다.',
        riskLevel: 'MEDIUM',
        difficulty: 'easy',
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
        createdBy: 1,
      },
      {
        scenarioCode: 'TRAFFIC001',
        title: '교통사고 대응 시나리오',
        disasterType: 'traffic',
        description:
          '교통사고 발생 시 안전한 대응 절차를 학습하는 시나리오입니다.',
        riskLevel: 'MEDIUM',
        difficulty: 'medium',
        approvalStatus: 'APPROVED',
        status: 'ACTIVE',
        createdBy: 1,
      },
    ];

    for (const scenarioData of testScenarios) {
      const existingScenario = await scenarioRepository.findOne({
        where: { scenarioCode: scenarioData.scenarioCode },
      });

      if (!existingScenario) {
        const scenario = scenarioRepository.create({
          ...scenarioData,
          teamId,
        });

        await scenarioRepository.save(scenario);
        console.log(`✅ 기본 시나리오 생성: ${scenarioData.title}`);
      }
    }
  }
}
