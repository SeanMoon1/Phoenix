import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TrainingService } from '../../application/services/training.service';
import { CreateTrainingSessionDto } from '../dto/create-training-session.dto';
import { UpdateTrainingSessionDto } from '../dto/update-training-session.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

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
    console.log('🔍 TrainingController.create 호출됨');
    console.log('📝 받은 훈련 세션 데이터:', {
      sessionName: createTrainingSessionDto.sessionName,
      scenarioId: createTrainingSessionDto.scenarioId,
      teamId: createTrainingSessionDto.teamId,
      startTime: createTrainingSessionDto.startTime,
      endTime: createTrainingSessionDto.endTime,
      status: createTrainingSessionDto.status,
      createdBy: createTrainingSessionDto.createdBy,
    });

    try {
      const result = this.trainingService.create(createTrainingSessionDto);
      console.log('✅ TrainingController.create 성공');
      return result;
    } catch (error) {
      console.error('❌ TrainingController.create 실패:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: '모든 훈련 세션 조회' })
  @ApiResponse({ status: 200, description: '훈련 세션 목록 조회 성공' })
  findAll() {
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
}
