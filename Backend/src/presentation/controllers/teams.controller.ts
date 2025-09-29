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
  ApiParam,
} from '@nestjs/swagger';
import { TeamsService } from '../../application/services/teams.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Public } from '../../shared/decorators/public.decorator';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: '새 팀 생성' })
  @ApiResponse({ status: 201, description: '팀 생성 성공' })
  async create(@Body() createTeamDto: CreateTeamDto) {
    try {
      const team = await this.teamsService.create(createTeamDto);
      return {
        success: true,
        data: team,
        message: '팀이 성공적으로 생성되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || '팀 생성에 실패했습니다.',
        message: '팀 생성 실패',
      };
    }
  }

  @Get()
  @ApiOperation({ summary: '모든 팀 조회' })
  @ApiResponse({ status: 200, description: '팀 목록 조회 성공' })
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 팀 조회' })
  @ApiResponse({ status: 200, description: '팀 조회 성공' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '팀 정보 수정' })
  @ApiResponse({ status: 200, description: '팀 수정 성공' })
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(+id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '팀 삭제' })
  @ApiResponse({ status: 200, description: '팀 삭제 성공' })
  remove(@Param('id') id: string) {
    return this.teamsService.remove(+id);
  }

  @Get('validate-code/:teamCode')
  @Public() // 인증 없이 접근 가능 (회원가입 시 팀 코드 검증용)
  @ApiOperation({
    summary: '팀 코드 유효성 검증',
    description:
      '회원가입 시 팀 코드의 유효성을 검증합니다. AWS 호스팅 환경에서 활성 팀만 조회됩니다.',
  })
  @ApiParam({
    name: 'teamCode',
    description: '검증할 팀 코드 (예: TEAM001)',
    example: 'TEAM001',
  })
  @ApiResponse({
    status: 200,
    description: '팀 코드 검증 결과',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', description: '팀 코드 유효성' },
        team: {
          type: 'object',
          description: '팀 정보 (유효한 경우만)',
          properties: {
            id: { type: 'number', description: '팀 ID' },
            name: { type: 'string', description: '팀 이름' },
            description: { type: 'string', description: '팀 설명' },
            teamCode: { type: 'string', description: '팀 코드' },
          },
        },
        message: {
          type: 'string',
          description: '오류 메시지 (유효하지 않은 경우)',
        },
      },
    },
  })
  async validateTeamCode(@Param('teamCode') teamCode: string) {
    const result = await this.teamsService.validateTeamCode(teamCode);
    return result;
  }
}
