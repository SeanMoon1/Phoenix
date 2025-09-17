import { Injectable } from '@nestjs/common';
import { Scenario } from '../entities/scenario.entity';

@Injectable()
export class ScenarioDomainService {
  /**
   * 시나리오 난이도 계산
   */
  calculateDifficulty(scenario: Scenario): string {
    const { riskLevel, disasterType } = scenario;

    // 위험도와 재난 유형에 따른 난이도 계산
    const riskScore = this.getRiskScore(riskLevel);
    const disasterScore = this.getDisasterScore(disasterType);

    const totalScore = riskScore + disasterScore;

    if (totalScore >= 8) return 'hard';
    if (totalScore >= 5) return 'medium';
    return 'easy';
  }

  /**
   * 시나리오 예상 소요 시간 계산 (분 단위)
   */
  calculateEstimatedTime(scenario: Scenario): number {
    const baseTime = 30; // 기본 30분
    const riskMultiplier = this.getRiskMultiplier(scenario.riskLevel);
    const disasterMultiplier = this.getDisasterMultiplier(
      scenario.disasterType,
    );

    return Math.round(baseTime * riskMultiplier * disasterMultiplier);
  }

  /**
   * 시나리오 승인 가능 여부 검증
   */
  canApprove(scenario: Scenario): boolean {
    return (
      scenario.status === '임시저장' &&
      scenario.approvalStatus === 'DRAFT' &&
      !!scenario.title &&
      !!scenario.description &&
      !!scenario.disasterType &&
      !!scenario.riskLevel
    );
  }

  /**
   * 시나리오 활성화 가능 여부 검증
   */
  canActivate(scenario: Scenario): boolean {
    return (
      scenario.approvalStatus === 'APPROVED' &&
      scenario.isActive === false &&
      !scenario.deletedAt
    );
  }

  /**
   * 시나리오 완성도 검증
   */
  validateCompleteness(scenario: Scenario): {
    isValid: boolean;
    missingFields: string[];
  } {
    const missingFields: string[] = [];

    if (!scenario.title) missingFields.push('title');
    if (!scenario.description) missingFields.push('description');
    if (!scenario.disasterType) missingFields.push('disasterType');
    if (!scenario.riskLevel) missingFields.push('riskLevel');
    if (!scenario.scenarioCode) missingFields.push('scenarioCode');

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  private getRiskScore(riskLevel: string): number {
    const riskScores = {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 5,
      CRITICAL: 7,
    };
    return riskScores[riskLevel] || 1;
  }

  private getDisasterScore(disasterType: string): number {
    const disasterScores = {
      EARTHQUAKE: 3,
      FIRE: 2,
      FLOOD: 2,
      TSUNAMI: 4,
      TYPHOON: 3,
      TRAFFIC_ACCIDENT: 1,
      EMERGENCY_FIRST_AID: 1,
    };
    return disasterScores[disasterType] || 1;
  }

  private getRiskMultiplier(riskLevel: string): number {
    const multipliers = {
      LOW: 0.8,
      MEDIUM: 1.0,
      HIGH: 1.3,
      CRITICAL: 1.6,
    };
    return multipliers[riskLevel] || 1.0;
  }

  private getDisasterMultiplier(disasterType: string): number {
    const multipliers = {
      EARTHQUAKE: 1.2,
      FIRE: 1.0,
      FLOOD: 1.1,
      TSUNAMI: 1.4,
      TYPHOON: 1.1,
      TRAFFIC_ACCIDENT: 0.8,
      EMERGENCY_FIRST_AID: 0.9,
    };
    return multipliers[disasterType] || 1.0;
  }
}
