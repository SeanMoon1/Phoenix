import { Injectable } from '@nestjs/common';
import { TrainingSession } from '../entities/training-session.entity';
import { TrainingResult } from '../entities/training-result.entity';

@Injectable()
export class TrainingDomainService {
  /**
   * 훈련 세션 상태 검증
   */
  validateSessionStatus(session: TrainingSession): boolean {
    const now = new Date();

    if (session.status === '준비중' && session.startTime <= now) {
      return false; // 시작 시간이 지났는데 아직 준비중
    }

    if (
      session.status === '진행중' &&
      session.endTime &&
      session.endTime <= now
    ) {
      return false; // 종료 시간이 지났는데 아직 진행중
    }

    return true;
  }

  /**
   * 훈련 세션 참가 가능 여부 검증
   */
  canJoinSession(
    session: TrainingSession,
    currentParticipants: number,
  ): boolean {
    return (
      session.status === '준비중' &&
      session.isActive &&
      !session.deletedAt &&
      (!session.maxParticipants ||
        currentParticipants < session.maxParticipants)
    );
  }

  /**
   * 훈련 세션 시작 가능 여부 검증
   */
  canStartSession(session: TrainingSession): boolean {
    const now = new Date();
    return (
      session.status === '준비중' &&
      session.startTime <= now &&
      session.isActive &&
      !session.deletedAt
    );
  }

  /**
   * 훈련 세션 종료 가능 여부 검증
   */
  canEndSession(session: TrainingSession): boolean {
    return (
      session.status === '진행중' && session.isActive && !session.deletedAt
    );
  }

  /**
   * 훈련 결과 점수 계산
   */
  calculateScore(result: TrainingResult): {
    accuracyScore: number;
    speedScore: number;
    totalScore: number;
  } {
    const accuracyScore = Math.min(result.accuracyScore, 100);
    const speedScore = Math.min(result.speedScore, 100);
    const totalScore = Math.round(accuracyScore * 0.7 + speedScore * 0.3);

    return {
      accuracyScore,
      speedScore,
      totalScore,
    };
  }

  /**
   * 훈련 결과 등급 계산
   */
  calculateGrade(totalScore: number): string {
    if (totalScore >= 90) return 'S';
    if (totalScore >= 80) return 'A';
    if (totalScore >= 70) return 'B';
    if (totalScore >= 60) return 'C';
    return 'D';
  }

  /**
   * 훈련 결과 피드백 생성
   */
  generateFeedback(result: TrainingResult): string {
    const { accuracyScore, speedScore, totalScore } =
      this.calculateScore(result);
    const grade = this.calculateGrade(totalScore);

    let feedback = `총점: ${totalScore}점 (${grade}등급)\n`;
    feedback += `정확도: ${accuracyScore}점\n`;
    feedback += `속도: ${speedScore}점\n\n`;

    if (accuracyScore >= 80) {
      feedback += '정확도가 우수합니다! 👍\n';
    } else if (accuracyScore >= 60) {
      feedback += '정확도를 더 높일 수 있습니다.\n';
    } else {
      feedback += '정확도를 크게 개선해야 합니다.\n';
    }

    if (speedScore >= 80) {
      feedback += '속도가 우수합니다! ⚡\n';
    } else if (speedScore >= 60) {
      feedback += '속도를 더 높일 수 있습니다.\n';
    } else {
      feedback += '속도를 크게 개선해야 합니다.\n';
    }

    return feedback;
  }

  /**
   * 훈련 세션 예상 소요 시간 계산
   */
  calculateEstimatedDuration(_session: TrainingSession): number {
    // 기본 60분 + 시나리오 난이도에 따른 조정
    const baseDuration = 60;
    // 실제로는 시나리오의 난이도를 가져와서 계산해야 함
    return baseDuration;
  }
}
