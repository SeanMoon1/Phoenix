import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactDto } from '../dto/contact.dto';
import { EmailService } from '../../application/services/email.service';

@ApiTags('문의하기')
@Controller('contact')
export class ContactController {
  constructor(private readonly emailService: EmailService) {}

  @Post()
  @ApiOperation({ summary: '문의하기 이메일 전송' })
  @ApiResponse({
    status: 200,
    description: '이메일 전송 성공',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 데이터',
  })
  @ApiResponse({
    status: 500,
    description: '이메일 전송 실패',
  })
  async sendContact(@Body() contactDto: ContactDto) {
    try {
      const emailSent = await this.emailService.sendContactEmail(contactDto);

      if (emailSent) {
        return {
          success: true,
          message:
            '문의가 성공적으로 전송되었습니다. 빠른 시일 내에 답변드리겠습니다.',
        };
      } else {
        throw new HttpException(
          '이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      console.error('문의하기 처리 중 오류:', error);
      throw new HttpException(
        '문의 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
