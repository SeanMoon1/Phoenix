import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommonService } from './common.service';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('health')
  @ApiOperation({ summary: '공통 서비스 상태 확인' })
  @ApiResponse({ status: 200, description: '서비스 정상 작동' })
  getHealth() {
    return {
      status: 'ok',
      service: 'common',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('utils/generate-code')
  @ApiOperation({ summary: '코드 생성 테스트' })
  @ApiResponse({ status: 200, description: '생성된 코드' })
  generateTestCode() {
    return {
      userCode: this.commonService.generateCode('USER'),
      teamCode: this.commonService.generateCode('TEAM'),
      scenarioCode: this.commonService.generateCode('SCEN'),
    };
  }
}
