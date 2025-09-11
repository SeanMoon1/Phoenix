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
import { ScenariosService } from '../../application/services/scenarios.service';
import { CreateScenarioDto } from '../dto/create-scenario.dto';
import { UpdateScenarioDto } from '../dto/update-scenario.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Public } from '../../shared/decorators/public.decorator';

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
  @Public() // 시나리오 조회는 인증 없이 가능
  @ApiOperation({ summary: '모든 시나리오 조회' })
  @ApiResponse({ status: 200, description: '시나리오 목록 조회 성공' })
  @ApiQuery({
    name: 'disasterType',
    required: false,
    description: '재난 유형으로 필터링',
  })
  findAll(@Query('disasterType') disasterType?: string) {
    if (disasterType) {
      return this.scenariosService.findByDisasterType(disasterType);
    }
    return this.scenariosService.findAll();
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
