import {
  Controller,
  Post,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ScenarioImportService } from '../../application/services/scenario-import.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';

@ApiTags('Scenario Import')
@Controller('scenarios/import')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScenarioImportController {
  constructor(private readonly scenarioImportService: ScenarioImportService) {}

  @Post('json')
  @ApiOperation({ summary: 'JSON 데이터로 시나리오 임포트' })
  @ApiResponse({ status: 201, description: '시나리오 임포트 성공' })
  async importFromJson(@Body() jsonData: any[]) {
    return this.scenarioImportService.importFromJson(jsonData);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'JSON 파일로 시나리오 임포트' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '시나리오 파일 임포트 성공' })
  async importFromFile(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('파일이 업로드되지 않았습니다.');
    }

    const jsonData = JSON.parse(file.buffer.toString());
    return this.scenarioImportService.importFromJson(jsonData);
  }

  @Post('sync')
  @ApiOperation({ summary: 'JSON 데이터와 DB 동기화' })
  @ApiResponse({ status: 200, description: '동기화 성공' })
  async syncFromJson(@Body() jsonData: any[]) {
    return this.scenarioImportService.syncFromJsonFile(jsonData);
  }
}
