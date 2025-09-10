import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
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
          name: team.name,
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
}
