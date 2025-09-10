import { Injectable } from '@nestjs/common';
import { Scenario } from '../entities/scenario.entity';

@Injectable()
export class ScenarioDomainService {
  /**
   * 시나리오 난이도 계산
   */
  calculateDifficulty(riskLevel: string, disasterType: string): string {
    const riskWeight = this.getRiskWeight(riskLevel);
    const typeWeight = this.getTypeWeight(disasterType);

    const totalWeight = riskWeight + typeWeight;

    if (totalWeight <= 2) return 'Easy';
    if (totalWeight <= 4) return 'Medium';
    if (totalWeight <= 6) return 'Hard';
    return 'Expert';
  }

  /**
   * 시나리오 예상 소요 시간 계산
   */
  calculateEstimatedTime(disasterType: string, riskLevel: string): number {
    const baseTime = this.getBaseTime(disasterType);
    const riskMultiplier = this.getRiskMultiplier(riskLevel);

    return Math.round(baseTime * riskMultiplier);
  }

  /**
   * 시나리오 승인 가능 여부 검증
   */
  canApprove(scenario: Scenario): boolean {
    return (
      scenario.status === '임시저장' &&
      !!scenario.title &&
      !!scenario.description &&
      !!scenario.disasterType
    );
  }

  /**
   * 시나리오 활성화 가능 여부 검증
   */
  canActivate(scenario: Scenario): boolean {
    return scenario.status === '승인완료' && scenario.isActive === false;
  }

  private getRiskWeight(riskLevel: string): number {
    const weights = { 낮음: 1, 보통: 2, 높음: 3, 매우높음: 4 };
    return weights[riskLevel] || 2;
  }

  private getTypeWeight(disasterType: string): number {
    const weights = {
      화재: 2,
      지진: 3,
      응급처치: 1,
      침수: 2,
      홍수: 3,
    };
    return weights[disasterType] || 2;
  }

  private getBaseTime(disasterType: string): number {
    const times = {
      화재: 15,
      지진: 20,
      응급처치: 10,
      침수: 12,
      홍수: 18,
    };
    return times[disasterType] || 15;
  }

  private getRiskMultiplier(riskLevel: string): number {
    const multipliers = { 낮음: 0.8, 보통: 1.0, 높음: 1.2, 매우높음: 1.5 };
    return multipliers[riskLevel] || 1.0;
  }
}
