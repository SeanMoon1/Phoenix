import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
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
  async getScenarioStats(@Param('userId') userId: number, @Req() req: any) {
    try {
      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 본인의 정보이거나 슈퍼 관리자인 경우
      if (user.id === userId || user.adminLevel === 'SUPER_ADMIN') {
        // 사용자의 훈련 결과 조회
        const results =
          await this.trainingResultService.getTrainingResultsByUser(userId);

        // 시나리오별 통계 계산
        const scenarioStats = results.reduce(
          (acc, result) => {
            const scenarioId = result.scenarioId;
            if (!acc[scenarioId]) {
              acc[scenarioId] = {
                scenarioId,
                scenarioName:
                  result.scenario?.title || `시나리오 ${scenarioId}`,
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

            return acc;
          },
          {} as Record<number, any>,
        );

        // 평균 점수 계산
        Object.values(scenarioStats).forEach((stat: any) => {
          stat.averageScore =
            Math.round((stat.totalScore / stat.totalAttempts) * 100) / 100;
          stat.completionRate = 100; // 완료된 시나리오이므로 100%
        });

        const statsArray = Object.values(scenarioStats);

        return {
          success: true,
          data: statsArray,
        };
      }

      // 팀 관리자인 경우 같은 팀의 사용자만 조회 가능
      if (user.adminLevel === 'TEAM_ADMIN' && user.teamId) {
        // 사용자 정보를 먼저 조회하여 팀 확인
        const targetUser = await this.trainingResultService.getUserById(userId);
        if (targetUser && targetUser.teamId === user.teamId) {
          // 사용자의 훈련 결과 조회
          const results =
            await this.trainingResultService.getTrainingResultsByUser(userId);

          // 시나리오별 통계 계산
          const scenarioStats = results.reduce(
            (acc, result) => {
              const scenarioId = result.scenarioId;
              if (!acc[scenarioId]) {
                acc[scenarioId] = {
                  scenarioId,
                  scenarioName:
                    result.scenario?.title || `시나리오 ${scenarioId}`,
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

              return acc;
            },
            {} as Record<number, any>,
          );

          // 평균 점수 계산
          Object.values(scenarioStats).forEach((stat: any) => {
            stat.averageScore =
              Math.round((stat.totalScore / stat.totalAttempts) * 100) / 100;
            stat.completionRate = 100; // 완료된 시나리오이므로 100%
          });

          const statsArray = Object.values(scenarioStats);

          return {
            success: true,
            data: statsArray,
          };
        } else {
          return {
            success: false,
            error: '해당 사용자의 시나리오 통계 조회 권한이 없습니다.',
          };
        }
      }

      return {
        success: false,
        error: '사용자 시나리오 통계 조회 권한이 없습니다.',
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
      const statistics =
        await this.trainingResultService.getTrainingStatistics(userId);

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
