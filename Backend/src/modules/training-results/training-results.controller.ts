import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TrainingResultsService } from './training-results.service';
import { TrainingResult } from '../../database/entities/training-result.entity';
import { UserChoiceLog } from '../../database/entities/user-choice-log.entity';

@ApiTags('Training Results')
@Controller('training-results')
export class TrainingResultsController {
  constructor(
    private readonly trainingResultsService: TrainingResultsService,
  ) {}

  @Post()
  @ApiOperation({ summary: '훈련 결과 생성' })
  @ApiResponse({
    status: 201,
    description: '훈련 결과가 성공적으로 생성되었습니다.',
  })
  async createTrainingResult(@Body() data: Partial<TrainingResult>) {
    return this.trainingResultsService.createTrainingResult(data);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '사용자별 훈련 결과 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 훈련 결과 목록' })
  async getTrainingResultsByUser(@Param('userId') userId: number) {
    return this.trainingResultsService.getTrainingResultsByUser(userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: '세션별 훈련 결과 조회' })
  @ApiParam({ name: 'sessionId', description: '세션 ID' })
  @ApiResponse({ status: 200, description: '세션 훈련 결과 목록' })
  async getTrainingResultsBySession(@Param('sessionId') sessionId: number) {
    return this.trainingResultsService.getTrainingResultsBySession(sessionId);
  }

  @Get('statistics/:userId')
  @ApiOperation({ summary: '사용자 훈련 통계 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 훈련 통계' })
  async getTrainingStatistics(@Param('userId') userId: number) {
    return this.trainingResultsService.getTrainingStatistics(userId);
  }

  @Get('choice-logs/:resultId')
  @ApiOperation({ summary: '사용자 선택 로그 조회' })
  @ApiParam({ name: 'resultId', description: '결과 ID' })
  @ApiResponse({ status: 200, description: '사용자 선택 로그 목록' })
  async getUserChoiceLogs(@Param('resultId') resultId: number) {
    return this.trainingResultsService.getUserChoiceLogs(resultId);
  }

  @Post('choice-logs')
  @ApiOperation({ summary: '사용자 선택 로그 생성' })
  @ApiResponse({
    status: 201,
    description: '선택 로그가 성공적으로 생성되었습니다.',
  })
  async createUserChoiceLog(@Body() data: Partial<UserChoiceLog>) {
    return this.trainingResultsService.createUserChoiceLog(data);
  }
}
