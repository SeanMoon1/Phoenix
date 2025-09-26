import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Refresh Token 생성
   * @param userId 사용자 ID
   * @param loginId 로그인 ID
   * @returns Refresh Token
   */
  async generateRefreshToken(userId: number, loginId: string): Promise<string> {
    const payload = {
      sub: userId,
      loginId: loginId,
      type: 'refresh',
    };

    // Refresh Token은 7일 유효
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Redis에 Refresh Token 저장 (7일)
    await this.redisService.setex(
      `refresh_token:${userId}`,
      7 * 24 * 60 * 60, // 7일
      refreshToken,
    );

    console.log(`🔄 Refresh Token 생성: ${userId}`);
    return refreshToken;
  }

  /**
   * Access Token 생성 (15분 유효)
   * @param userId 사용자 ID
   * @param loginId 로그인 ID
   * @param teamId 팀 ID
   * @param adminLevel 관리자 레벨
   * @param isAdmin 관리자 여부
   * @returns Access Token
   */
  async generateAccessToken(
    userId: number,
    loginId: string,
    teamId: number | null,
    adminLevel: string | null,
    isAdmin: boolean,
  ): Promise<string> {
    const payload = {
      sub: userId,
      loginId: loginId,
      teamId: teamId,
      adminLevel: adminLevel,
      isAdmin: isAdmin,
      type: 'access',
    };

    // Access Token은 15분 유효
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    console.log(`🔑 Access Token 생성: ${userId}`);
    return accessToken;
  }

  /**
   * Refresh Token 검증
   * @param refreshToken Refresh Token
   * @returns 검증 결과
   */
  async validateRefreshToken(refreshToken: string): Promise<{
    valid: boolean;
    userId?: number;
    loginId?: string;
  }> {
    try {
      // JWT 검증
      const decoded = this.jwtService.verify(refreshToken) as any;

      if (decoded.type !== 'refresh') {
        return { valid: false };
      }

      // Redis에서 Refresh Token 확인
      const storedToken = await this.redisService.get(
        `refresh_token:${decoded.sub}`,
      );
      if (!storedToken || storedToken !== refreshToken) {
        return { valid: false };
      }

      return {
        valid: true,
        userId: decoded.sub,
        loginId: decoded.loginId,
      };
    } catch (error) {
      console.error('❌ Refresh Token 검증 실패:', error);
      return { valid: false };
    }
  }

  /**
   * Refresh Token 무효화 (로그아웃 시)
   * @param userId 사용자 ID
   */
  async invalidateRefreshToken(userId: number): Promise<void> {
    try {
      await this.redisService.setex(`refresh_token:${userId}`, 0, '');
      console.log(`🚫 Refresh Token 무효화: ${userId}`);
    } catch (error) {
      console.error('❌ Refresh Token 무효화 실패:', error);
    }
  }

  /**
   * 토큰 쌍 생성 (Access + Refresh)
   * @param userId 사용자 ID
   * @param loginId 로그인 ID
   * @param teamId 팀 ID
   * @param adminLevel 관리자 레벨
   * @param isAdmin 관리자 여부
   * @returns 토큰 쌍
   */
  async generateTokenPair(
    userId: number,
    loginId: string,
    teamId: number | null,
    adminLevel: string | null,
    isAdmin: boolean,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const accessToken = await this.generateAccessToken(
      userId,
      loginId,
      teamId,
      adminLevel,
      isAdmin,
    );

    const refreshToken = await this.generateRefreshToken(userId, loginId);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15분 (초 단위)
    };
  }
}
