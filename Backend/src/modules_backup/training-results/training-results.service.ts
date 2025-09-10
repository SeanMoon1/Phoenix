import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingResult } from '../../database/entities/training-result.entity';
import { TrainingParticipant } from '../../database/entities/training-participant.entity';
import { UserChoiceLog } from '../../database/entities/user-choice-log.entity';
import { CommonService } from '../common/common.service';

@Injectable()
export class TrainingResultsService {
  constructor(
    @InjectRepository(TrainingResult)
    private trainingResultRepository: Repository<TrainingResult>,
    @InjectRepository(TrainingParticipant)
    private trainingParticipantRepository: Repository<TrainingParticipant>,
    @InjectRepository(UserChoiceLog)
    private userChoiceLogRepository: Repository<UserChoiceLog>,
    private commonService: CommonService,
  ) {}

  async createTrainingResult(
    data: Partial<TrainingResult>,
  ): Promise<TrainingResult> {
    const resultCode = this.commonService.generateCode('RESULT');
    const trainingResult = this.trainingResultRepository.create({
      ...data,
      resultCode,
    });
    return this.trainingResultRepository.save(trainingResult);
  }

  async getTrainingResultsByUser(userId: number): Promise<TrainingResult[]> {
    return this.trainingResultRepository.find({
      where: { userId, isActive: true },
      relations: ['participant', 'scenario'],
      order: { completedAt: 'DESC' },
    });
  }

  async getTrainingResultsBySession(
    sessionId: number,
  ): Promise<TrainingResult[]> {
    return this.trainingResultRepository.find({
      where: { sessionId, isActive: true },
      relations: ['participant', 'user', 'scenario'],
      order: { totalScore: 'DESC' },
    });
  }

  async getUserChoiceLogs(resultId: number): Promise<UserChoiceLog[]> {
    return this.userChoiceLogRepository.find({
      where: { resultId, isActive: true },
      relations: ['event', 'choice'],
      order: { selectedAt: 'ASC' },
    });
  }

  async createUserChoiceLog(
    data: Partial<UserChoiceLog>,
  ): Promise<UserChoiceLog> {
    const logCode = this.commonService.generateCode('LOG');
    const choiceLog = this.userChoiceLogRepository.create({
      ...data,
      logCode,
    });
    return this.userChoiceLogRepository.save(choiceLog);
  }

  async getTrainingStatistics(userId: number): Promise<any> {
    const results = await this.trainingResultRepository.find({
      where: { userId, isActive: true },
    });

    const totalTrainings = results.length;
    const totalScore = results.reduce(
      (sum, result) => sum + result.totalScore,
      0,
    );
    const averageScore = totalTrainings > 0 ? totalScore / totalTrainings : 0;
    const bestScore = Math.max(...results.map((r) => r.totalScore), 0);

    return {
      totalTrainings,
      totalScore,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
    };
  }
}
