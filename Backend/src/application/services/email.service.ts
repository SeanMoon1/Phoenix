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
              Html: {
                Data: this.generateContactEmailHTML(data),
              },
              Text: {
                Data: `Phoenix 문의 접수

1. 문의 정보
   - 이름: ${data.name}
   - 이메일: ${data.email}
   - 문의 유형: ${data.type}
   - 제목: ${data.subject}

2. 문의 내용
   ${data.message}

3. 답장 방법
   이메일 주소: ${data.email}
   위 주소로 직접 답장하시면 됩니다.

---
Phoenix 재난훈련 시스템
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

  /**
   * 비밀번호 재설정 인증 코드 이메일 전송
   * @param email 수신자 이메일
   * @param name 수신자 이름
   * @param code 인증 코드
   * @returns 전송 성공 여부
   */
  async sendPasswordResetCode(
    email: string,
    name: string,
    code: string,
  ): Promise<boolean> {
    try {
      const fromEmail = this.configService.get<string>(
        'AWS_SES_FROM_EMAIL',
        'phoenix4team@gmail.com',
      );

      const command = new SendEmailCommand({
        FromEmailAddress: fromEmail,
        Destination: {
          ToAddresses: [email],
        },
        Content: {
          Simple: {
            Subject: {
              Data: '[Phoenix] 비밀번호 재설정 인증 코드',
            },
            Body: {
              Html: {
                Data: this.generatePasswordResetEmailHTML(name, code),
              },
              Text: {
                Data: `Phoenix 비밀번호 재설정

안녕하세요 ${name}님,

비밀번호 재설정을 위한 인증 코드입니다.

인증 코드: ${code}

이 코드는 10분간 유효합니다.
만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.

---
Phoenix 재난훈련 시스템
전송 시간: ${new Date().toLocaleString('ko-KR')}`,
              },
            },
          },
        },
      });

      const result = await this.sesClient.send(command);
      console.log('✅ 비밀번호 재설정 이메일 전송 성공:', result.MessageId);
      return true;
    } catch (error) {
      console.error('❌ 비밀번호 재설정 이메일 전송 실패:', error);
      return false;
    }
  }

  /**
   * 비밀번호 재설정 이메일 HTML 템플릿 생성
   * @param name 수신자 이름
   * @param code 인증 코드
   * @returns HTML 형식의 이메일 템플릿
   */
  private generatePasswordResetEmailHTML(name: string, code: string): string {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phoenix 비밀번호 재설정</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .code-container {
            background-color: #f8f9fa;
            border: 2px solid #e74c3c;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #e74c3c;
            letter-spacing: 5px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔥 Phoenix</div>
            <div class="title">비밀번호 재설정 인증 코드</div>
        </div>
        
        <p>안녕하세요 <strong>${name}</strong>님,</p>
        
        <p>Phoenix 재난훈련 시스템에서 비밀번호 재설정을 요청하셨습니다.</p>
        
        <div class="code-container">
            <p style="margin: 0 0 10px 0; color: #666;">아래 인증 코드를 입력해주세요:</p>
            <div class="code">${code}</div>
        </div>
        
        <div class="warning">
            <strong>⚠️ 주의사항:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>이 인증 코드는 <strong>10분간</strong> 유효합니다.</li>
                <li>코드는 한 번만 사용할 수 있습니다.</li>
                <li>비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하셔도 됩니다.</li>
            </ul>
        </div>
        
        <p>보안을 위해 인증 코드를 타인과 공유하지 마세요.</p>
        
        <div class="footer">
            <p>Phoenix 재난훈련 시스템</p>
            <p>전송 시간: ${new Date().toLocaleString('ko-KR')}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * 문의 이메일 HTML 템플릿 생성
   * @param data 문의 데이터
   * @returns HTML 형식의 이메일 템플릿
   */
  private generateContactEmailHTML(data: ContactEmailData): string {
    const currentTime = new Date().toLocaleString('ko-KR');

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phoenix 문의 접수</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 8px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .info-section {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .info-section h3 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        .info-section h3::before {
            content: "1.";
            margin-right: 8px;
            font-weight: bold;
            color: #10b981;
        }
        .info-grid {
            display: grid;
            gap: 12px;
        }
        .info-item {
            display: flex;
            align-items: center;
            padding: 8px 0;
        }
        .info-label {
            font-weight: 600;
            color: #6b7280;
            min-width: 80px;
            margin-right: 12px;
        }
        .info-value {
            color: #111827;
            flex: 1;
        }
        .message-section {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .message-section h3 {
            margin: 0 0 15px 0;
            color: #92400e;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        .message-section h3::before {
            content: "2.";
            margin-right: 8px;
            font-weight: bold;
            color: #f59e0b;
        }
        .message-content {
            background: white;
            border-radius: 6px;
            padding: 15px;
            white-space: pre-wrap;
            font-family: inherit;
            line-height: 1.6;
        }
        .reply-section {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .reply-section h3 {
            margin: 0 0 15px 0;
            color: #1e40af;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        .reply-section h3::before {
            content: "3.";
            margin-right: 8px;
            font-weight: bold;
            color: #3b82f6;
        }
        .email-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 600;
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
            margin-top: 8px;
        }
        .footer {
            background: #f9fafb;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .footer p {
            margin: 0;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-${this.getTypeColor(data.type)} {
            background: ${this.getTypeBackground(data.type)};
            color: ${this.getTypeTextColor(data.type)};
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Phoenix 문의 접수</h1>
            <p>새로운 문의가 접수되었습니다</p>
        </div>
        
        <div class="content">
            <div class="info-section">
                <h3>문의 정보</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">이름:</span>
                        <span class="info-value">${data.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">이메일:</span>
                        <span class="info-value">
                            <a href="mailto:${data.email}" style="color: #3b82f6; text-decoration: none;">${data.email}</a>
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">문의 유형:</span>
                        <span class="info-value">
                            <span class="badge badge-${this.getTypeColor(data.type)}">${data.type}</span>
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">제목:</span>
                        <span class="info-value">${data.subject}</span>
                    </div>
                </div>
            </div>

            <div class="message-section">
                <h3>문의 내용</h3>
                <div class="message-content">${data.message}</div>
            </div>

            <div class="reply-section">
                <h3>답장 방법</h3>
                <p>아래 이메일 주소로 직접 답장하시면 됩니다:</p>
                <a href="mailto:${data.email}" class="email-link">${data.email}</a>
            </div>
        </div>
        
        <div class="footer">
            <p>이 문의는 Phoenix 재난훈련 시스템을 통해 전송되었습니다.</p>
            <p>전송 시간: ${currentTime}</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * 문의 유형에 따른 색상 반환
   * @param type 문의 유형
   * @returns 색상 클래스명
   */
  private getTypeColor(type: string): string {
    const typeMap: Record<string, string> = {
      '회원가입/로그인 문제': 'blue',
      '훈련 관련 문의': 'green',
      '기술적 문제': 'red',
      '서비스 개선 제안': 'purple',
      기타: 'gray',
    };
    return typeMap[type] || 'gray';
  }

  /**
   * 문의 유형에 따른 배경색 반환
   * @param type 문의 유형
   * @returns 배경색
   */
  private getTypeBackground(type: string): string {
    const backgroundMap: Record<string, string> = {
      blue: '#dbeafe',
      green: '#dcfce7',
      red: '#fee2e2',
      purple: '#e9d5ff',
      gray: '#f3f4f6',
    };
    return backgroundMap[this.getTypeColor(type)] || '#f3f4f6';
  }

  /**
   * 문의 유형에 따른 텍스트 색상 반환
   * @param type 문의 유형
   * @returns 텍스트 색상
   */
  private getTypeTextColor(type: string): string {
    const textColorMap: Record<string, string> = {
      blue: '#1e40af',
      green: '#166534',
      red: '#dc2626',
      purple: '#7c3aed',
      gray: '#374151',
    };
    return textColorMap[this.getTypeColor(type)] || '#374151';
  }
}
