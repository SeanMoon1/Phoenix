import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../../application/services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TeamsService } from '../../application/services/teams.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly teamsService: TeamsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createUser(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    try {
      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 슈퍼 관리자만 사용자 생성 가능
      if (user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: '사용자 생성 권한이 없습니다. 슈퍼 관리자만 접근 가능합니다.',
        };
      }

      const result = await this.usersService.createUser(createUserDto);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        data: result.user,
        message: 'User created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('id') id: string, @Req() req: any) {
    try {
      const user = req.user;
      const userId = parseInt(id);

      // 권한 체크: 본인 또는 관리자만 조회 가능
      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 본인의 정보이거나 슈퍼 관리자인 경우
      if (user.id === userId || user.adminLevel === 'SUPER_ADMIN') {
        const result = await this.usersService.getUser(userId);

        if (!result.success) {
          return {
            success: false,
            error: result.error,
          };
        }

        return {
          success: true,
          data: result.user,
        };
      }

      // 팀 관리자인 경우 같은 팀의 사용자만 조회 가능
      if (user.adminLevel === 'TEAM_ADMIN' && user.teamId) {
        const result = await this.usersService.getUser(userId);

        if (!result.success) {
          return {
            success: false,
            error: result.error,
          };
        }

        // 같은 팀인지 확인
        if (result.user.teamId === user.teamId) {
          return {
            success: true,
            data: result.user,
          };
        } else {
          return {
            success: false,
            error: '해당 사용자 정보 조회 권한이 없습니다.',
          };
        }
      }

      return {
        success: false,
        error: '사용자 정보 조회 권한이 없습니다.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(@Req() req: any) {
    try {
      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 슈퍼 관리자만 모든 사용자 조회 가능
      if (user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error:
            '모든 사용자 조회 권한이 없습니다. 슈퍼 관리자만 접근 가능합니다.',
        };
      }

      const users = await this.usersService.getAllUsers();
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    try {
      const user = req.user;
      const userId = parseInt(id);

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 본인의 정보이거나 슈퍼 관리자인 경우만 수정 가능
      if (user.id === userId || user.adminLevel === 'SUPER_ADMIN') {
        const result = await this.usersService.updateUser(
          userId,
          updateUserDto,
        );

        if (!result.success) {
          return {
            success: false,
            error: result.error,
          };
        }

        return {
          success: true,
          data: result.user,
          message: 'User updated successfully',
        };
      }

      return {
        success: false,
        error: '사용자 정보 수정 권한이 없습니다.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post(':id/join-team')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '사용자 팀 가입' })
  @ApiResponse({ status: 200, description: '팀 가입 성공' })
  @ApiResponse({ status: 400, description: '잘못된 팀 코드' })
  async joinTeam(
    @Param('id') id: string,
    @Body() body: { teamCode: string },
    @Req() req: any,
  ) {
    try {
      const user = req.user;
      const userId = parseInt(id);

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 본인의 정보이거나 슈퍼 관리자인 경우만 수정 가능
      if (user.id !== userId && user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: '팀 가입 권한이 없습니다.',
        };
      }

      // 팀 코드 유효성 검증
      const teamValidation = await this.teamsService.validateTeamCode(
        body.teamCode,
      );

      if (!teamValidation.valid) {
        return {
          success: false,
          error: teamValidation.message || '유효하지 않은 팀 코드입니다.',
        };
      }

      // 사용자 정보 업데이트 (팀 ID 설정)
      const result = await this.usersService.updateUser(userId, {
        teamId: teamValidation.team?.id,
        // 팀 가입 시 자동으로 팀 관리자 권한 부여 (선택사항)
        // adminLevel: 'TEAM_ADMIN',
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return {
        success: true,
        data: result.user,
        message: '팀 가입이 완료되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    try {
      const user = req.user;
      const userId = parseInt(id);

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 슈퍼 관리자만 사용자 삭제 가능
      if (user.adminLevel !== 'SUPER_ADMIN') {
        return {
          success: false,
          error: '사용자 삭제 권한이 없습니다. 슈퍼 관리자만 접근 가능합니다.',
        };
      }

      await this.usersService.deleteUser(userId);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
