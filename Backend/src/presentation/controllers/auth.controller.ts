import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { OAuthRegisterDto } from '../dto/oauth-register.dto';
import { FindIdDto } from '../dto/find-id.dto';
import {
  RequestPasswordResetDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
} from '../dto/reset-password.dto';
import {
  RequestAccountDeletionDto,
  VerifyDeletionCodeDto,
  DeleteAccountDto,
} from '../dto/delete-account.dto';
import { LocalAuthGuard } from '../../shared/guards/local-auth.guard';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '사용자 회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 Refresh Token' })
  async refreshToken(@Body() body: { refresh_token: string }) {
    console.log('🔄 토큰 갱신 요청');
    return this.authService.refreshToken(body.refresh_token);
  }

  @Post('oauth/register')
  @ApiOperation({ summary: 'OAuth 회원가입 및 로그인' })
  @ApiResponse({ status: 201, description: 'OAuth 회원가입 및 로그인 성공' })
  @ApiResponse({ status: 400, description: '잘못된 OAuth 정보' })
  async oauthRegister(@Body() oauthRegisterDto: OAuthRegisterDto) {
    return this.authService.oauthRegisterAndLogin(oauthRegisterDto);
  }

  @Get('check-login-id/:loginId')
  @ApiOperation({ summary: '로그인 ID 중복 확인' })
  @ApiResponse({
    status: 200,
    description: '로그인 ID 중복 확인 결과',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            available: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
      },
    },
  })
  async checkLoginIdAvailability(@Param('loginId') loginId: string) {
    return this.authService.checkLoginIdAvailability(loginId);
  }

  @Post('find-id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '아이디 찾기' })
  @ApiResponse({ status: 200, description: '아이디 찾기 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async findId(@Body() findIdDto: FindIdDto) {
    return this.authService.findId(findIdDto);
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정 요청' })
  @ApiResponse({ status: 200, description: '인증 코드 전송 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    return this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '인증 코드 검증' })
  @ApiResponse({ status: 200, description: '인증 코드 검증 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async verifyResetCode(@Body() verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({ status: 200, description: '비밀번호 재설정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('redis/health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Redis 헬스체크' })
  @ApiResponse({ status: 200, description: 'Redis 상태 확인' })
  async checkRedisHealth() {
    return this.authService.checkRedisHealth();
  }

  @Post('request-account-deletion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴 요청 (이메일 인증 코드 전송)' })
  @ApiResponse({ status: 200, description: '인증 코드 전송 결과' })
  async requestAccountDeletion(
    @Body() requestDeletionDto: RequestAccountDeletionDto,
  ) {
    return this.authService.requestAccountDeletion(requestDeletionDto);
  }

  @Post('verify-deletion-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴 인증 코드 검증' })
  @ApiResponse({ status: 200, description: '인증 코드 검증 결과' })
  async verifyDeletionCode(
    @Body() verifyDeletionCodeDto: VerifyDeletionCodeDto,
  ) {
    return this.authService.verifyDeletionCode(verifyDeletionCodeDto);
  }

  @Post('delete-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴 실행' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 결과' })
  async deleteAccount(@Body() deleteAccountDto: DeleteAccountDto) {
    return this.authService.deleteAccount(deleteAccountDto);
  }
}
