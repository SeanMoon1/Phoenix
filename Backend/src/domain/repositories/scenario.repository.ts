import { Scenario } from '../entities/scenario.entity';

export interface ScenarioRepository {
  findById(id: number): Promise<Scenario | null>;
  findAll(): Promise<Scenario[]>;
  findByTeamId(teamId: number): Promise<Scenario[]>;
  findByDisasterType(disasterType: string): Promise<Scenario[]>;
  findByApprovalStatus(status: string): Promise<Scenario[]>;
  create(scenario: Partial<Scenario>): Promise<Scenario>;
  update(id: number, scenario: Partial<Scenario>): Promise<Scenario>;
  delete(id: number): Promise<void>;
  findByStatus(status: string): Promise<Scenario[]>;
  findByDifficulty(difficulty: string): Promise<Scenario[]>;
  findByRiskLevel(riskLevel: string): Promise<Scenario[]>;
}
