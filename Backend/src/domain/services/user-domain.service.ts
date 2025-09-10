import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';

@Injectable()
export class UserDomainService {
  /**
   * 사용자 레벨 계산
   */
  calculateUserLevel(exp: number): number {
    // 경험치에 따른 레벨 계산 로직
    if (exp < 100) return 1;
    if (exp < 300) return 2;
    if (exp < 600) return 3;
    if (exp < 1000) return 4;
    if (exp < 1500) return 5;
    // ... 더 많은 레벨 계산 로직
    return Math.floor(exp / 200) + 1;
  }

  /**
   * 사용자 티어 계산
   */
  calculateUserTier(level: number): string {
    if (level < 10) return 'Bronze';
    if (level < 20) return 'Silver';
    if (level < 30) return 'Gold';
    if (level < 40) return 'Platinum';
    return 'Diamond';
  }

  /**
   * 사용자 권한 검증
   */
  hasPermission(user: User, requiredLevel: number): boolean {
    return user.userLevel >= requiredLevel;
  }

  /**
   * 사용자 활성화 상태 검증
   */
  isUserActive(user: User): boolean {
    return user.isActive && user.useYn === 'Y';
  }
}
