import { Injectable, Inject } from '@nestjs/common';
import { ScenarioRepository } from '../../domain/repositories/scenario.repository';
import { Scenario } from '../../domain/entities/scenario.entity';
import { CreateScenarioDto } from '../../presentation/dto/create-scenario.dto';
import { UpdateScenarioDto } from '../../presentation/dto/update-scenario.dto';

@Injectable()
export class ScenariosService {
  constructor(
    @Inject('ScenarioRepository')
    private readonly scenarioRepository: ScenarioRepository,
  ) {}

  async create(createScenarioDto: CreateScenarioDto): Promise<Scenario> {
    return this.scenarioRepository.create(createScenarioDto);
  }

  async findAll(): Promise<Scenario[]> {
    return this.scenarioRepository.findAll();
  }

  async findOne(id: number): Promise<Scenario> {
    return this.scenarioRepository.findById(id);
  }

  async update(
    id: number,
    updateScenarioDto: UpdateScenarioDto,
  ): Promise<Scenario> {
    return this.scenarioRepository.update(id, updateScenarioDto);
  }

  async remove(id: number): Promise<void> {
    return this.scenarioRepository.delete(id);
  }

  async findByTeamId(teamId: number): Promise<Scenario[]> {
    return this.scenarioRepository.findByTeamId(teamId);
  }

  async findByDisasterType(disasterType: string): Promise<Scenario[]> {
    return this.scenarioRepository.findByDisasterType(disasterType);
  }

  async findByApprovalStatus(status: string): Promise<Scenario[]> {
    return this.scenarioRepository.findByApprovalStatus(status);
  }
}
