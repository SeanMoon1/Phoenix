import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserProgressService } from './user-progress.service';
import { UserProgress } from '../../database/entities/user-progress.entity';
import { Achievement } from '../../database/entities/achievement.entity';

@ApiTags('User Progress')
@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post()
  @ApiOperation({ summary: '사용자 진행상황 생성' })
  @ApiResponse({
    status: 201,
    description: '사용자 진행상황이 생성되었습니다.',
  })
  async createUserProgress(@Body() data: Partial<UserProgress>) {
    return this.userProgressService.createUserProgress(data);
  }

  @Get(':userId')
  @ApiOperation({ summary: '사용자 진행상황 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 진행상황' })
  async getUserProgress(@Param('userId') userId: number) {
    return this.userProgressService.getUserProgress(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: '사용자 진행상황 업데이트' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '사용자 진행상황이 업데이트되었습니다.',
  })
  async updateUserProgress(
    @Param('userId') userId: number,
    @Body() data: Partial<UserProgress>,
  ) {
    return this.userProgressService.updateUserProgress(userId, data);
  }

  @Post(':userId/experience')
  @ApiOperation({ summary: '경험치 추가' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '경험치가 추가되었습니다.' })
  async addExperience(
    @Param('userId') userId: number,
    @Body() data: { expGained: number; reason?: string; scenarioId?: number },
  ) {
    return this.userProgressService.addExperience(
      userId,
      data.expGained,
      data.reason,
      data.scenarioId,
    );
  }

  @Get(':userId/achievements')
  @ApiOperation({ summary: '사용자 성취 목록 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 성취 목록' })
  async getUserAchievements(@Param('userId') userId: number) {
    return this.userProgressService.getUserAchievements(userId);
  }

  @Post('achievements')
  @ApiOperation({ summary: '성취 생성' })
  @ApiResponse({ status: 201, description: '성취가 생성되었습니다.' })
  async createAchievement(@Body() data: Partial<Achievement>) {
    return this.userProgressService.createAchievement(data);
  }

  @Put('achievements/:userId/:achievementType')
  @ApiOperation({ summary: '성취 진행도 업데이트' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiParam({ name: 'achievementType', description: '성취 유형' })
  @ApiResponse({
    status: 200,
    description: '성취 진행도가 업데이트되었습니다.',
  })
  async updateAchievementProgress(
    @Param('userId') userId: number,
    @Param('achievementType') achievementType: string,
    @Body() data: { progress: number },
  ) {
    return this.userProgressService.updateAchievementProgress(
      userId,
      achievementType,
      data.progress,
    );
  }

  @Get(':userId/scenario-stats')
  @ApiOperation({ summary: '사용자 시나리오별 통계 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '시나리오별 통계' })
  async getUserScenarioStats(@Param('userId') userId: number) {
    return this.userProgressService.getUserScenarioStats(userId);
  }

  @Post(':userId/scenario-stats')
  @ApiOperation({ summary: '시나리오 통계 업데이트' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '시나리오 통계가 업데이트되었습니다.',
  })
  async updateScenarioStats(
    @Param('userId') userId: number,
    @Body()
    data: {
      teamId: number;
      scenarioType: string;
      score: number;
      timeSpent: number;
    },
  ) {
    return this.userProgressService.updateScenarioStats(
      userId,
      data.teamId,
      data.scenarioType,
      data.score,
      data.timeSpent,
    );
  }

  @Get(':userId/level-history')
  @ApiOperation({ summary: '레벨업 히스토리 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '레벨업 히스토리' })
  async getLevelHistory(@Param('userId') userId: number) {
    return this.userProgressService.getLevelHistory(userId);
  }
}
