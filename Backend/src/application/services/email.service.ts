import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

export interface ContactEmailData {
  name: string;
  email: string;
  type: string;
  subject: string;
  message: string;
}

@Injectable()
export class EmailService {
  private sesClient: SESv2Client;

  constructor(private configService: ConfigService) {
    this.sesClient = new SESv2Client({
      region: this.configService.get<string>('AWS_REGION', 'ap-northeast-2'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async sendContactEmail(data: ContactEmailData): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>(
        'AWS_SES_FROM_EMAIL',
        'phoenix4team@gmail.com',
      );
      const adminEmail = this.configService.get<string>(
        'AWS_SES_TO_EMAIL',
        'phoenix4team@gmail.com',
      );

      const command = new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: {
          ToAddresses: [adminEmail], // 관리자 이메일로 문의 전송
        },
        Content: {
          Simple: {
            Subject: {
              Data: `[문의] ${data.subject}`,
            },
            Body: {
              Text: {
                Data: `새로운 문의가 접수되었습니다.

=== 문의 정보 ===
이름: ${data.name}
이메일: ${data.email}
문의 유형: ${data.type}
제목: ${data.subject}

=== 문의 내용 ===
${data.message}

=== 답장 방법 ===
사용자 이메일 주소: ${data.email}
위 이메일 주소로 직접 답장하시면 됩니다.

---
이 문의는 Phoenix 재난훈련 시스템을 통해 전송되었습니다.
전송 시간: ${new Date().toLocaleString('ko-KR')}`,
              },
            },
          },
        },
      });

      const result = await this.sesClient.send(command);
      console.log('✅ 이메일 전송 성공:', result.MessageId);
      return true;
    } catch (error) {
      console.error('❌ 이메일 전송 실패:', error);
      return false;
    }
  }
}
