import {
  Controller,
  Get,
  Param,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { TeamAccessGuard } from '../../shared/guards/team-access.guard';
import { TeamAccess } from '../../shared/decorators/team-access.decorator';
import { ExcelExportService } from '../../application/services/excel-export.service';

@ApiTags('Excel Export')
@Controller('excel-export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExcelExportController {
  constructor(private readonly excelExportService: ExcelExportService) {}

  @Get('team/:teamId/training-results')
  @ApiOperation({ summary: '팀 훈련 결과 엑셀 다운로드' })
  @ApiParam({ name: 'teamId', description: '팀 ID' })
  @ApiResponse({
    status: 200,
    description: '엑셀 파일 다운로드',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseGuards(TeamAccessGuard)
  @TeamAccess('VIEW_RESULTS')
  async downloadTeamTrainingResults(
    @Param('teamId') teamId: number,
    @Res() res: Response,
  ) {
    try {
      console.log('팀 훈련 결과 엑셀 다운로드 요청:', { teamId });

      // 엑셀 파일 생성
      const buffer =
        await this.excelExportService.generateTeamTrainingResultsExcel(teamId);

      // 파일명 생성 (현재 날짜 포함)
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const fileName = `팀훈련결과_${teamId}_${dateStr}.xlsx`;

      // 응답 헤더 설정
      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': buffer.length.toString(),
      });

      // 파일 전송
      res.status(HttpStatus.OK).send(buffer);

      console.log('팀 훈련 결과 엑셀 다운로드 완료:', {
        teamId,
        fileName,
        fileSize: buffer.length,
      });
    } catch (error) {
      console.error('팀 훈련 결과 엑셀 다운로드 실패:', error);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message || '엑셀 파일 생성 중 오류가 발생했습니다.',
      });
    }
  }
}
