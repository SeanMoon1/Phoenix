import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
  // 공통 유틸리티 메서드들
  generateCode(prefix: string, length: number = 6): string {
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  calculateExpForLevel(level: number): number {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  }

  getTierByLevel(level: number): string {
    if (level >= 1 && level <= 10) return '초급자';
    if (level >= 11 && level <= 25) return '중급자';
    if (level >= 26 && level <= 50) return '고급자';
    if (level >= 51 && level <= 75) return '전문가';
    return '마스터';
  }
}
