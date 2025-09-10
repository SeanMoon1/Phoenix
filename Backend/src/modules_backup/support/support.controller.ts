import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SupportService } from './support.service';
import { Inquiry } from '../../database/entities/inquiry.entity';
import { Faq } from '../../database/entities/faq.entity';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // 문의사항 관련 엔드포인트
  @Post('inquiries')
  @ApiOperation({ summary: '문의사항 생성' })
  @ApiResponse({
    status: 201,
    description: '문의사항이 성공적으로 생성되었습니다.',
  })
  async createInquiry(@Body() data: Partial<Inquiry>) {
    return this.supportService.createInquiry(data);
  }

  @Get('inquiries/user/:userId')
  @ApiOperation({ summary: '사용자별 문의사항 조회' })
  @ApiParam({ name: 'userId', description: '사용자 ID' })
  @ApiResponse({ status: 200, description: '사용자 문의사항 목록' })
  async getInquiriesByUser(@Param('userId') userId: number) {
    return this.supportService.getInquiriesByUser(userId);
  }

  @Get('inquiries/team/:teamId')
  @ApiOperation({ summary: '팀별 문의사항 조회' })
  @ApiParam({ name: 'teamId', description: '팀 ID' })
  @ApiResponse({ status: 200, description: '팀 문의사항 목록' })
  async getInquiriesByTeam(@Param('teamId') teamId: number) {
    return this.supportService.getInquiriesByTeam(teamId);
  }

  @Put('inquiries/:inquiryId/status')
  @ApiOperation({ summary: '문의사항 상태 업데이트' })
  @ApiParam({ name: 'inquiryId', description: '문의사항 ID' })
  @ApiResponse({
    status: 200,
    description: '문의사항 상태가 업데이트되었습니다.',
  })
  async updateInquiryStatus(
    @Param('inquiryId') inquiryId: number,
    @Body()
    data: { status: string; adminResponse?: string; respondedBy?: number },
  ) {
    return this.supportService.updateInquiryStatus(
      inquiryId,
      data.status,
      data.adminResponse,
      data.respondedBy,
    );
  }

  // FAQ 관련 엔드포인트
  @Post('faqs')
  @ApiOperation({ summary: 'FAQ 생성' })
  @ApiResponse({ status: 201, description: 'FAQ가 성공적으로 생성되었습니다.' })
  async createFaq(@Body() data: Partial<Faq>) {
    return this.supportService.createFaq(data);
  }

  @Get('faqs/team/:teamId')
  @ApiOperation({ summary: '팀별 FAQ 조회' })
  @ApiParam({ name: 'teamId', description: '팀 ID' })
  @ApiResponse({ status: 200, description: '팀 FAQ 목록' })
  async getFaqsByTeam(@Param('teamId') teamId: number) {
    return this.supportService.getFaqsByTeam(teamId);
  }

  @Get('faqs/team/:teamId/category/:category')
  @ApiOperation({ summary: '카테고리별 FAQ 조회' })
  @ApiParam({ name: 'teamId', description: '팀 ID' })
  @ApiParam({ name: 'category', description: '카테고리' })
  @ApiResponse({ status: 200, description: '카테고리별 FAQ 목록' })
  async getFaqsByCategory(
    @Param('teamId') teamId: number,
    @Param('category') category: string,
  ) {
    return this.supportService.getFaqsByCategory(teamId, category);
  }

  @Put('faqs/:faqId')
  @ApiOperation({ summary: 'FAQ 수정' })
  @ApiParam({ name: 'faqId', description: 'FAQ ID' })
  @ApiResponse({ status: 200, description: 'FAQ가 수정되었습니다.' })
  async updateFaq(@Param('faqId') faqId: number, @Body() data: Partial<Faq>) {
    return this.supportService.updateFaq(faqId, data);
  }

  @Delete('faqs/:faqId')
  @ApiOperation({ summary: 'FAQ 삭제' })
  @ApiParam({ name: 'faqId', description: 'FAQ ID' })
  @ApiResponse({ status: 200, description: 'FAQ가 삭제되었습니다.' })
  async deleteFaq(@Param('faqId') faqId: number) {
    return this.supportService.deleteFaq(faqId);
  }
}
