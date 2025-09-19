import { Injectable, Inject } from '@nestjs/common';
import { TrainingSessionRepository } from '../../domain/repositories/training-session.repository';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { CreateTrainingSessionDto } from '../../presentation/dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from '../../presentation/dto/update-training-session.dto';

@Injectable()
export class TrainingService {
  constructor(
    @Inject('TrainingSessionRepository')
    private readonly trainingSessionRepository: TrainingSessionRepository,
  ) {}

  async create(
    createTrainingSessionDto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    // sessionCode가 없으면 자동 생성
    const sessionData = {
      ...createTrainingSessionDto,
      sessionCode: createTrainingSessionDto.sessionCode || `SESS${Date.now()}`,
    };
    return this.trainingSessionRepository.create(sessionData);
  }

  async findAll(): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.findAll();
  }

  async findOne(id: number): Promise<TrainingSession> {
    return this.trainingSessionRepository.findById(id);
  }

  async update(
    id: number,
    updateTrainingSessionDto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    return this.trainingSessionRepository.update(id, updateTrainingSessionDto);
  }

  async remove(id: number): Promise<void> {
    return this.trainingSessionRepository.delete(id);
  }

  async findByTeamId(teamId: number): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.findByTeamId(teamId);
  }

  async findByScenarioId(scenarioId: number): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.findByScenarioId(scenarioId);
  }

  async findByStatus(status: string): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.findByStatus(status);
  }
}
