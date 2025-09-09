import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingSession } from './entities/training-session.entity';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { TrainingParticipant } from '../../database/entities/training-participant.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingSession)
    private trainingRepository: Repository<TrainingSession>,
    @InjectRepository(TrainingParticipant)
    private participantRepository: Repository<TrainingParticipant>,
  ) {}

  async create(
    createTrainingSessionDto: CreateTrainingSessionDto,
  ): Promise<TrainingSession> {
    // 세션 코드 자동 생성 (팀별 고유)
    const sessionCode = await this.generateSessionCode(
      createTrainingSessionDto.teamId,
    );

    const training = this.trainingRepository.create({
      ...createTrainingSessionDto,
      sessionCode,
      sessionName: createTrainingSessionDto.title,
    });

    return this.trainingRepository.save(training);
  }

  /**
   * 팀별 고유 세션 코드 생성
   */
  private async generateSessionCode(teamId: number): Promise<string> {
    const existingSessions = await this.trainingRepository.find({
      where: { teamId, isActive: true },
      order: { createdAt: 'DESC' },
      take: 1,
    });

    const lastSessionNumber =
      existingSessions.length > 0
        ? parseInt(existingSessions[0].sessionCode.replace('SESS', '')) || 0
        : 0;

    return `SESS${String(lastSessionNumber + 1).padStart(3, '0')}`;
  }

  async findAll(): Promise<TrainingSession[]> {
    return this.trainingRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 팀별 훈련 세션 조회
   */
  async findByTeam(teamId: number): Promise<TrainingSession[]> {
    return this.trainingRepository.find({
      where: { teamId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * 세션 코드로 세션 조회 (참가용)
   */
  async findBySessionCode(sessionCode: string): Promise<TrainingSession> {
    const session = await this.trainingRepository.findOne({
      where: { sessionCode, isActive: true },
    });

    if (!session) {
      throw new NotFoundException('유효하지 않은 세션 코드입니다.');
    }

    return session;
  }

  async findOne(id: number): Promise<TrainingSession> {
    const training = await this.trainingRepository.findOne({ where: { id } });

    if (!training) {
      throw new NotFoundException(
        `ID ${id}에 해당하는 훈련 세션을 찾을 수 없습니다.`,
      );
    }

    return training;
  }

  async update(
    id: number,
    updateTrainingSessionDto: UpdateTrainingSessionDto,
  ): Promise<TrainingSession> {
    const training = await this.findOne(id);
    Object.assign(training, updateTrainingSessionDto);
    return this.trainingRepository.save(training);
  }

  async remove(id: number): Promise<void> {
    const training = await this.findOne(id);
    await this.trainingRepository.remove(training);
  }

  /**
   * 훈련 세션 참가
   */
  async joinSession(
    sessionCode: string,
    userId: number,
  ): Promise<TrainingParticipant> {
    const session = await this.findBySessionCode(sessionCode);

    // 이미 참가했는지 확인
    const existingParticipant = await this.participantRepository.findOne({
      where: { sessionId: session.id, userId, isActive: true },
    });

    if (existingParticipant) {
      throw new BadRequestException('이미 참가한 세션입니다.');
    }

    // 참가자 코드 생성
    const participantCode = await this.generateParticipantCode(session.id);

    const participant = this.participantRepository.create({
      sessionId: session.id,
      teamId: session.teamId,
      scenarioId: session.scenarioId,
      userId,
      participantCode,
      joinedAt: new Date(),
      status: '참여중',
    });

    return this.participantRepository.save(participant);
  }

  /**
   * 참가자 코드 생성
   */
  private async generateParticipantCode(sessionId: number): Promise<string> {
    const existingParticipants = await this.participantRepository.find({
      where: { sessionId, isActive: true },
      order: { joinedAt: 'DESC' },
      take: 1,
    });

    const lastParticipantNumber =
      existingParticipants.length > 0
        ? parseInt(
            existingParticipants[0].participantCode.replace('PART', ''),
          ) || 0
        : 0;

    return `PART${String(lastParticipantNumber + 1).padStart(3, '0')}`;
  }

  /**
   * 세션 참가자 목록 조회
   */
  async getSessionParticipants(
    sessionId: number,
  ): Promise<TrainingParticipant[]> {
    return this.participantRepository.find({
      where: { sessionId, isActive: true },
      order: { joinedAt: 'ASC' },
    });
  }

  /**
   * 팀별 통계 조회 (관리자용)
   */
  async getTeamStats(teamId: number): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalParticipants: number;
    completedParticipants: number;
  }> {
    const sessions = await this.trainingRepository.find({
      where: { teamId, isActive: true },
    });

    const participants = await this.participantRepository.find({
      where: { teamId, isActive: true },
    });

    return {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === '진행중').length,
      totalParticipants: participants.length,
      completedParticipants: participants.filter((p) => p.status === '완료')
        .length,
    };
  }
}
