import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../../presentation/dto/create-team.dto';
import { UpdateTeamDto } from '../../presentation/dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    // 팀 코드가 제공되지 않은 경우 자동 생성
    if (!createTeamDto.teamCode) {
      createTeamDto.teamCode = await this.generateUniqueTeamCode();
    }

    // 팀 코드 중복 검사
    const existingTeam = await this.findByCode(createTeamDto.teamCode);
    if (existingTeam) {
      throw new Error('이미 존재하는 팀 코드입니다.');
    }

    const newTeam = this.teamRepository.create({
      ...createTeamDto,
      status: createTeamDto.status || 'ACTIVE',
      isActive: true,
    });

    return this.teamRepository.save(newTeam);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find();
  }

  async findOne(id: number): Promise<Team> {
    return this.teamRepository.findOne({ where: { id } });
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    await this.teamRepository.update(id, updateTeamDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.teamRepository.delete(id);
  }

  async findByCode(teamCode: string): Promise<Team> {
    return this.teamRepository.findOne({ where: { teamCode } });
  }

  async validateTeamCode(
    teamCode: string,
  ): Promise<{ valid: boolean; team?: Team; message?: string }> {
    try {
      const team = await this.teamRepository.findOne({ where: { teamCode } });

      if (!team) {
        return {
          valid: false,
          message: '존재하지 않는 팀 코드입니다.',
        };
      }

      if (!team.isActive || team.deletedAt) {
        return {
          valid: false,
          message: '비활성화된 팀입니다.',
        };
      }

      return {
        valid: true,
        team: {
          id: team.id,
          name: team.name,
          description: team.description,
          teamCode: team.teamCode,
        } as Team,
      };
    } catch (error) {
      return {
        valid: false,
        message: '팀 코드 검증 중 오류가 발생했습니다.',
      };
    }
  }

  /**
   * 고유한 팀 코드 자동 생성
   * 형식: TEAM + 6자리 숫자 (예: TEAM000001)
   */
  private async generateUniqueTeamCode(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      // 현재 시간의 밀리초를 사용하여 6자리 숫자 생성
      const timestamp = Date.now().toString().slice(-6);
      const teamCode = `TEAM${timestamp.padStart(6, '0')}`;

      // 중복 검사
      const existingTeam = await this.findByCode(teamCode);
      if (!existingTeam) {
        return teamCode;
      }

      attempts++;
    }

    // 최대 시도 횟수 초과 시 랜덤 코드 생성
    const randomNum = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    return `TEAM${randomNum}`;
  }
}
