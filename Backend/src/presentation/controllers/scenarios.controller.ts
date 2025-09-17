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
import { ScenariosService } from '../../application/services/scenarios.service';
import { CreateScenarioDto } from '../dto/create-scenario.dto';
import { UpdateScenarioDto } from '../dto/update-scenario.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Scenarios')
@Controller('scenarios')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScenariosController {
  constructor(private readonly scenariosService: ScenariosService) {}

  @Post()
  @ApiOperation({ summary: '새 시나리오 생성' })
  @ApiResponse({ status: 201, description: '시나리오 생성 성공' })
  create(@Body() createScenarioDto: CreateScenarioDto) {
    return this.scenariosService.create(createScenarioDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 시나리오 조회' })
  @ApiResponse({ status: 200, description: '시나리오 목록 조회 성공' })
  findAll() {
    return this.scenariosService.findAll();
  }

  @Get('type/:disasterType')
  @ApiOperation({ summary: '재난 유형별 시나리오 조회' })
  @ApiResponse({
    status: 200,
    description: '재난 유형별 시나리오 목록 조회 성공',
  })
  findByType(@Param('disasterType') disasterType: string) {
    return this.scenariosService.findByDisasterType(disasterType);
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 시나리오 조회' })
  @ApiResponse({ status: 200, description: '시나리오 조회 성공' })
  findOne(@Param('id') id: string) {
    return this.scenariosService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '시나리오 정보 수정' })
  @ApiResponse({ status: 200, description: '시나리오 수정 성공' })
  update(
    @Param('id') id: string,
    @Body() updateScenarioDto: UpdateScenarioDto,
  ) {
    return this.scenariosService.update(+id, updateScenarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '시나리오 삭제' })
  @ApiResponse({ status: 200, description: '시나리오 삭제 성공' })
  remove(@Param('id') id: string) {
    return this.scenariosService.remove(+id);
  }
}
