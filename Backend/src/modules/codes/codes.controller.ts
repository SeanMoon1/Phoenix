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
import { CodesService } from './codes.service';
import { Code } from '../../database/entities/code.entity';

@ApiTags('Codes')
@Controller('codes')
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  @Post()
  @ApiOperation({ summary: '코드 생성' })
  @ApiResponse({ status: 201, description: '코드가 생성되었습니다.' })
  async createCode(@Body() data: Partial<Code>) {
    return this.codesService.createCode(data);
  }

  @Get('class/:codeClass')
  @ApiOperation({ summary: '코드 클래스별 조회' })
  @ApiParam({ name: 'codeClass', description: '코드 클래스' })
  @ApiQuery({ name: 'teamId', required: false, description: '팀 ID' })
  @ApiResponse({ status: 200, description: '코드 목록' })
  async getCodesByClass(
    @Param('codeClass') codeClass: string,
    @Query('teamId') teamId?: number,
  ) {
    return this.codesService.getCodesByClass(codeClass, teamId);
  }

  @Get('system')
  @ApiOperation({ summary: '시스템 공통 코드 조회' })
  @ApiResponse({ status: 200, description: '시스템 공통 코드 목록' })
  async getSystemCodes() {
    return this.codesService.getSystemCodes();
  }

  @Get('team/:teamId')
  @ApiOperation({ summary: '팀별 코드 조회' })
  @ApiParam({ name: 'teamId', description: '팀 ID' })
  @ApiResponse({ status: 200, description: '팀 코드 목록' })
  async getTeamCodes(@Param('teamId') teamId: number) {
    return this.codesService.getTeamCodes(teamId);
  }

  @Get('disaster-types')
  @ApiOperation({ summary: '재난 유형 코드 조회' })
  @ApiQuery({ name: 'teamId', required: false, description: '팀 ID' })
  @ApiResponse({ status: 200, description: '재난 유형 코드 목록' })
  async getDisasterTypes(@Query('teamId') teamId?: number) {
    return this.codesService.getDisasterTypes(teamId);
  }

  @Get('risk-levels')
  @ApiOperation({ summary: '위험도 코드 조회' })
  @ApiQuery({ name: 'teamId', required: false, description: '팀 ID' })
  @ApiResponse({ status: 200, description: '위험도 코드 목록' })
  async getRiskLevels(@Query('teamId') teamId?: number) {
    return this.codesService.getRiskLevels(teamId);
  }

  @Get('event-types')
  @ApiOperation({ summary: '이벤트 유형 코드 조회' })
  @ApiQuery({ name: 'teamId', required: false, description: '팀 ID' })
  @ApiResponse({ status: 200, description: '이벤트 유형 코드 목록' })
  async getEventTypes(@Query('teamId') teamId?: number) {
    return this.codesService.getEventTypes(teamId);
  }

  @Get('inquiry-categories')
  @ApiOperation({ summary: '문의 카테고리 코드 조회' })
  @ApiQuery({ name: 'teamId', required: false, description: '팀 ID' })
  @ApiResponse({ status: 200, description: '문의 카테고리 코드 목록' })
  async getInquiryCategories(@Query('teamId') teamId?: number) {
    return this.codesService.getInquiryCategories(teamId);
  }

  @Get('faq-categories')
  @ApiOperation({ summary: 'FAQ 카테고리 코드 조회' })
  @ApiQuery({ name: 'teamId', required: false, description: '팀 ID' })
  @ApiResponse({ status: 200, description: 'FAQ 카테고리 코드 목록' })
  async getFaqCategories(@Query('teamId') teamId?: number) {
    return this.codesService.getFaqCategories(teamId);
  }

  @Put(':codeId')
  @ApiOperation({ summary: '코드 수정' })
  @ApiParam({ name: 'codeId', description: '코드 ID' })
  @ApiResponse({ status: 200, description: '코드가 수정되었습니다.' })
  async updateCode(
    @Param('codeId') codeId: number,
    @Body() data: Partial<Code>,
  ) {
    return this.codesService.updateCode(codeId, data);
  }

  @Delete(':codeId')
  @ApiOperation({ summary: '코드 삭제' })
  @ApiParam({ name: 'codeId', description: '코드 ID' })
  @ApiResponse({ status: 200, description: '코드가 삭제되었습니다.' })
  async deleteCode(@Param('codeId') codeId: number) {
    return this.codesService.deleteCode(codeId);
  }
}
