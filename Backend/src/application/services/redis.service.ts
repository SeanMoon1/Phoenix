import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      // 🚀 타임아웃 설정 추가
      connectTimeout: 10000, // 10초
      commandTimeout: 5000, // 5초
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis 연결 오류:', error);
    });

    try {
      await this.client.connect();
    } catch (error) {
      console.error('❌ Redis 연결 실패:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      console.log('🔌 Redis 연결 종료');
    }
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
    const key = `reset_code:${email}`;
    const value = JSON.stringify({
      ...data,
      timestamp: Date.now(),
    });

    await this.client.setex(key, ttl, value);
    console.log(`🔐 인증 코드 저장: ${email} (TTL: ${ttl}초)`);
  }

  /**
   * 인증 코드 조회
   * @param email 이메일
   * @returns 인증 코드 데이터 또는 null
   */
  async getResetCode(email: string): Promise<{
    hashedCode: string;
    userId: number;
    attempts: number;
    timestamp: number;
    ipAddress?: string;
    userAgent?: string;
  } | null> {
    const key = `reset_code:${email}`;
    const value = await this.client.get(key);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('❌ 인증 코드 데이터 파싱 오류:', error);
      return null;
    }
  }

  /**
   * 인증 코드 삭제
   * @param email 이메일
   */
  async deleteResetCode(email: string): Promise<void> {
    const key = `reset_code:${email}`;
    await this.client.del(key);
    console.log(`🗑️ 인증 코드 삭제: ${email}`);
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
    const existingData = await this.getResetCode(email);
    if (!existingData) {
      return;
    }

    const updatedData = { ...existingData, ...updates };
    const key = `reset_code:${email}`;
    const value = JSON.stringify(updatedData);

    // TTL 유지하면서 업데이트
    const ttl = await this.client.ttl(key);
    if (ttl > 0) {
      await this.client.setex(key, ttl, value);
    }
  }

  /**
   * 만료된 인증 코드들 정리
   */
  async cleanupExpiredCodes(): Promise<void> {
    try {
      const keys = await this.client.keys('reset_code:*');
      const now = Date.now();
      const maxAge = 10 * 60 * 1000; // 10분

      for (const key of keys) {
        const value = await this.client.get(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            const codeAge = now - data.timestamp;
            if (codeAge > maxAge) {
              await this.client.del(key);
              console.log(`🧹 만료된 인증 코드 정리: ${key}`);
            }
          } catch (error) {
            // 파싱 오류 시 삭제
            await this.client.del(key);
            console.log(`🗑️ 손상된 인증 코드 삭제: ${key}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ 인증 코드 정리 오류:', error);
    }
  }

  /**
   * Redis 연결 상태 확인
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Redis 통계 정보
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: string;
    keys: number;
    uptime: number;
  }> {
    try {
      const info = await this.client.info('memory');
      const keys = await this.client.dbsize();
      const uptime = await this.client.lastsave();

      return {
        connected: await this.isConnected(),
        memory: info,
        keys,
        uptime,
      };
    } catch (error) {
      return {
        connected: false,
        memory: 'N/A',
        keys: 0,
        uptime: 0,
      };
    }
  }

  /**
   * 키-값 저장 (TTL 포함)
   * @param key 키
   * @param ttl 만료 시간 (초)
   * @param value 값
   */
  async setex(key: string, ttl: number, value: string): Promise<void> {
    try {
      await this.client.setex(key, ttl, value);
    } catch (error) {
      console.error('❌ Redis setex 실패:', error);
      throw error;
    }
  }

  /**
   * 키 값 조회
   * @param key 키
   * @returns 값 또는 null
   */
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('❌ Redis get 실패:', error);
      return null;
    }
  }
}
