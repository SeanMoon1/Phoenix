import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body: {
      data?: string;
      size: number;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
        size: number;
      };
      headers?: Array<{ name: string; value: string }>;
      parts?: Array<{
        mimeType: string;
        body: {
          data?: string;
          size: number;
        };
        headers?: Array<{ name: string; value: string }>;
      }>;
    }>;
  };
  sizeEstimate: number;
  historyId: string;
  internalDate: string;
  labelIds: string[];
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface EmailListResponse {
  messages: Array<{
    id: string;
    threadId: string;
  }>;
  nextPageToken?: string;
  resultSizeEstimate: number;
}

export interface SendEmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  threadId?: string;
}

@Injectable()
export class GmailService {
  private oauth2Client: OAuth2Client;
  private gmail: any;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GMAIL_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GMAIL_CLIENT_SECRET');
    const redirectUris = this.configService.get<string>('GMAIL_REDIRECT_URIS');

    // Gmail 환경 변수 검증
    if (!clientId || !clientSecret || !redirectUris) {
      console.error('❌ Gmail 환경 변수가 설정되지 않았습니다:', {
        GMAIL_CLIENT_ID: !!clientId,
        GMAIL_CLIENT_SECRET: !!clientSecret,
        GMAIL_REDIRECT_URIS: !!redirectUris,
      });
      throw new Error(
        'Gmail 환경 변수가 설정되지 않았습니다. GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REDIRECT_URIS를 확인해주세요.',
      );
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUris);

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  /**
   * OAuth 인증 URL 생성
   */
  getAuthUrl(): string {
    const scopes = this.configService.get<string>('GMAIL_SCOPES');

    if (!scopes) {
      console.error('❌ GMAIL_SCOPES 환경 변수가 설정되지 않았습니다.');
      throw new Error('GMAIL_SCOPES 환경 변수가 설정되지 않았습니다.');
    }

    const scopeArray = scopes.split(',');

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopeArray,
      prompt: 'consent',
    });
  }

  /**
   * OAuth 인증 코드로 토큰 획득
   */
  async getTokenFromCode(code: string): Promise<any> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('❌ Gmail 토큰 획득 실패:', error);
      throw new Error('Gmail 인증에 실패했습니다.');
    }
  }

  /**
   * 저장된 토큰으로 OAuth 클라이언트 설정
   */
  setCredentials(tokens: any): void {
    this.oauth2Client.setCredentials(tokens);
  }

  /**
   * 이메일 목록 조회
   */
  async getEmails(
    maxResults: number = 10,
    pageToken?: string,
  ): Promise<EmailListResponse> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        pageToken,
        q: 'in:inbox', // 받은편지함만 조회
      });

      return response.data;
    } catch (error) {
      console.error('❌ 이메일 목록 조회 실패:', error);
      throw new Error('이메일 목록을 가져올 수 없습니다.');
    }
  }

  /**
   * 특정 이메일 상세 조회
   */
  async getEmailById(messageId: string): Promise<GmailMessage> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      });

      return response.data;
    } catch (error) {
      console.error('❌ 이메일 상세 조회 실패:', error);
      throw new Error('이메일을 가져올 수 없습니다.');
    }
  }

  /**
   * 스레드의 모든 메시지 조회
   */
  async getThreadById(threadId: string): Promise<GmailThread> {
    try {
      const response = await this.gmail.users.threads.get({
        userId: 'me',
        id: threadId,
        format: 'full',
      });

      return response.data;
    } catch (error) {
      console.error('❌ 스레드 조회 실패:', error);
      throw new Error('스레드를 가져올 수 없습니다.');
    }
  }

  /**
   * 이메일 전송
   */
  async sendEmail(emailData: SendEmailData): Promise<boolean> {
    try {
      const message = this.createEmailMessage(emailData);

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
          threadId: emailData.threadId, // 답장인 경우 스레드 ID 포함
        },
      });

      console.log('✅ 이메일 전송 성공:', response.data.id);
      return true;
    } catch (error) {
      console.error('❌ 이메일 전송 실패:', error);
      return false;
    }
  }

  /**
   * 이메일 메시지 생성 (Base64 인코딩)
   */
  private createEmailMessage(emailData: SendEmailData): string {
    const boundary = '----=_Part_' + Math.random().toString(36).substr(2, 9);

    let message = [
      `To: ${emailData.to}`,
      `Subject: ${emailData.subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      emailData.textContent,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      emailData.htmlContent,
      '',
      `--${boundary}--`,
    ].join('\n');

    // Base64 URL-safe 인코딩
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * 이메일 헤더에서 특정 값 추출
   */
  getHeaderValue(
    headers: Array<{ name: string; value: string }>,
    name: string,
  ): string {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    return header ? header.value : '';
  }

  /**
   * 이메일 본문 디코딩
   */
  decodeEmailBody(body: { data?: string; size: number }): string {
    if (!body.data) return '';

    try {
      return Buffer.from(body.data, 'base64').toString('utf-8');
    } catch (error) {
      console.error('❌ 이메일 본문 디코딩 실패:', error);
      return '';
    }
  }

  /**
   * HTML 이메일 본문 추출
   */
  extractHtmlContent(message: GmailMessage): string {
    if (message.payload.body.data) {
      return this.decodeEmailBody(message.payload.body);
    }

    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/html' && part.body.data) {
          return this.decodeEmailBody(part.body);
        }

        // 중첩된 parts 처리
        if (part.mimeType === 'multipart/alternative' && part.parts) {
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/html' && subPart.body.data) {
              return this.decodeEmailBody(subPart.body);
            }
          }
        }
      }
    }

    return '';
  }

  /**
   * 텍스트 이메일 본문 추출
   */
  extractTextContent(message: GmailMessage): string {
    if (message.payload.body.data) {
      return this.decodeEmailBody(message.payload.body);
    }

    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body.data) {
          return this.decodeEmailBody(part.body);
        }

        // 중첩된 parts 처리
        if (part.mimeType === 'multipart/alternative' && part.parts) {
          for (const subPart of part.parts) {
            if (subPart.mimeType === 'text/plain' && subPart.body.data) {
              return this.decodeEmailBody(subPart.body);
            }
          }
        }
      }
    }

    return '';
  }

  /**
   * SES 스타일의 예쁜 HTML 이메일 템플릿 생성
   */
  generateReplyEmailHTML(
    originalMessage: GmailMessage,
    replyContent: string,
    adminName: string = 'Phoenix 관리자',
  ): string {
    const originalFrom = this.getHeaderValue(
      originalMessage.payload.headers,
      'From',
    );
    const originalSubject = this.getHeaderValue(
      originalMessage.payload.headers,
      'Subject',
    );
    const originalDate = this.getHeaderValue(
      originalMessage.payload.headers,
      'Date',
    );

    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phoenix 문의 답변</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        .content {
            padding: 30px;
        }
        .reply-section {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .original-message {
            background: #e9ecef;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .original-header {
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .original-header h3 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 18px;
        }
        .original-meta {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 10px;
        }
        .original-content {
            color: #495057;
            white-space: pre-wrap;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .footer a {
            color: #667eea;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
        .admin-signature {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #495057;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔥 Phoenix 재난훈련 시스템</h1>
            <p>문의 답변</p>
        </div>
        
        <div class="content">
            <div class="reply-section">
                <h2 style="margin-top: 0; color: #667eea;">답변 내용</h2>
                <div style="white-space: pre-wrap; line-height: 1.8;">${replyContent}</div>
            </div>
            
            <div class="original-message">
                <div class="original-header">
                    <h3>📧 원본 문의 내용</h3>
                    <div class="original-meta">
                        <strong>보낸 사람:</strong> ${originalFrom}<br>
                        <strong>제목:</strong> ${originalSubject}<br>
                        <strong>날짜:</strong> ${originalDate}
                    </div>
                </div>
                <div class="original-content">${this.extractTextContent(originalMessage)}</div>
            </div>
            
            <div class="admin-signature">
                <p><strong>${adminName}</strong><br>
                Phoenix 재난훈련 시스템 관리자<br>
                📧 phoenix4team@gmail.com<br>
                🌐 <a href="https://www.phoenix-4.com">www.phoenix-4.com</a></p>
            </div>
        </div>
        
        <div class="footer">
            <p>이 이메일은 Phoenix 재난훈련 시스템에서 자동으로 발송되었습니다.</p>
            <p>문의사항이 있으시면 <a href="https://www.phoenix-4.com/support">고객지원 페이지</a>를 이용해주세요.</p>
        </div>
    </div>
</body>
</html>`;
  }
}
