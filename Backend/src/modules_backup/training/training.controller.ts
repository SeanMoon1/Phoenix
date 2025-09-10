import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from './dto/update-training-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Training')
@Controller('training')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({ summary: '새 훈련 세션 생성' })
  @ApiResponse({ status: 201, description: '훈련 세션 생성 성공' })
  create(@Body() createTrainingSessionDto: CreateTrainingSessionDto) {
    return this.trainingService.create(createTrainingSessionDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 훈련 세션 조회' })
  @ApiResponse({ status: 200, description: '훈련 세션 목록 조회 성공' })
  @ApiQuery({ name: 'teamId', required: false, description: '팀 ID로 필터링' })
  findAll(@Query('teamId') teamId?: string) {
    if (teamId) {
      return this.trainingService.findByTeam(+teamId);
    }
    return this.trainingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 훈련 세션 조회' })
  @ApiResponse({ status: 200, description: '훈련 세션 조회 성공' })
  findOne(@Param('id') id: string) {
    return this.trainingService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '훈련 세션 정보 수정' })
  @ApiResponse({ status: 200, description: '훈련 세션 수정 성공' })
  update(
    @Param('id') id: string,
    @Body() updateTrainingSessionDto: UpdateTrainingSessionDto,
  ) {
    return this.trainingService.update(+id, updateTrainingSessionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '훈련 세션 삭제' })
  @ApiResponse({ status: 200, description: '훈련 세션 삭제 성공' })
  remove(@Param('id') id: string) {
    return this.trainingService.remove(+id);
  }

  @Post('join/:sessionCode')
  @Public() // 세션 코드로 참가할 때는 인증 불필요
  @ApiOperation({ summary: '훈련 세션 참가' })
  @ApiResponse({ status: 201, description: '세션 참가 성공' })
  @ApiResponse({
    status: 400,
    description: '이미 참가한 세션이거나 유효하지 않은 세션 코드',
  })
  joinSession(
    @Param('sessionCode') sessionCode: string,
    @Body('userId') userId: number,
  ) {
    return this.trainingService.joinSession(sessionCode, userId);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: '세션 참가자 목록 조회' })
  @ApiResponse({ status: 200, description: '참가자 목록 조회 성공' })
  getSessionParticipants(@Param('id') id: string) {
    return this.trainingService.getSessionParticipants(+id);
  }

  @Get('stats/team/:teamId')
  @ApiOperation({ summary: '팀별 훈련 통계 조회 (관리자용)' })
  @ApiResponse({ status: 200, description: '팀 통계 조회 성공' })
  getTeamStats(@Param('teamId') teamId: string) {
    return this.trainingService.getTeamStats(+teamId);
  }
}
