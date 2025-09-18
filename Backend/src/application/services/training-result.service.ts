import { Injectable } from '@nestjs/common';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { UserChoiceLog } from '../../domain/entities/user-choice-log.entity';

@Injectable()
export class TrainingResultService {
  async createTrainingResult(
    _data: Partial<TrainingResult>,
  ): Promise<TrainingResult> {
    // TODO: 실제 구현
    throw new Error('Method not implemented.');
  }

  async getTrainingResultsByUser(_userId: number): Promise<TrainingResult[]> {
    // TODO: 실제 구현
    throw new Error('Method not implemented.');
  }

  async getTrainingResultsBySession(
    _sessionId: number,
  ): Promise<TrainingResult[]> {
    // TODO: 실제 구현
    throw new Error('Method not implemented.');
  }

  async getTrainingStatistics(_userId: number): Promise<any> {
    // TODO: 실제 구현
    throw new Error('Method not implemented.');
  }

  async getUserChoiceLogs(_resultId: number): Promise<UserChoiceLog[]> {
    // TODO: 실제 구현
    throw new Error('Method not implemented.');
  }

  async createUserChoiceLog(
    _data: Partial<UserChoiceLog>,
  ): Promise<UserChoiceLog> {
    // TODO: 실제 구현
    throw new Error('Method not implemented.');
  }
}
