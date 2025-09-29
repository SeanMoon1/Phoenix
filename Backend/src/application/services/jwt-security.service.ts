import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtSecurityService {
  private blacklistedTokens = new Set<string>();
  private userLogoutTimes = new Map<number, number>();
  private securityEvents: any[] = [];

  constructor(private readonly jwtService: JwtService) {}

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
        this.blacklistedTokens.add(token);

        // 토큰 만료 시간에 맞춰 자동 삭제 스케줄링
        const ttl = (exp - now) * 1000; // 밀리초로 변환
        setTimeout(() => {
          this.blacklistedTokens.delete(token);
        }, ttl);

        console.log(`🚫 JWT 토큰 무효화: ${token.substring(0, 20)}...`);
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
      // 사용자별 로그아웃 시간 기록
      this.userLogoutTimes.set(userId, Date.now());

      // 24시간 후 자동 삭제
      setTimeout(
        () => {
          this.userLogoutTimes.delete(userId);
        },
        24 * 60 * 60 * 1000,
      );

      console.log(`🚫 사용자 ${userId}의 모든 토큰 무효화`);
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
      return this.blacklistedTokens.has(token);
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

      return tokenIat * 1000 < logoutTime; // 토큰 발급 시간을 밀리초로 변환하여 비교
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

      // 메모리에 보안 이벤트 저장 (최대 1000개)
      this.securityEvents.push(logData);
      if (this.securityEvents.length > 1000) {
        this.securityEvents.shift(); // 가장 오래된 이벤트 제거
      }
    } catch (error) {
      console.error('❌ 보안 이벤트 로깅 실패:', error);
    }
  }
}
