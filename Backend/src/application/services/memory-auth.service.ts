import { Injectable } from '@nestjs/common';

interface ResetCodeData {
  hashedCode: string;
  userId: number;
  attempts: number;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
}

interface RefreshTokenData {
  token: string;
  userId: number;
  loginId: string;
  timestamp: number;
}

@Injectable()
export class MemoryAuthService {
  private resetCodes = new Map<string, ResetCodeData>();
  private refreshTokens = new Map<string, RefreshTokenData>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // 5분마다 만료된 데이터 정리
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredData();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * 인증 코드 저장
   * @param email 이메일
   * @param data 인증 코드 데이터
   * @param ttl 만료 시간 (초)
   */
  async setResetCode(
    email: string,
    data: {
      hashedCode: string;
      userId: number;
      attempts: number;
      ipAddress?: string;
      userAgent?: string;
    },
    ttl: number = 600, // 10분
  ): Promise<void> {
    const resetCodeData: ResetCodeData = {
      ...data,
      timestamp: Date.now(),
    };

    this.resetCodes.set(email, resetCodeData);
    console.log(`🔐 인증 코드 저장 (메모리): ${email} (TTL: ${ttl}초)`);

    // TTL 후 자동 삭제
    setTimeout(() => {
      this.resetCodes.delete(email);
      console.log(`🗑️ 인증 코드 자동 삭제: ${email}`);
    }, ttl * 1000);
  }

  /**
   * 인증 코드 조회
   * @param email 이메일
   * @returns 인증 코드 데이터 또는 null
   */
  async getResetCode(email: string): Promise<ResetCodeData | null> {
    const data = this.resetCodes.get(email);

    if (!data) {
      return null;
    }

    // 10분 이상 된 데이터는 만료된 것으로 처리
    const maxAge = 10 * 60 * 1000; // 10분
    if (Date.now() - data.timestamp > maxAge) {
      this.resetCodes.delete(email);
      return null;
    }

    return data;
  }

  /**
   * 인증 코드 삭제
   * @param email 이메일
   */
  async deleteResetCode(email: string): Promise<void> {
    this.resetCodes.delete(email);
    console.log(`🗑️ 인증 코드 삭제 (메모리): ${email}`);
  }

  /**
   * 인증 코드 업데이트 (시도 횟수 등)
   * @param email 이메일
   * @param updates 업데이트할 데이터
   */
  async updateResetCode(
    email: string,
    updates: Partial<{
      attempts: number;
      hashedCode: string;
    }>,
  ): Promise<void> {
    const existingData = this.resetCodes.get(email);
    if (!existingData) {
      return;
    }

    const updatedData = { ...existingData, ...updates };
    this.resetCodes.set(email, updatedData);
  }

  /**
   * Refresh Token 저장
   * @param userId 사용자 ID
   * @param token Refresh Token
   * @param loginId 로그인 ID
   * @param ttl 만료 시간 (초)
   */
  async setRefreshToken(
    userId: number,
    token: string,
    loginId: string,
    ttl: number = 7 * 24 * 60 * 60, // 7일
  ): Promise<void> {
    const refreshTokenData: RefreshTokenData = {
      token,
      userId,
      loginId,
      timestamp: Date.now(),
    };

    this.refreshTokens.set(`refresh_token:${userId}`, refreshTokenData);
    console.log(`🔄 Refresh Token 저장 (메모리): ${userId}`);

    // TTL 후 자동 삭제
    setTimeout(() => {
      this.refreshTokens.delete(`refresh_token:${userId}`);
      console.log(`🗑️ Refresh Token 자동 삭제: ${userId}`);
    }, ttl * 1000);
  }

  /**
   * Refresh Token 조회
   * @param userId 사용자 ID
   * @returns Refresh Token 또는 null
   */
  async getRefreshToken(userId: number): Promise<string | null> {
    const data = this.refreshTokens.get(`refresh_token:${userId}`);

    if (!data) {
      return null;
    }

    // 7일 이상 된 데이터는 만료된 것으로 처리
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7일
    if (Date.now() - data.timestamp > maxAge) {
      this.refreshTokens.delete(`refresh_token:${userId}`);
      return null;
    }

    return data.token;
  }

  /**
   * Refresh Token 삭제
   * @param userId 사용자 ID
   */
  async deleteRefreshToken(userId: number): Promise<void> {
    this.refreshTokens.delete(`refresh_token:${userId}`);
    console.log(`🗑️ Refresh Token 삭제 (메모리): ${userId}`);
  }

  /**
   * 만료된 데이터 정리
   */
  private cleanupExpiredData(): void {
    const now = Date.now();
    const resetCodeMaxAge = 10 * 60 * 1000; // 10분
    const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000; // 7일

    // Reset Codes 정리
    for (const [email, data] of this.resetCodes.entries()) {
      if (now - data.timestamp > resetCodeMaxAge) {
        this.resetCodes.delete(email);
        console.log(`🧹 만료된 인증 코드 정리: ${email}`);
      }
    }

    // Refresh Tokens 정리
    for (const [key, data] of this.refreshTokens.entries()) {
      if (now - data.timestamp > refreshTokenMaxAge) {
        this.refreshTokens.delete(key);
        console.log(`🧹 만료된 Refresh Token 정리: ${key}`);
      }
    }
  }

  /**
   * 메모리 상태 확인
   */
  getMemoryStats(): {
    resetCodesCount: number;
    refreshTokensCount: number;
    totalMemoryUsage: number;
  } {
    return {
      resetCodesCount: this.resetCodes.size,
      refreshTokensCount: this.refreshTokens.size,
      totalMemoryUsage: process.memoryUsage().heapUsed,
    };
  }

  /**
   * 모든 데이터 초기화 (테스트용)
   */
  clearAll(): void {
    this.resetCodes.clear();
    this.refreshTokens.clear();
    console.log('🧹 모든 인증 데이터 초기화');
  }

  /**
   * 서비스 종료 시 정리
   */
  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clearAll();
  }
}
