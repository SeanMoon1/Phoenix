import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { TeamAccessGuard } from '../../shared/guards/team-access.guard';
import { TeamAccess } from '../../shared/decorators/team-access.decorator';
import { TrainingResultService } from '../../application/services/training-result.service';
import { TeamsService } from '../../application/services/teams.service';

@ApiTags('Team Statistics')
@Controller('team-stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamStatsController {
  constructor(
    private readonly trainingResultService: TrainingResultService,
    private readonly teamsService: TeamsService,
  ) {}

  /**
   * 슈퍼 관리자용: 모든 팀 통계 조회
   */
  @Get('all')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: '모든 팀 통계 조회 (슈퍼 관리자용)' })
  @ApiResponse({ status: 200, description: '전체 팀 통계 조회 성공' })
  async getAllTeamStats(@Req() req: any) {
    try {
      const user = req.user;

      // 슈퍼 관리자 권한 확인
      if (user.adminLevel !== 'SUPER_ADMIN') {
        throw new HttpException(
          '슈퍼 관리자 권한이 필요합니다.',
          HttpStatus.FORBIDDEN,
        );
      }

      // 모든 팀 조회
      const teams = await this.teamsService.findAll();

      // 🚀 최적화: 배치 처리로 성능 향상
      const teamStats = [];
      const batchSize = 5; // 동시 처리할 팀 수 제한

      for (let i = 0; i < teams.length; i += batchSize) {
        const batch = teams.slice(i, i + batchSize);
        const batchStats = await Promise.all(
          batch.map(async (team) => {
            try {
              const stats = await this.calculateTeamStats(team.id);
              return {
                teamId: team.id,
                teamName: team.name,
                teamCode: team.teamCode,
                ...stats,
              };
            } catch (error) {
              return {
                teamId: team.id,
                teamName: team.name,
                teamCode: team.teamCode,
                error: '통계 계산 실패',
              };
            }
          }),
        );
        teamStats.push(...batchStats);
      }

      return {
        success: true,
        data: teamStats,
        message: '전체 팀 통계를 성공적으로 조회했습니다.',
      };
    } catch (error) {
      console.error('❌ 전체 팀 통계 조회 실패:', error);
      return {
        success: false,
        error: error.message || '팀 통계 조회에 실패했습니다.',
      };
    }
  }

  /**
   * 특정 팀 통계 조회
   */
  @Get(':teamId')
  @UseGuards(TeamAccessGuard)
  @TeamAccess('VIEW_RESULTS')
  @ApiOperation({ summary: '특정 팀 통계 조회' })
  @ApiParam({ name: 'teamId', description: '팀 ID' })
  @ApiResponse({ status: 200, description: '팀 통계 조회 성공' })
  async getTeamStats(@Param('teamId') teamId: number, @Req() req: any) {
    try {
      const user = req.user;

      // 슈퍼 관리자이거나 해당 팀 관리자인 경우만 접근 가능
      if (user.adminLevel !== 'SUPER_ADMIN' && user.teamId !== teamId) {
        throw new HttpException(
          '해당 팀 통계 조회 권한이 없습니다.',
          HttpStatus.FORBIDDEN,
        );
      }

      const stats = await this.calculateTeamStats(teamId);
      const team = await this.teamsService.findOne(teamId);

      return {
        success: true,
        data: {
          teamId: team.id,
          teamName: team.name,
          teamCode: team.teamCode,
          ...stats,
        },
        message: '팀 통계를 성공적으로 조회했습니다.',
      };
    } catch (error) {
      console.error('❌ 팀 통계 조회 실패:', error);
      return {
        success: false,
        error: error.message || '팀 통계 조회에 실패했습니다.',
      };
    }
  }

  /**
   * 팀 통계 계산
   */
  private async calculateTeamStats(teamId: number) {
    try {
      // 팀별 훈련 결과 조회
      const trainingResults =
        await this.trainingResultService.getTrainingResultsByTeam(teamId);

      // 기본 통계 계산
      const totalTrainings = trainingResults.length;
      const completedTrainings = trainingResults.filter(
        (result) => result.completedAt,
      ).length;
      const totalScore = trainingResults.reduce(
        (sum, result) => sum + (result.totalScore || 0),
        0,
      );
      const averageScore = totalTrainings > 0 ? totalScore / totalTrainings : 0;

      // 시나리오별 통계
      const scenarioStats = trainingResults.reduce((acc, result) => {
        const scenarioId = result.scenarioId;
        if (!acc[scenarioId]) {
          acc[scenarioId] = {
            scenarioId,
            scenarioName: result.scenario?.title || '알 수 없음',
            count: 0,
            totalScore: 0,
            averageScore: 0,
          };
        }
        acc[scenarioId].count++;
        acc[scenarioId].totalScore += result.totalScore || 0;
        acc[scenarioId].averageScore =
          acc[scenarioId].totalScore / acc[scenarioId].count;
        return acc;
      }, {});

      // 사용자별 통계
      const userStats = trainingResults.reduce((acc, result) => {
        const userId = result.userId;
        if (!acc[userId]) {
          acc[userId] = {
            userId,
            userName: result.user?.name || '알 수 없음',
            userCode: result.user?.userCode || '',
            count: 0,
            totalScore: 0,
            averageScore: 0,
            bestScore: 0,
          };
        }
        acc[userId].count++;
        acc[userId].totalScore += result.totalScore || 0;
        acc[userId].averageScore = acc[userId].totalScore / acc[userId].count;
        acc[userId].bestScore = Math.max(
          acc[userId].bestScore,
          result.totalScore || 0,
        );
        return acc;
      }, {});

      // 최근 활동 (최근 30일)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentActivity = trainingResults.filter(
        (result) =>
          result.completedAt && new Date(result.completedAt) >= thirtyDaysAgo,
      ).length;

      return {
        totalTrainings,
        completedTrainings,
        completionRate:
          totalTrainings > 0 ? (completedTrainings / totalTrainings) * 100 : 0,
        totalScore,
        averageScore: Math.round(averageScore * 100) / 100,
        scenarioStats: Object.values(scenarioStats),
        userStats: Object.values(userStats),
        recentActivity,
        lastActivity:
          trainingResults.length > 0 ? trainingResults[0].completedAt : null,
      };
    } catch (error) {
      console.error('❌ 팀 통계 계산 실패:', error);
      throw error;
    }
  }
}
