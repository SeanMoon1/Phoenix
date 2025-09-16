import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TrainingSessionRepository } from '../../../domain/repositories/training-session.repository';
import { TrainingSession } from '../../../domain/entities/training-session.entity';

@Injectable()
export class TypeOrmTrainingSessionRepository
  implements TrainingSessionRepository
{
  constructor(
    @InjectRepository(TrainingSession)
    private readonly trainingSessionRepository: Repository<TrainingSession>,
  ) {}

  async findById(id: number): Promise<TrainingSession | null> {
    return this.trainingSessionRepository.findOne({
      where: { id },
    });
  }

  async findAll(): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find();
  }

  async findByTeamId(teamId: number): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({
      where: { teamId },
    });
  }

  async findByScenarioId(scenarioId: number): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({
      where: { scenarioId },
    });
  }

  async findByStatus(status: string): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({
      where: { status },
    });
  }

  async create(session: Partial<TrainingSession>): Promise<TrainingSession> {
    const newSession = this.trainingSessionRepository.create(session);
    return this.trainingSessionRepository.save(newSession);
  }

  async update(
    id: number,
    session: Partial<TrainingSession>,
  ): Promise<TrainingSession> {
    await this.trainingSessionRepository.update(id, session);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.trainingSessionRepository.delete(id);
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({
      where: {
        startTime: Between(startDate, endDate),
      },
    });
  }

  async findActiveSessions(): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({
      where: { status: 'active' },
    });
  }
}
