import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async sendNotification(
    userId: number,
    message: string,
    type: string = 'info',
  ): Promise<boolean> {
    // TODO: 실제 알림 서비스 구현 (FCM, WebSocket 등)
    console.log(`Notification sent to user ${userId}: ${message} (${type})`);
    return true;
  }

  async sendTrainingReminder(
    userId: number,
    trainingName: string,
    startTime: Date,
  ): Promise<boolean> {
    const message = `훈련 "${trainingName}"이 ${startTime.toLocaleString()}에 시작됩니다.`;
    return this.sendNotification(userId, message, 'reminder');
  }

  async sendTrainingComplete(
    userId: number,
    trainingName: string,
    score: number,
  ): Promise<boolean> {
    const message = `훈련 "${trainingName}"을 완료했습니다! 점수: ${score}점`;
    return this.sendNotification(userId, message, 'success');
  }

  async sendLevelUp(userId: number, newLevel: number): Promise<boolean> {
    const message = `축하합니다! 레벨 ${newLevel}에 도달했습니다!`;
    return this.sendNotification(userId, message, 'achievement');
  }
}
