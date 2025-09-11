import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
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
  @ApiOperation({ summary: '사용자 회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  async login(@Body() loginDto: LoginDto, @Request() req) {
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

  @Post('oauth/register')
  @ApiOperation({ summary: 'OAuth 회원가입 및 로그인' })
  @ApiResponse({ status: 201, description: 'OAuth 회원가입 및 로그인 성공' })
  @ApiResponse({ status: 400, description: '잘못된 OAuth 정보' })
  async oauthRegister(@Body() oauthRegisterDto: OAuthRegisterDto) {
    return this.authService.oauthRegisterAndLogin(oauthRegisterDto);
  }
}
