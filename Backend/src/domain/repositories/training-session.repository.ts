import { TrainingSession } from '../entities/training-session.entity';

export interface TrainingSessionRepository {
  findById(id: number): Promise<TrainingSession | null>;
  findAll(): Promise<TrainingSession[]>;
  findByTeamId(teamId: number): Promise<TrainingSession[]>;
  findByScenarioId(scenarioId: number): Promise<TrainingSession[]>;
  findByStatus(status: string): Promise<TrainingSession[]>;
  create(session: Partial<TrainingSession>): Promise<TrainingSession>;
  update(
    id: number,
    session: Partial<TrainingSession>,
  ): Promise<TrainingSession>;
  delete(id: number): Promise<void>;
  findByDateRange(startDate: Date, endDate: Date): Promise<TrainingSession[]>;
  findActiveSessions(): Promise<TrainingSession[]>;
  findBySessionCode(sessionCode: string): Promise<TrainingSession | null>;
}
