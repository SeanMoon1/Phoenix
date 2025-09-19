import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from '../../domain/entities/training-session.entity';
import { CreateTrainingSessionDto } from '../../presentation/dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from '../../presentation/dto/update-training-session.dto';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingSession)
    private readonly trainingSessionRepository: Repository<TrainingSession>,
  ) {}

  async create(
    createTrainingSessionDto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    // sessionCode가 없으면 자동 생성
    const sessionData = {
      ...createTrainingSessionDto,
      sessionCode:
        createTrainingSessionDto.sessionCode ||
        (await this.generateSessionCode(createTrainingSessionDto.teamId)),
    };

    // 코드 중복 확인
    const existingSession = await this.trainingSessionRepository.findOne({
      where: { sessionCode: sessionData.sessionCode },
    });
    if (existingSession) {
      throw new Error('세션 코드가 이미 존재합니다.');
    }

    const newSession = this.trainingSessionRepository.create(sessionData);
    return this.trainingSessionRepository.save(newSession);
  }

  async findAll(): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find();
  }

  async findOne(id: number): Promise<TrainingSession> {
    return this.trainingSessionRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateTrainingSessionDto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    await this.trainingSessionRepository.update(id, updateTrainingSessionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.trainingSessionRepository.delete(id);
  }

  async findByTeamId(teamId: number): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({ where: { teamId } });
  }

  async findByScenarioId(scenarioId: number): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({ where: { scenarioId } });
  }

  async findByStatus(status: string): Promise<TrainingSession[]> {
    return this.trainingSessionRepository.find({ where: { status } });
  }

  /**
   * 훈련 세션 코드 자동 생성
   * @param teamId 팀 ID (null 허용)
   * @returns 생성된 세션 코드
   */
  private async generateSessionCode(
    teamId: number | null | undefined,
  ): Promise<string> {
    // 다음 시퀀스 번호 조회
    const existingSessions = teamId
      ? await this.trainingSessionRepository.find({ where: { teamId } })
      : await this.trainingSessionRepository.find();
    const nextNumber = existingSessions.length + 1;
    return `SESS${nextNumber.toString().padStart(3, '0')}`;
  }
}
