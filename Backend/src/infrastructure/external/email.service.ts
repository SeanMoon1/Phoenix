import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendEmail(
    to: string,
    subject: string,
    content: string,
  ): Promise<boolean> {
    // TODO: 실제 이메일 서비스 구현 (AWS SES, SendGrid 등)
    console.log(`Email sent to ${to}: ${subject}`);
    console.log(`Content: ${content}`);
    return true;
  }

  async sendWelcomeEmail(
    userEmail: string,
    userName: string,
  ): Promise<boolean> {
    const subject = 'Phoenix 훈련 시스템에 오신 것을 환영합니다!';
    const content = `
      안녕하세요 ${userName}님,
      
      Phoenix 재난 대응 훈련 시스템에 가입해주셔서 감사합니다.
      
      이제 다양한 재난 상황에 대한 훈련을 시작할 수 있습니다.
      
      감사합니다.
      Phoenix 팀
    `;

    return this.sendEmail(userEmail, subject, content);
  }

  async sendPasswordResetEmail(
    userEmail: string,
    resetToken: string,
  ): Promise<boolean> {
    const subject = 'Phoenix 비밀번호 재설정';
    const content = `
      비밀번호 재설정을 요청하셨습니다.
      
      아래 링크를 클릭하여 새 비밀번호를 설정하세요:
      ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}
      
      이 링크는 1시간 후에 만료됩니다.
      
      감사합니다.
      Phoenix 팀
    `;

    return this.sendEmail(userEmail, subject, content);
  }
}
