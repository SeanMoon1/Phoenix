import { Injectable } from '@nestjs/common';
import { IScenarioRepository } from '../../interfaces/repositories';
import { Scenario } from '../../../domain/entities/scenario.entity';

export interface GetScenarioRequest {
  id: number;
}

export interface GetScenarioResponse {
  id: number;
  title: string;
  description: string;
  disasterType: string;
  riskLevel: string;
  status: string;
  isActive: boolean;
}

@Injectable()
export class GetScenarioUseCase {
  constructor(private readonly scenarioRepository: IScenarioRepository) {}

  async execute(request: GetScenarioRequest): Promise<GetScenarioResponse> {
    const scenario = await this.scenarioRepository.findById(request.id);

    if (!scenario) {
      throw new Error('Scenario not found');
    }

    if (!scenario.isActive) {
      throw new Error('Scenario is not active');
    }

    return {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      disasterType: scenario.disasterType,
      riskLevel: scenario.riskLevel,
      status: scenario.status,
      isActive: scenario.isActive,
    };
  }
}
