import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TrainingResultService } from '../../application/services/training-result.service';
import { CreateTrainingResultDto } from '../dto/create-training-result.dto';
import { UserStatsResponseDto } from '../dto/user-stats-response.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Training Result')
@Controller('training-result')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingResultController {
  constructor(private readonly trainingResultService: TrainingResultService) {}

  @Post()
  @ApiOperation({ summary: '훈련 결과 저장' })
  @ApiResponse({ status: 201, description: '훈련 결과 저장 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  create(@Body() createTrainingResultDto: CreateTrainingResultDto) {
    return this.trainingResultService.createTrainingResult(
      createTrainingResultDto,
    );
  }

  @Get('user/:userId/stats')
  @ApiOperation({ summary: '사용자 개인 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 통계 조회 성공',
    type: UserStatsResponseDto,
  })
  @ApiResponse({ status: 404, description: '사용자를 찾을 수 없음' })
  getUserStats(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new Error('Invalid userId parameter');
    }
    return this.trainingResultService.getUserStats(userIdNum);
  }

  @Get('user/:userId/history')
  @ApiOperation({ summary: '사용자 훈련 기록 조회' })
  @ApiResponse({ status: 200, description: '훈련 기록 조회 성공' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '조회할 개수 (기본값: 20)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: '건너뛸 개수 (기본값: 0)',
  })
  getUserTrainingHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new Error('Invalid userId parameter');
    }
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    if (isNaN(limitNum) || isNaN(offsetNum)) {
      throw new Error('Invalid limit or offset parameter');
    }

    return this.trainingResultService.getUserTrainingHistory(
      userIdNum,
      limitNum,
      offsetNum,
    );
  }

  @Get('my/stats')
  @ApiOperation({ summary: '내 통계 조회 (현재 로그인한 사용자)' })
  @ApiResponse({
    status: 200,
    description: '내 통계 조회 성공',
    type: UserStatsResponseDto,
  })
  getMyStats(@Request() req: any) {
    return this.trainingResultService.getUserStats(req.user.id);
  }

  @Get('my/history')
  @ApiOperation({ summary: '내 훈련 기록 조회 (현재 로그인한 사용자)' })
  @ApiResponse({ status: 200, description: '훈련 기록 조회 성공' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '조회할 개수 (기본값: 20)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: '건너뛸 개수 (기본값: 0)',
  })
  getMyTrainingHistory(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    if (isNaN(limitNum) || isNaN(offsetNum)) {
      throw new Error('Invalid limit or offset parameter');
    }

    return this.trainingResultService.getUserTrainingHistory(
      req.user.id,
      limitNum,
      offsetNum,
    );
  }
}
