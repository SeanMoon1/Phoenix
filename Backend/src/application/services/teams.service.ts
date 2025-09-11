import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../domain/entities/team.entity';
import { User } from '../../domain/entities/user.entity';
import { CreateTeamDto } from '../../presentation/dto/create-team.dto';
import { UpdateTeamDto } from '../../presentation/dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamsRepository.create(createTeamDto);
    return this.teamsRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamsRepository.find();
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException(`ID ${id}에 해당하는 팀을 찾을 수 없습니다.`);
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    Object.assign(team, updateTeamDto);
    return this.teamsRepository.save(team);
  }

  async remove(id: number): Promise<void> {
    const team = await this.findOne(id);
    await this.teamsRepository.remove(team);
  }

  /**
   * 팀 코드로 팀 조회 (AWS 호스팅 환경에서 활성 팀만 조회)
   * @param teamCode 팀 코드
   * @returns 팀 정보
   */
  async findByTeamCode(teamCode: string): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: {
        teamCode,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    if (!team) {
      throw new NotFoundException(
        `팀 코드 '${teamCode}'에 해당하는 활성 팀을 찾을 수 없습니다.`,
      );
    }

    return team;
  }

  /**
   * 팀 코드 유효성 검증 (프론트엔드 실시간 검증용)
   * @param teamCode 팀 코드
   * @returns 팀 코드 유효성 및 팀 정보
   */
  async validateTeamCode(
    teamCode: string,
  ): Promise<{ valid: boolean; team?: Partial<Team>; message?: string }> {
    try {
      const team = await this.findByTeamCode(teamCode);
      return {
        valid: true,
        team: {
          id: team.id,
          teamName: team.teamName,
          description: team.description,
          teamCode: team.teamCode,
        },
      };
    } catch (error) {
      return {
        valid: false,
        message: '유효하지 않은 팀 코드입니다. 팀 관리자에게 문의하세요.',
      };
    }
  }

  /**
   * 팀 가입
   * @param teamCode 팀 코드
   * @param userId 사용자 ID
   * @returns 팀 가입 결과
   */
  async joinTeam(
    teamCode: string,
    userId: number,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // 1. 팀 코드로 팀 조회
      const team = await this.findByTeamCode(teamCode);

      // 2. 사용자 조회
      const user = await this.usersRepository.findOne({
        where: { id: userId, isActive: true },
      });

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다.');
      }

      // 3. 이미 팀에 소속되어 있는지 확인
      if (user.teamId) {
        throw new BadRequestException('이미 팀에 소속되어 있습니다.');
      }

      // 4. 사용자 팀 ID 업데이트
      user.teamId = team.id;
      user.userCode = `USER${userId.toString().padStart(3, '0')}`; // 사용자 코드 자동 생성
      await this.usersRepository.save(user);

      return {
        success: true,
        message: '팀에 성공적으로 가입되었습니다.',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: '팀 가입 중 오류가 발생했습니다.',
      };
    }
  }
}
