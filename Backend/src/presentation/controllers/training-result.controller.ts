import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainingResultService } from '../../application/services/training-result.service';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { CreateTrainingResultDto } from '../dto/create-training-result.dto';
import { UserChoiceLog } from '../../domain/entities/user-choice-log.entity';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Training Results')
@Controller('training-results')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingResultController {
  constructor(private readonly trainingResultService: TrainingResultService) {}

  @Post()
  @ApiOperation({ summary: '훈련 결과 생성' })
  @ApiResponse({
    status: 201,
    description: '훈련 결과가 성공적으로 생성되었습니다.',
  })
  async createTrainingResult(@Body() data: CreateTrainingResultDto) {
    console.log('🔍 TrainingResultController.createTrainingResult 호출됨');
    console.log('📝 받은 데이터:', {
      userId: data.userId,
      sessionId: data.sessionId,
      scenarioId: data.scenarioId,
      participantId: data.participantId,
      totalScore: data.totalScore,
      accuracyScore: data.accuracyScore,
      speedScore: data.speedScore,
      completionTime: data.completionTime,
      completedAt: data.completedAt,
    });

    try {
      const result =
        await this.trainingResultService.createTrainingResult(data);
      console.log('✅ TrainingResultController.createTrainingResult 성공:', {
        id: result.id,
        resultCode: result.resultCode,
      });
      return result;
    } catch (error) {
      console.error(
        '❌ TrainingResultController.createTrainingResult 실패:',
        error,
      );
      throw error;
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '사용자별 훈련 결과 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 훈련 결과 목록' })
  async getTrainingResultsByUser(@Param('userId') userId: number) {
    return this.trainingResultService.getTrainingResultsByUser(userId);
  }

  @Get('session/:sessionId')
  @ApiOperation({ summary: '세션별 훈련 결과 조회' })
  @ApiParam({ name: 'sessionId', description: '세션 ID' })
  @ApiResponse({ status: 200, description: '세션 훈련 결과 목록' })
  async getTrainingResultsBySession(@Param('sessionId') sessionId: number) {
    return this.trainingResultService.getTrainingResultsBySession(sessionId);
  }

  @Get('statistics/:userId')
  @ApiOperation({ summary: '사용자 훈련 통계 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 훈련 통계' })
  async getTrainingStatistics(@Param('userId') userId: number) {
    return this.trainingResultService.getTrainingStatistics(userId);
  }

  @Get('choice-logs/:resultId')
  @ApiOperation({ summary: '사용자 선택 로그 조회' })
  @ApiParam({ name: 'resultId', description: '결과 ID' })
  @ApiResponse({ status: 200, description: '사용자 선택 로그 목록' })
  async getUserChoiceLogs(@Param('resultId') resultId: number) {
    return this.trainingResultService.getUserChoiceLogs(resultId);
  }

  @Post('choice-logs')
  @ApiOperation({ summary: '사용자 선택 로그 생성' })
  @ApiResponse({
    status: 201,
    description: '선택 로그가 성공적으로 생성되었습니다.',
  })
  async createUserChoiceLog(@Body() data: Partial<UserChoiceLog>) {
    return this.trainingResultService.createUserChoiceLog(data);
  }
}
