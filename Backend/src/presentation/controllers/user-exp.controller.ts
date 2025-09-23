import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { UserExpService } from '../../application/services/user-exp.service';
import { UpdateUserExpDto } from '../dto/update-user-exp.dto';

@ApiTags('User Experience')
@Controller('user-exp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserExpController {
  constructor(private readonly userExpService: UserExpService) {}

  @Post('update')
  @ApiOperation({ summary: '사용자 경험치 및 레벨 업데이트' })
  @ApiResponse({
    status: 200,
    description: '사용자 경험치가 성공적으로 업데이트되었습니다.',
  })
  async updateUserExp(@Body() updateData: UpdateUserExpDto) {
    try {
      console.log('🔍 UserExpController.updateUserExp 호출됨');
      console.log('📝 받은 데이터:', updateData);

      const updatedUser = await this.userExpService.updateUserExp(updateData);

      console.log('✅ UserExpController.updateUserExp 성공:', {
        userId: updatedUser.id,
        newLevel: updatedUser.userLevel,
        newExp: updatedUser.userExp,
        tier: updatedUser.currentTier,
      });

      return {
        success: true,
        data: {
          id: updatedUser.id,
          userLevel: updatedUser.userLevel,
          userExp: updatedUser.userExp,
          currentTier: updatedUser.currentTier,
          levelProgress: updatedUser.levelProgress,
          nextLevelExp: updatedUser.nextLevelExp,
          totalScore: updatedUser.totalScore,
          completedScenarios: updatedUser.completedScenarios,
        },
        message: '경험치가 성공적으로 업데이트되었습니다.',
      };
    } catch (error) {
      console.error('❌ UserExpController.updateUserExp 실패:', error);
      return {
        success: false,
        error: error.message || '경험치 업데이트에 실패했습니다.',
      };
    }
  }

  @Get(':userId/info')
  @ApiOperation({ summary: '사용자 경험치 정보 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '사용자 경험치 정보를 성공적으로 조회했습니다.',
  })
  async getUserExpInfo(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ) {
    try {
      console.log('🔍 UserExpController.getUserExpInfo 호출됨:', { userId });

      const user = req.user;

      if (!user) {
        return { success: false, error: '인증이 필요합니다.' };
      }

      // 본인의 정보이거나 슈퍼 관리자인 경우
      if (user.id === userId || user.adminLevel === 'SUPER_ADMIN') {
        const expInfo = await this.userExpService.getUserExpInfo(userId);

        console.log('✅ UserExpController.getUserExpInfo 성공:', expInfo);

        return {
          success: true,
          data: expInfo,
          message: '사용자 경험치 정보를 성공적으로 조회했습니다.',
        };
      }

      // 팀 관리자인 경우 같은 팀의 사용자만 조회 가능
      if (user.adminLevel === 'TEAM_ADMIN' && user.teamId) {
        // 사용자 정보를 먼저 조회하여 팀 확인
        const targetUser = await this.userExpService.getUserById(userId);
        if (targetUser && targetUser.teamId === user.teamId) {
          const expInfo = await this.userExpService.getUserExpInfo(userId);

          console.log('✅ UserExpController.getUserExpInfo 성공:', expInfo);

          return {
            success: true,
            data: expInfo,
            message: '사용자 경험치 정보를 성공적으로 조회했습니다.',
          };
        } else {
          return {
            success: false,
            error: '해당 사용자의 경험치 정보 조회 권한이 없습니다.',
          };
        }
      }

      return {
        success: false,
        error: '사용자 경험치 정보 조회 권한이 없습니다.',
      };
    } catch (error) {
      console.error('❌ UserExpController.getUserExpInfo 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 경험치 정보 조회에 실패했습니다.',
      };
    }
  }
}
