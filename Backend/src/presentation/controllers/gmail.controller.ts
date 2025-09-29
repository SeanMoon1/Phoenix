import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  GmailService,
  GmailMessage,
  EmailListResponse,
  SendEmailData,
} from '../../application/services/gmail.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

export class GmailAuthDto {
  code: string;
}

export class SendReplyDto {
  messageId: string;
  replyContent: string;
  adminName?: string;
}

export class GetEmailsDto {
  maxResults?: number;
  pageToken?: string;
}

@Controller('gmail')
export class GmailController {
  constructor(private readonly gmailService: GmailService) {
    // Gmail 서비스 초기화 확인
    try {
      // 서비스가 제대로 초기화되었는지 확인
      console.log('🔍 Gmail 컨트롤러 초기화 완료');
    } catch (error) {
      console.error('❌ Gmail 컨트롤러 초기화 실패:', error);
    }
  }

  /**
   * Gmail 설정 상태 확인
   */
  @Get('health')
  checkGmailConfig(): { status: string; config: any } {
    try {
      const config = {
        hasClientId: !!process.env.GMAIL_CLIENT_ID,
        hasClientSecret: !!process.env.GMAIL_CLIENT_SECRET,
        hasRedirectUris: !!process.env.GMAIL_REDIRECT_URIS,
        hasScopes: !!process.env.GMAIL_SCOPES,
        clientId: process.env.GMAIL_CLIENT_ID?.substring(0, 10) + '...',
        redirectUris: process.env.GMAIL_REDIRECT_URIS,
        scopes: process.env.GMAIL_SCOPES,
      };

      const allConfigured = Object.values({
        hasClientId: config.hasClientId,
        hasClientSecret: config.hasClientSecret,
        hasRedirectUris: config.hasRedirectUris,
        hasScopes: config.hasScopes,
      }).every(Boolean);

      console.log('🔍 Gmail 설정 상태 확인:', config);

      return {
        status: allConfigured ? 'healthy' : 'misconfigured',
        config,
      };
    } catch (error) {
      console.error('❌ Gmail 설정 확인 실패:', error);
      return {
        status: 'error',
        config: { error: error.message },
      };
    }
  }

  /**
   * Gmail OAuth 인증 URL 생성
   */
  @Get('auth-url')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAuthUrl(): { authUrl: string } {
    try {
      console.log('🔍 Gmail 인증 URL 생성 요청');
      const authUrl = this.gmailService.getAuthUrl();
      console.log('✅ Gmail 인증 URL 생성 성공:', authUrl);
      return { authUrl };
    } catch (error) {
      console.error('❌ Gmail 인증 URL 생성 실패:', error);

      // 환경 변수 관련 오류인 경우 더 구체적인 메시지 제공
      if (error.message && error.message.includes('환경 변수')) {
        throw new HttpException(
          `Gmail 설정 오류: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      throw new HttpException(
        'Gmail 인증 URL을 생성할 수 없습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * OAuth 인증 코드로 토큰 획득
   */
  @Post('auth')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async authenticate(
    @Body() authDto: GmailAuthDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.gmailService.getTokenFromCode(authDto.code);
      return {
        success: true,
        message: 'Gmail 인증이 완료되었습니다.',
      };
    } catch (error) {
      console.error('❌ Gmail 인증 실패:', error);
      throw new HttpException(
        'Gmail 인증에 실패했습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * 이메일 목록 조회
   */
  @Get('emails')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getEmails(@Query() query: GetEmailsDto): Promise<EmailListResponse> {
    try {
      const { maxResults = 10, pageToken } = query;
      return await this.gmailService.getEmails(maxResults, pageToken);
    } catch (error) {
      console.error('❌ 이메일 목록 조회 실패:', error);
      throw new HttpException(
        '이메일 목록을 가져올 수 없습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 특정 이메일 상세 조회
   */
  @Get('emails/:messageId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getEmailById(
    @Query('messageId') messageId: string,
  ): Promise<GmailMessage> {
    try {
      return await this.gmailService.getEmailById(messageId);
    } catch (error) {
      console.error('❌ 이메일 상세 조회 실패:', error);
      throw new HttpException(
        '이메일을 가져올 수 없습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 스레드의 모든 메시지 조회
   */
  @Get('threads/:threadId')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getThreadById(@Query('threadId') threadId: string): Promise<any> {
    try {
      return await this.gmailService.getThreadById(threadId);
    } catch (error) {
      console.error('❌ 스레드 조회 실패:', error);
      throw new HttpException(
        '스레드를 가져올 수 없습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 이메일 답장 전송
   */
  @Post('reply')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async sendReply(
    @Body() replyDto: SendReplyDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 원본 메시지 조회
      const originalMessage = await this.gmailService.getEmailById(
        replyDto.messageId,
      );

      // 원본 메시지의 발신자 정보 추출
      const fromHeader = this.gmailService.getHeaderValue(
        originalMessage.payload.headers,
        'From',
      );
      const subjectHeader = this.gmailService.getHeaderValue(
        originalMessage.payload.headers,
        'Subject',
      );

      // 발신자 이메일 주소 추출 (이름 <email@domain.com> 형태에서 email@domain.com 추출)
      const emailMatch =
        fromHeader.match(/<(.+?)>/) ||
        fromHeader.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const toEmail = emailMatch ? emailMatch[1] || emailMatch[0] : fromHeader;

      // 답장 제목 생성
      const replySubject = subjectHeader.startsWith('Re: ')
        ? subjectHeader
        : `Re: ${subjectHeader}`;

      // 예쁜 HTML 답장 생성
      const htmlContent = this.gmailService.generateReplyEmailHTML(
        originalMessage,
        replyDto.replyContent,
        replyDto.adminName || 'Phoenix 관리자',
      );

      // 텍스트 버전 답장 생성
      const textContent = `Phoenix 재난훈련 시스템 답변

${replyDto.replyContent}

---
원본 문의:
보낸 사람: ${fromHeader}
제목: ${subjectHeader}
내용: ${this.gmailService.extractTextContent(originalMessage)}

${replyDto.adminName || 'Phoenix 관리자'}
Phoenix 재난훈련 시스템 관리자
📧 phoenix4team@gmail.com
🌐 https://www.phoenix-4.com`;

      // 답장 전송
      const emailData: SendEmailData = {
        to: toEmail,
        subject: replySubject,
        htmlContent,
        textContent,
        threadId: originalMessage.threadId, // 스레드 ID 포함하여 답장으로 처리
      };

      const success = await this.gmailService.sendEmail(emailData);

      if (success) {
        return {
          success: true,
          message: '답장이 성공적으로 전송되었습니다.',
        };
      } else {
        throw new Error('이메일 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('❌ 답장 전송 실패:', error);
      throw new HttpException(
        '답장 전송에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 이메일 본문 디코딩 (HTML)
   */
  @Get('emails/:messageId/html')
  async getEmailHtml(
    @Query('messageId') messageId: string,
  ): Promise<{ html: string }> {
    try {
      const message = await this.gmailService.getEmailById(messageId);
      const html = this.gmailService.extractHtmlContent(message);
      return { html };
    } catch (error) {
      console.error('❌ HTML 이메일 조회 실패:', error);
      throw new HttpException(
        'HTML 이메일을 가져올 수 없습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 이메일 본문 디코딩 (텍스트)
   */
  @Get('emails/:messageId/text')
  async getEmailText(
    @Query('messageId') messageId: string,
  ): Promise<{ text: string }> {
    try {
      const message = await this.gmailService.getEmailById(messageId);
      const text = this.gmailService.extractTextContent(message);
      return { text };
    } catch (error) {
      console.error('❌ 텍스트 이메일 조회 실패:', error);
      throw new HttpException(
        '텍스트 이메일을 가져올 수 없습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
