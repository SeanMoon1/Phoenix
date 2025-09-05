import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Teams')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: '새 팀 생성' })
  @ApiResponse({ status: 201, description: '팀 생성 성공' })
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
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
}

