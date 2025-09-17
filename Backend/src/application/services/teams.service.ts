import { Injectable, Inject } from '@nestjs/common';
import { TeamRepository } from '../../domain/repositories/team.repository';
import { Team } from '../../domain/entities/team.entity';
import { CreateTeamDto } from '../../presentation/dto/create-team.dto';
import { UpdateTeamDto } from '../../presentation/dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @Inject('TeamRepository')
    private readonly teamRepository: TeamRepository,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    return this.teamRepository.create(createTeamDto);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.findAll();
  }

  async findOne(id: number): Promise<Team> {
    return this.teamRepository.findById(id);
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    return this.teamRepository.update(id, updateTeamDto);
  }

  async remove(id: number): Promise<void> {
    return this.teamRepository.delete(id);
  }

  async findByCode(teamCode: string): Promise<Team> {
    return this.teamRepository.findByCode(teamCode);
  }

  async validateTeamCode(
    teamCode: string,
  ): Promise<{ valid: boolean; team?: Team; message?: string }> {
    try {
      const team = await this.teamRepository.findByCode(teamCode);

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
}
