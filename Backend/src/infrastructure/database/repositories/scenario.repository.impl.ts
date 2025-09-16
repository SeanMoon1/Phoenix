import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScenarioRepository } from '../../../domain/repositories/scenario.repository';
import { Scenario } from '../../../domain/entities/scenario.entity';

@Injectable()
export class TypeOrmScenarioRepository implements ScenarioRepository {
  constructor(
    @InjectRepository(Scenario)
    private readonly scenarioRepository: Repository<Scenario>,
  ) {}

  async findById(id: number): Promise<Scenario | null> {
    return this.scenarioRepository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<Scenario[]> {
    return this.scenarioRepository.find();
  }

  async findByTeamId(teamId: number): Promise<Scenario[]> {
    return this.scenarioRepository.find({
      where: { teamId },
    });
  }

  async findByDisasterType(disasterType: string): Promise<Scenario[]> {
    return this.scenarioRepository.find({
      where: { disasterType },
    });
  }

  async findByApprovalStatus(status: string): Promise<Scenario[]> {
    return this.scenarioRepository.find({
      where: { approvalStatus: status },
    });
  }

  async create(scenario: Partial<Scenario>): Promise<Scenario> {
    const newScenario = this.scenarioRepository.create(scenario);
    return this.scenarioRepository.save(newScenario);
  }

  async update(id: number, scenario: Partial<Scenario>): Promise<Scenario> {
    await this.scenarioRepository.update(id, scenario);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.scenarioRepository.delete(id);
  }

  async findByStatus(status: string): Promise<Scenario[]> {
    return this.scenarioRepository.find({
      where: { status },
    });
  }

  async findByDifficulty(difficulty: string): Promise<Scenario[]> {
    return this.scenarioRepository.find({
      where: { difficulty },
    });
  }

  async findByRiskLevel(riskLevel: string): Promise<Scenario[]> {
    return this.scenarioRepository.find({
      where: { riskLevel },
    });
  }
}
