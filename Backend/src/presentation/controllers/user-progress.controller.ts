import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TrainingResultService } from '../../application/services/training-result.service';

@ApiTags('User Progress')
@Controller('user-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProgressController {
  constructor(private readonly trainingResultService: TrainingResultService) {}

  @Get(':userId/scenario-stats')
  @ApiOperation({ summary: '사용자 시나리오 통계 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 시나리오 통계' })
  async getScenarioStats(@Param('userId') userId: number) {
    try {
      console.log('🔍 사용자 시나리오 통계 조회:', { userId });

      // 사용자의 훈련 결과 조회
      const results =
        await this.trainingResultService.getTrainingResultsByUser(userId);

      // 시나리오별 통계 계산
      const scenarioStats = results.reduce((acc, result) => {
        const scenarioId = result.scenarioId;
        if (!acc[scenarioId]) {
          acc[scenarioId] = {
            scenarioId,
            scenarioName: result.scenario?.title || `시나리오 ${scenarioId}`,
            totalAttempts: 0,
            totalScore: 0,
            averageScore: 0,
            bestScore: 0,
            lastAttempt: null,
            completionRate: 0,
          };
        }

        acc[scenarioId].totalAttempts++;
        acc[scenarioId].totalScore += result.totalScore || 0;
        acc[scenarioId].bestScore = Math.max(
          acc[scenarioId].bestScore,
          result.totalScore || 0,
        );
        acc[scenarioId].lastAttempt = result.completedAt;
      }, {});

      // 평균 점수 계산
      Object.values(scenarioStats).forEach((stat: any) => {
        stat.averageScore =
          Math.round((stat.totalScore / stat.totalAttempts) * 100) / 100;
        stat.completionRate = 100; // 완료된 시나리오이므로 100%
      });

      const statsArray = Object.values(scenarioStats);
      console.log('✅ 사용자 시나리오 통계 조회 완료:', {
        count: statsArray.length,
      });

      return {
        success: true,
        data: statsArray,
      };
    } catch (error) {
      console.error('❌ 사용자 시나리오 통계 조회 실패:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':userId/training-history')
  @ApiOperation({ summary: '사용자 훈련 이력 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 훈련 이력' })
  async getTrainingHistory(@Param('userId') userId: number) {
    try {
      console.log('🔍 사용자 훈련 이력 조회:', { userId });

      const results =
        await this.trainingResultService.getTrainingResultsByUser(userId);

      const history = results.map((result) => ({
        id: result.id,
        scenarioId: result.scenarioId,
        scenarioName: result.scenario?.title || `시나리오 ${result.scenarioId}`,
        totalScore: result.totalScore,
        accuracyScore: result.accuracyScore,
        speedScore: result.speedScore,
        completionTime: result.completionTime,
        completedAt: result.completedAt,
        feedback: result.feedback,
      }));

      console.log('✅ 사용자 훈련 이력 조회 완료:', { count: history.length });

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      console.error('❌ 사용자 훈련 이력 조회 실패:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':userId/overall-stats')
  @ApiOperation({ summary: '사용자 전체 통계 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 전체 통계' })
  async getOverallStats(@Param('userId') userId: number) {
    try {
      console.log('🔍 사용자 전체 통계 조회:', { userId });

      const statistics =
        await this.trainingResultService.getTrainingStatistics(userId);

      console.log('✅ 사용자 전체 통계 조회 완료:', statistics);

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      console.error('❌ 사용자 전체 통계 조회 실패:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
