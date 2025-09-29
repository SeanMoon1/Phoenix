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
   * 훈련 세션 코드 자동 생성 (중복 방지)
   * @param teamId 팀 ID (null 허용)
   * @returns 생성된 세션 코드
   */
  private async generateSessionCode(
    teamId: number | null | undefined,
  ): Promise<string> {
    let sessionCode: string;
    let attempts = 0;
    const maxAttempts = 20;

    do {
      // 현재 시간 + 랜덤 숫자로 고유 코드 생성
      const now = new Date();
      const timestamp = now.getTime().toString(36).toUpperCase();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      sessionCode = `SESS${timestamp}${random}`;

      // 중복 확인
      const existingSession = await this.trainingSessionRepository.findOne({
        where: { sessionCode },
      });

      if (!existingSession) {
        return sessionCode;
      }

      attempts++;

      // 짧은 지연 시간 추가 (동시 요청 시 충돌 방지)
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    } while (attempts < maxAttempts);

    // 최대 시도 횟수 초과 시 UUID 기반 코드 생성
    const uuid = Math.random().toString(36).substring(2, 15);
    return `SESS${uuid.toUpperCase()}`;
  }
}
