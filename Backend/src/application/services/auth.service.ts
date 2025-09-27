import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { TeamsService } from './teams.service';
import { EmailService } from './email.service';
import { MemoryAuthService } from './memory-auth.service';
import { JwtSecurityService } from './jwt-security.service';
import { RefreshTokenService } from './refresh-token.service';
import { RegisterDto } from '../../presentation/dto/register.dto';
import { OAuthRegisterDto } from '../../presentation/dto/oauth-register.dto';
import { FindIdDto } from '../../presentation/dto/find-id.dto';
import {
  RequestPasswordResetDto,
  VerifyResetCodeDto,
  ResetPasswordDto,
} from '../../presentation/dto/reset-password.dto';
import {
  RequestAccountDeletionDto,
  VerifyDeletionCodeDto,
  DeleteAccountDto,
} from '../../presentation/dto/delete-account.dto';
import { PasswordUtil } from '../../utils/password.util';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private teamsService: TeamsService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private memoryAuthService: MemoryAuthService,
    private jwtSecurityService: JwtSecurityService,
    private refreshTokenService: RefreshTokenService,
    private configService: ConfigService,
  ) {}

  async validateUser(loginId: string, password: string): Promise<any> {
    const user = await this.usersService.findByLoginId(loginId);

    if (user) {
      const isPasswordValid = await PasswordUtil.comparePassword(
        password,
        user.password,
      );

      if (isPasswordValid) {
        const { password: _, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const tokenPair = await this.refreshTokenService.generateTokenPair(
      user.id,
      user.loginId,
      user.teamId,
      null,
      false,
    );

    const response = {
      success: true,
      message: '로그인이 성공적으로 완료되었습니다.',
      data: {
        access_token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        expires_in: tokenPair.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          userLevel: user.userLevel,
          userExp: user.userExp,
          totalScore: user.totalScore,
          completedScenarios: user.completedScenarios,
          currentTier: user.currentTier,
          levelProgress: user.levelProgress,
          nextLevelExp: user.nextLevelExp,
        },
      },
    };

    return response;
  }

  async logout(token: string, userId: number) {
    try {
      await this.jwtSecurityService.invalidateToken(token, userId);
      await this.jwtSecurityService.invalidateAllUserTokens(userId);
      await this.jwtSecurityService.logSecurityEvent('USER_LOGOUT', {
        userId,
        token: token.substring(0, 20) + '...',
      });

      return {
        success: true,
        message: '로그아웃이 성공적으로 완료되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '로그아웃 처리 중 오류가 발생했습니다.',
      };
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const validation =
        await this.refreshTokenService.validateRefreshToken(refreshToken);

      if (!validation.valid || !validation.userId || !validation.loginId) {
        return {
          success: false,
          message: '유효하지 않은 Refresh Token입니다.',
        };
      }

      const user = await this.usersService.findById(validation.userId);
      if (!user) {
        return {
          success: false,
          message: '사용자 정보를 찾을 수 없습니다.',
        };
      }

      const newAccessToken = await this.refreshTokenService.generateAccessToken(
        user.id,
        user.loginId,
        user.teamId,
        null,
        false,
      );

      return {
        success: true,
        message: '토큰이 성공적으로 갱신되었습니다.',
        data: {
          access_token: newAccessToken,
          expires_in: 15 * 60,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '토큰 갱신 중 오류가 발생했습니다.',
      };
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      const passwordStrength = PasswordUtil.getPasswordStrength(
        registerDto.password,
      );

      if (passwordStrength.score < 4) {
        throw new BadRequestException({
          message: '비밀번호가 너무 약합니다.',
          feedback: passwordStrength.feedback,
        });
      }

      const hashedPassword = await PasswordUtil.hashPassword(
        registerDto.password,
      );

      const user = await this.usersService.create({
        ...registerDto,
        userCode: `USER${Date.now()}`,
        password: hashedPassword,
        oauthProvider: null,
        oauthProviderId: null,
        profileImageUrl: null,
      });

      if (!user) {
        throw new BadRequestException({
          message: '사용자 생성에 실패했습니다.',
          error: 'User creation failed',
        });
      }

      const { password: _, ...result } = user;
      return {
        success: true,
        message: '회원가입이 성공적으로 완료되었습니다.',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: '회원가입 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  }

  /**
   * ✅ OAuth 회원가입 및 로그인 (Refresh Token 시스템 통일)
   */
  async oauthRegisterAndLogin(oauthRegisterDto: OAuthRegisterDto) {
    try {
      let user = await this.usersService.findByEmail(oauthRegisterDto.email);

      if (!user) {
        user = await this.usersService.findByOAuthProvider(
          oauthRegisterDto.oauthProvider,
          oauthRegisterDto.oauthProviderId,
        );
      }

      if (!user) {
        const autoGeneratedLoginId = await this.generateUniqueLoginId(
          oauthRegisterDto.email,
        );

        user = await this.usersService.create({
          loginId: autoGeneratedLoginId,
          name: oauthRegisterDto.name,
          email: oauthRegisterDto.email,
          password: '',
          teamId: null,
          userCode: null,
          oauthProvider: oauthRegisterDto.oauthProvider,
          oauthProviderId: oauthRegisterDto.oauthProviderId,
        });
      } else {
        user.oauthProvider = oauthRegisterDto.oauthProvider;
        user.oauthProviderId = oauthRegisterDto.oauthProviderId;
        user = await this.usersService.update(user.id, user);
      }

      const tokenPair = await this.refreshTokenService.generateTokenPair(
        user.id,
        user.loginId,
        user.teamId,
        null,
        false,
      );

      return {
        success: true,
        message: 'OAuth 로그인 성공',
        access_token: tokenPair.accessToken,
        refresh_token: tokenPair.refreshToken,
        expires_in: tokenPair.expiresIn,
        user,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async checkLoginIdAvailability(loginId: string) {
    try {
      const existingUser = await this.usersService.findByLoginId(loginId);

      return {
        success: true,
        data: {
          available: !existingUser,
          message: existingUser
            ? '이미 사용 중인 로그인 ID입니다.'
            : '사용 가능한 로그인 ID입니다.',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: '로그인 ID 확인 중 오류가 발생했습니다.',
      };
    }
  }

  private async generateUniqueLoginId(email: string): Promise<string> {
    const baseId = email.split('@')[0].toLowerCase();
    let loginId = baseId;
    let counter = 1;

    while (await this.usersService.findByLoginId(loginId)) {
      loginId = `${baseId}${counter}`;
      counter++;
    }

    return loginId;
  }

  async findId(findIdDto: FindIdDto) {
    try {
      const user = await this.usersService.findByEmail(findIdDto.email);

      if (!user || user.name !== findIdDto.name) {
        return {
          success: false,
          message: '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.',
        };
      }

      return {
        success: true,
        message: '아이디를 찾았습니다.',
        data: {
          loginId: user.loginId,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '아이디 찾기 중 오류가 발생했습니다.',
      };
    }
  }

  async requestPasswordReset(requestPasswordResetDto: RequestPasswordResetDto) {
    try {
      const existingData = await this.memoryAuthService.getResetCode(
        requestPasswordResetDto.email,
      );

      if (existingData) {
        const now = Date.now();
        const codeAge = now - existingData.timestamp;
        const minInterval =
          this.configService.get<number>('REDIS_RATE_LIMIT', 60) * 1000;

        if (codeAge < minInterval) {
          return {
            success: false,
            message:
              '인증 코드 요청 간격이 너무 짧습니다. 잠시 후 다시 시도해주세요.',
          };
        }
      }

      const user = await this.usersService.findByEmail(
        requestPasswordResetDto.email,
      );

      if (!user) {
        return {
          success: false,
          message: '입력하신 이메일로 등록된 계정을 찾을 수 없습니다.',
        };
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const hashedCode = await PasswordUtil.hashPassword(verificationCode);

      await this.memoryAuthService.setResetCode(
        requestPasswordResetDto.email,
        {
          hashedCode: hashedCode,
          userId: user.id,
          attempts: 0,
        },
        600,
      );

      const emailSent = await this.emailService.sendPasswordResetCode(
        requestPasswordResetDto.email,
        user.name,
        verificationCode,
      );

      if (!emailSent) {
        return {
          success: false,
          message: '인증 코드 전송에 실패했습니다. 다시 시도해주세요.',
        };
      }

      return {
        success: true,
        message: '인증 코드가 이메일로 전송되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '비밀번호 재설정 요청 중 오류가 발생했습니다.',
      };
    }
  }

  async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto) {
    try {
      const resetData = await this.memoryAuthService.getResetCode(
        verifyResetCodeDto.email,
      );

      if (!resetData) {
        return {
          success: false,
          message: '인증 코드가 만료되었습니다. 다시 요청해주세요.',
        };
      }

      const maxAttempts = this.configService.get<number>(
        'REDIS_MAX_ATTEMPTS',
        5,
      );
      if (resetData.attempts >= maxAttempts) {
        await this.memoryAuthService.deleteResetCode(verifyResetCodeDto.email);
        return {
          success: false,
          message: '인증 코드 시도 횟수를 초과했습니다. 다시 요청해주세요.',
        };
      }

      const now = Date.now();
      const codeAge = now - resetData.timestamp;
      const maxAge = this.configService.get<number>('REDIS_TTL', 600) * 1000;

      if (codeAge > maxAge) {
        await this.memoryAuthService.deleteResetCode(verifyResetCodeDto.email);
        return {
          success: false,
          message: '인증 코드가 만료되었습니다. 다시 요청해주세요.',
        };
      }

      const isCodeValid = await PasswordUtil.comparePassword(
        verifyResetCodeDto.code,
        resetData.hashedCode,
      );

      if (!isCodeValid) {
        await this.memoryAuthService.updateResetCode(verifyResetCodeDto.email, {
          attempts: resetData.attempts + 1,
        });

        return {
          success: false,
          message: '인증 코드가 일치하지 않습니다.',
        };
      }

      await this.memoryAuthService.updateResetCode(verifyResetCodeDto.email, {
        attempts: 0,
      });

      return {
        success: true,
        message: '인증 코드가 확인되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '인증 코드 검증 중 오류가 발생했습니다.',
      };
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const verifyResult = await this.verifyResetCode({
        email: resetPasswordDto.email,
        code: resetPasswordDto.code,
      });

      if (!verifyResult.success) {
        return verifyResult;
      }

      const hashedPassword = await PasswordUtil.hashPassword(
        resetPasswordDto.newPassword,
      );

      const user = await this.usersService.findByEmail(resetPasswordDto.email);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
      }

      await this.usersService.update(user.id, { password: hashedPassword });
      await this.memoryAuthService.deleteResetCode(resetPasswordDto.email);

      return {
        success: true,
        message: '비밀번호가 성공적으로 변경되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '비밀번호 재설정 중 오류가 발생했습니다.',
      };
    }
  }

  async checkMemoryAuthHealth() {
    try {
      const stats = this.memoryAuthService.getMemoryStats();

      return {
        success: true,
        data: {
          connected: true,
          stats: stats,
          timestamp: new Date().toISOString(),
        },
        message: '메모리 인증 시스템 정상',
      };
    } catch (error) {
      return {
        success: false,
        error: '메모리 인증 헬스체크 중 오류가 발생했습니다.',
      };
    }
  }

  async requestAccountDeletion(requestDeletionDto: RequestAccountDeletionDto) {
    try {
      const existingData = await this.memoryAuthService.getResetCode(
        requestDeletionDto.email,
      );

      if (existingData) {
        const now = Date.now();
        const codeAge = now - existingData.timestamp;
        const minInterval =
          this.configService.get<number>('REDIS_RATE_LIMIT', 60) * 1000;

        if (codeAge < minInterval) {
          return {
            success: false,
            message:
              '회원 탈퇴 요청 간격이 너무 짧습니다. 잠시 후 다시 시도해주세요.',
          };
        }
      }

      const user = await this.usersService.findByEmail(
        requestDeletionDto.email,
      );

      if (!user) {
        return {
          success: false,
          message: '입력하신 이메일로 등록된 계정을 찾을 수 없습니다.',
        };
      }

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const hashedCode = await PasswordUtil.hashPassword(verificationCode);

      await this.memoryAuthService.setResetCode(
        requestDeletionDto.email,
        {
          hashedCode: hashedCode,
          userId: user.id,
          attempts: 0,
        },
        600,
      );

      const emailSent = await this.emailService.sendAccountDeletionCode(
        requestDeletionDto.email,
        user.name,
        verificationCode,
      );

      if (!emailSent) {
        return {
          success: false,
          message: '인증 코드 전송에 실패했습니다. 다시 시도해주세요.',
        };
      }

      return {
        success: true,
        message: '회원 탈퇴를 위한 인증 코드가 이메일로 전송되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '회원 탈퇴 요청 중 오류가 발생했습니다.',
      };
    }
  }

  async verifyDeletionCode(verifyDeletionCodeDto: VerifyDeletionCodeDto) {
    try {
      const resetData = await this.memoryAuthService.getResetCode(
        verifyDeletionCodeDto.email,
      );

      if (!resetData) {
        return {
          success: false,
          message: '인증 코드가 만료되었습니다. 다시 요청해주세요.',
        };
      }

      const maxAttempts = this.configService.get<number>(
        'REDIS_MAX_ATTEMPTS',
        5,
      );
      if (resetData.attempts >= maxAttempts) {
        await this.memoryAuthService.deleteResetCode(
          verifyDeletionCodeDto.email,
        );
        return {
          success: false,
          message: '인증 코드 시도 횟수를 초과했습니다. 다시 요청해주세요.',
        };
      }

      const now = Date.now();
      const codeAge = now - resetData.timestamp;
      const maxAge = this.configService.get<number>('REDIS_TTL', 600) * 1000;

      if (codeAge > maxAge) {
        await this.memoryAuthService.deleteResetCode(
          verifyDeletionCodeDto.email,
        );
        return {
          success: false,
          message: '인증 코드가 만료되었습니다. 다시 요청해주세요.',
        };
      }

      const isCodeValid = await PasswordUtil.comparePassword(
        verifyDeletionCodeDto.code,
        resetData.hashedCode,
      );

      if (!isCodeValid) {
        await this.memoryAuthService.updateResetCode(
          verifyDeletionCodeDto.email,
          {
            attempts: resetData.attempts + 1,
          },
        );

        return {
          success: false,
          message: '인증 코드가 일치하지 않습니다.',
        };
      }

      await this.memoryAuthService.updateResetCode(
        verifyDeletionCodeDto.email,
        {
          attempts: 0,
        },
      );

      return {
        success: true,
        message: '인증 코드가 확인되었습니다.',
      };
    } catch (error) {
      return {
        success: false,
        message: '인증 코드 검증 중 오류가 발생했습니다.',
      };
    }
  }

  async deleteAccount(deleteAccountDto: DeleteAccountDto) {
  try {
    const verifyResult = await this.verifyDeletionCode({
      email: deleteAccountDto.email,
      code: deleteAccountDto.code,
    });

    if (!verifyResult.success) {
      return verifyResult;
    }

    // 실제 삭제 로직 (예: usersService.remove 등)
    await this.usersService.deleteByEmail(deleteAccountDto.email);

    return {
      success: true,
      message: '계정이 성공적으로 삭제되었습니다.',
    };
  } catch (error) {
    return {
      success: false,
      message: '회원 탈퇴 중 오류가 발생했습니다.',
    };
  }
}
