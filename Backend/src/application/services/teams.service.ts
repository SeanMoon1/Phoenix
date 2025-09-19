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
    const newTeam = this.teamRepository.create(createTeamDto);
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
}
