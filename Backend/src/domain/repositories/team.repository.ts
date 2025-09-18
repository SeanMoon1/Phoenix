import { Team } from '../entities/team.entity';

export interface TeamRepository {
  findById(id: number): Promise<Team | null>;
  findByCode(teamCode: string): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  findByStatus(status: string): Promise<Team[]>;
  create(team: Partial<Team>): Promise<Team>;
  update(id: number, team: Partial<Team>): Promise<Team>;
  delete(id: number): Promise<void>;
  findActiveTeams(): Promise<Team[]>;
  findByName(name: string): Promise<Team | null>;
}
