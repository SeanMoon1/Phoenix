import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
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
import { TeamAccessGuard } from '../../shared/guards/team-access.guard';
import { TeamAccess } from '../../shared/decorators/team-access.decorator';

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
      return { success: true, data: result };
    } catch (error) {
      console.error(
        '❌ TrainingResultController.createTrainingResult 실패:',
        error,
      );
      return { success: false, error: error.message };
    }
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '사용자별 훈련 결과 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 훈련 결과 목록' })
  async getTrainingResultsByUser(
    @Param('userId') userId: number,
    @Req() req: any,
  ) {
    try {
      const user = req.user;

      console.log('🔍 훈련 결과 조회 권한 검증:', {
        userId: userId,
        userFromToken: user,
        userType: typeof user,
        userIdType: typeof userId,
        userFromTokenId: user?.id,
        userFromTokenIdType: typeof user?.id,
        comparison: user?.id === userId,
        strictComparison: user?.id === Number(userId),
      });

      // 권한 체크: 본인 또는 팀 관리자만 조회 가능
      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 본인의 결과인 경우 (팀과 관계없이 조회 가능)
      if (user.id === userId) {
        const results =
          await this.trainingResultService.getTrainingResultsByUser(userId);
        return { success: true, data: results };
      }

      // 슈퍼 관리자인 경우 모든 사용자 결과 조회 가능
      if (user.adminLevel === 'SUPER_ADMIN') {
        const results =
          await this.trainingResultService.getTrainingResultsByUser(userId);
        return { success: true, data: results };
      }

      // 팀 관리자인 경우 팀원의 결과만 조회 가능
      if (user.adminLevel === 'TEAM_ADMIN' && user.teamId) {
        // 요청한 사용자가 같은 팀에 속하는지 확인
        const targetUser = await this.trainingResultService.getUserById(userId);
        if (targetUser && targetUser.teamId === user.teamId) {
          const results =
            await this.trainingResultService.getTrainingResultsByUser(userId);
          return { success: true, data: results };
        } else {
          return {
            success: false,
            error: '해당 사용자의 훈련 결과 조회 권한이 없습니다.',
          };
        }
      }

      return { success: false, error: '훈련 결과 조회 권한이 없습니다.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
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
    try {
      const stats =
        await this.trainingResultService.getTrainingStatistics(userId);
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
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

  @Get('team/:teamId')
  @ApiOperation({ summary: '팀별 훈련 결과 조회 (팀 관리자용)' })
  @ApiParam({ name: 'teamId', description: '팀 ID' })
  @ApiResponse({ status: 200, description: '팀 훈련 결과 목록' })
  @UseGuards(TeamAccessGuard)
  @TeamAccess('VIEW_RESULTS')
  async getTrainingResultsByTeam(@Param('teamId') teamId: number) {
    try {
      const results =
        await this.trainingResultService.getTrainingResultsByTeam(teamId);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
