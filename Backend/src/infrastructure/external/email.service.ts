import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  /**
   * 이메일 발송
   */
  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    try {
      // 실제 이메일 발송 로직 구현
      console.log(`Sending email to ${to}: ${subject}`);
      console.log(`Content: ${content}`);
      
      // 임시로 성공 반환
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * 회원가입 환영 이메일
   */
  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Phoenix 재난훈련 시스템에 오신 것을 환영합니다!';
    const content = `
      안녕하세요 ${userName}님!
      
      Phoenix 재난훈련 시스템에 가입해주셔서 감사합니다.
      이제 다양한 재난 상황에 대한 훈련을 시작할 수 있습니다.
      
      훈련을 통해 안전한 미래를 만들어가세요!
      
      Phoenix 팀 드림
    `;
    
    return this.sendEmail(userEmail, subject, content);
  }

  /**
   * 훈련 완료 알림 이메일
   */
  async sendTrainingCompletionEmail(
    userEmail: string, 
    userName: string, 
    scenarioTitle: string
  ): Promise<boolean> {
    const subject = `훈련 완료: ${scenarioTitle}`;
    const content = `
      안녕하세요 ${userName}님!
      
      ${scenarioTitle} 훈련을 완료하셨습니다.
      훌륭한 성과를 거두셨네요!
      
      계속해서 다양한 시나리오에 도전해보세요.
      
      Phoenix 팀 드림
    `;
    
    return this.sendEmail(userEmail, subject, content);
  }
}
