import { Injectable, Inject } from '@nestjs/common';
import { Repository, Between } from 'typeorm';
import { TrainingSessionRepository } from '../../../domain/repositories/training-session.repository';
import { TrainingSession } from '../../../domain/entities/training-session.entity';

@Injectable()
export class TypeOrmTrainingSessionRepository
  implements TrainingSessionRepository
{
  constructor(
    @Inject('TrainingSessionRepository')
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
    console.log('🔍 저장할 세션 데이터:', session);
    const newSession = this.trainingSessionRepository.create(session);
    console.log('🔍 생성된 엔티티:', newSession);
    const savedSession = await this.trainingSessionRepository.save(newSession);
    console.log('🔍 저장된 세션 ID:', savedSession.id);
    console.log('🔍 저장된 세션 전체:', savedSession);
    console.log('🔍 저장된 세션 키들:', Object.keys(savedSession));
    return savedSession;
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

  async findBySessionCode(
    sessionCode: string,
  ): Promise<TrainingSession | null> {
    return this.trainingSessionRepository.findOne({
      where: { sessionCode },
    });
  }
}
