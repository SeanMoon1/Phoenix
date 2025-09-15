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
import { UsersService } from '../../application/services/users.service';
import { TeamsService } from '../../application/services/teams.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
  ) {}

  @Post()
  @ApiOperation({ summary: '새 사용자 생성' })
  @ApiResponse({ status: 201, description: '사용자 생성 성공' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: '모든 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 목록 조회 성공' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiResponse({ status: 200, description: '사용자 조회 성공' })
  findOne(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new Error('Invalid id parameter');
    }
    return this.usersService.findOne(idNum);
  }

  @Patch(':id')
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiResponse({ status: 200, description: '사용자 수정 성공' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new Error('Invalid id parameter');
    }
    return this.usersService.update(idNum, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({ status: 200, description: '사용자 삭제 성공' })
  remove(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      throw new Error('Invalid id parameter');
    }
    return this.usersService.remove(idNum);
  }

  @Post(':id/join-team')
  @ApiOperation({
    summary: '사용자 팀 가입',
    description: '로그인한 사용자가 팀 코드로 팀에 가입합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '팀 가입 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', description: '가입 성공 여부' },
        message: { type: 'string', description: '결과 메시지' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 팀 코드 또는 이미 가입된 팀',
  })
  async joinTeam(@Param('id') id: string, @Body() body: { teamCode: string }) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user id parameter');
    }
    return this.teamsService.joinTeam(body.teamCode, userId);
  }

  @Get(':id/team')
  @ApiOperation({
    summary: '사용자 팀 정보 조회',
    description: '사용자가 소속된 팀 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '팀 정보 조회 성공',
  })
  async getUserTeam(@Param('id') id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      throw new Error('Invalid user id parameter');
    }

    const user = await this.usersService.findOne(userId);
    if (!user.teamId) {
      return { team: null, message: '소속된 팀이 없습니다.' };
    }

    return this.teamsService.findOne(user.teamId);
  }
}
