import { Injectable } from '@nestjs/common';
import { MemoryAuthService } from './memory-auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtSecurityService {
  private blacklistedTokens = new Map<string, number>();
  private userLogoutTimes = new Map<number, number>();

  constructor(
    private readonly memoryAuthService: MemoryAuthService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * JWT 토큰을 블랙리스트에 추가 (토큰 무효화)
   * @param token 무효화할 JWT 토큰
   * @param userId 사용자 ID
   */
  async invalidateToken(token: string, userId: number): Promise<void> {
    try {
      // 토큰의 만료시간을 계산
      const decoded = this.jwtService.decode(token) as any;
      const exp = decoded?.exp;
      const now = Math.floor(Date.now() / 1000);

      if (exp && exp > now) {
        // 토큰이 아직 유효한 경우에만 블랙리스트에 추가
        const ttl = (exp - now) * 1000; // 밀리초로 변환
        this.blacklistedTokens.set(token, Date.now() + ttl);

        // TTL 후 자동 삭제
        setTimeout(() => {
          this.blacklistedTokens.delete(token);
        }, ttl);

        console.log(
          `🚫 JWT 토큰 무효화 (메모리): ${token.substring(0, 20)}...`,
        );
      }
    } catch (error) {
      console.error('❌ JWT 토큰 무효화 실패:', error);
    }
  }

  /**
   * 사용자의 모든 토큰을 무효화 (로그아웃 시)
   * @param userId 사용자 ID
   */
  async invalidateAllUserTokens(userId: number): Promise<void> {
    try {
      // 사용자별 로그아웃 시간 저장
      this.userLogoutTimes.set(userId, Date.now());

      // 24시간 후 자동 삭제
      setTimeout(
        () => {
          this.userLogoutTimes.delete(userId);
        },
        24 * 60 * 60 * 1000,
      );

      console.log(`🚫 사용자 ${userId}의 모든 토큰 무효화 (메모리)`);
    } catch (error) {
      console.error('❌ 사용자 토큰 무효화 실패:', error);
    }
  }

  /**
   * 토큰이 블랙리스트에 있는지 확인
   * @param token 확인할 JWT 토큰
   * @returns 블랙리스트 여부
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const expiryTime = this.blacklistedTokens.get(token);
      if (!expiryTime) return false;

      // 만료된 토큰은 삭제
      if (Date.now() > expiryTime) {
        this.blacklistedTokens.delete(token);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ 토큰 블랙리스트 확인 실패:', error);
      return false;
    }
  }

  /**
   * 사용자가 로그아웃된 후 토큰을 사용했는지 확인
   * @param token 확인할 JWT 토큰
   * @param userId 사용자 ID
   * @returns 로그아웃 후 토큰 사용 여부
   */
  async isTokenUsedAfterLogout(
    token: string,
    userId: number,
  ): Promise<boolean> {
    try {
      const decoded = this.jwtService.decode(token) as any;
      const tokenIat = decoded?.iat; // 토큰 발급 시간

      if (!tokenIat) return false;

      const logoutTime = this.userLogoutTimes.get(userId);
      if (!logoutTime) return false;

      return tokenIat * 1000 < logoutTime; // 토큰 발급 시간을 밀리초로 변환
    } catch (error) {
      console.error('❌ 로그아웃 후 토큰 사용 확인 실패:', error);
      return false;
    }
  }

  /**
   * 보안 이벤트 로깅
   * @param event 보안 이벤트 타입
   * @param details 이벤트 상세 정보
   */
  async logSecurityEvent(event: string, details: any): Promise<void> {
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        event,
        details,
        ip: details.ip || 'unknown',
        userAgent: details.userAgent || 'unknown',
      };

      console.log(`🔒 보안 이벤트: ${event}`, logData);
      // 메모리 기반에서는 콘솔 로깅만 수행
    } catch (error) {
      console.error('❌ 보안 이벤트 로깅 실패:', error);
    }
  }
}
