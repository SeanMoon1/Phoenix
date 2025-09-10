import { Scenario } from '../entities/scenario.entity';

export interface IScenarioRepository {
  findById(id: number): Promise<Scenario | null>;
  findAll(): Promise<Scenario[]>;
  create(scenario: Scenario): Promise<Scenario>;
  update(id: number, scenario: Partial<Scenario>): Promise<Scenario>;
  delete(id: number): Promise<void>;
  findByType(type: string): Promise<Scenario[]>;
}
