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
    console.log('🎯 AuthController.login 호출됨');
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '사용자 정보 조회 성공' })
  async getMe(@Request() req) {
    try {
      const user = await this.authService.getUserById(req.user.id);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || '사용자 정보를 가져올 수 없습니다.',
      };
    }
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
}
