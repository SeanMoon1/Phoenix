import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TrainingResultService } from './training-result.service';

@Injectable()
export class PdfExportService {
  constructor(private readonly trainingResultService: TrainingResultService) {}

  /**
   * 팀원들의 훈련 결과를 PDF 파일로 생성
   * @param teamId 팀 ID
   * @returns PDF 파일 버퍼
   */
  async generateTeamTrainingResultsPdf(teamId: number): Promise<Buffer> {
    try {
      console.log('📊 팀 훈련 결과 PDF 파일 생성 시작:', { teamId });

      // 팀 훈련 결과 조회
      const results =
        await this.trainingResultService.getTrainingResultsByTeam(teamId);

      if (!results || results.length === 0) {
        throw new Error('팀 훈련 결과가 없습니다.');
      }

      // 사용자별로 그룹화
      const userResults = this.groupResultsByUser(results);

      // PDF 문서 생성
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 크기
      const { width, height } = page.getSize();

      // 폰트 로드
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // 실제 훈련 결과에서 사용된 시나리오 타입만 가져오기
      const scenarioTypes = [
        ...new Set(
          results.map((result) =>
            this.getScenarioTypeName(result.scenarioType),
          ),
        ),
      ];

      // 제목
      page.drawText('팀 훈련 결과 통계', {
        x: 50,
        y: height - 50,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // 생성 날짜
      const now = new Date();
      const dateStr = now.toLocaleDateString('ko-KR');
      page.drawText(`생성일: ${dateStr}`, {
        x: 50,
        y: height - 80,
        size: 12,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });

      // 테이블 헤더
      const headerY = height - 120;
      const colWidths = [120, 80, 80, 80, 80]; // 사용자명, 총훈련횟수, 평균점수, 최고점수, 완료율
      const scenarioColWidth = 60; // 시나리오별 컬럼 너비

      // 기본 헤더
      const headers = [
        '사용자명',
        '총훈련횟수',
        '평균점수',
        '최고점수',
        '완료율',
      ];
      let currentX = 50;

      headers.forEach((header, index) => {
        page.drawRectangle({
          x: currentX,
          y: headerY - 20,
          width: colWidths[index],
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(header, {
          x: currentX + 5,
          y: headerY - 15,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        currentX += colWidths[index];
      });

      // 시나리오별 헤더
      scenarioTypes.forEach((type) => {
        page.drawRectangle({
          x: currentX,
          y: headerY - 20,
          width: scenarioColWidth * 3,
          height: 20,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1,
        });

        page.drawText(`${type} 통계`, {
          x: currentX + 5,
          y: headerY - 15,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        currentX += scenarioColWidth * 3;
      });

      // 데이터 행 생성
      let currentY = headerY - 40;
      const rowHeight = 25;

      Object.entries(userResults).forEach(([userId, userData]) => {
        // 페이지 넘김 체크
        if (currentY < 100) {
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          page.drawText('(계속)', {
            x: 50,
            y: newPage.getSize().height - 50,
            size: 12,
            font: font,
            color: rgb(0.5, 0.5, 0.5),
          });
          currentY = newPage.getSize().height - 120;
        }

        const rowData = [
          userData.userName,
          userData.totalAttempts.toString(),
          userData.averageScore.toFixed(1),
          userData.bestScore.toString(),
          userData.completionRate.toFixed(1) + '%',
        ];

        currentX = 50;

        // 기본 데이터
        rowData.forEach((data, index) => {
          page.drawRectangle({
            x: currentX,
            y: currentY - 20,
            width: colWidths[index],
            height: 20,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1,
          });

          page.drawText(data, {
            x: currentX + 5,
            y: currentY - 15,
            size: 9,
            font: font,
            color: rgb(0, 0, 0),
          });

          currentX += colWidths[index];
        });

        // 시나리오별 데이터
        scenarioTypes.forEach((type) => {
          const scenarioData = userData.scenarios[type] || {
            attempts: 0,
            averageScore: 0,
            bestScore: 0,
          };

          const scenarioRowData = [
            scenarioData.attempts.toString(),
            scenarioData.averageScore.toFixed(1),
            scenarioData.bestScore.toString(),
          ];

          scenarioRowData.forEach((data, index) => {
            page.drawRectangle({
              x: currentX,
              y: currentY - 20,
              width: scenarioColWidth,
              height: 20,
              borderColor: rgb(0, 0, 0),
              borderWidth: 1,
            });

            page.drawText(data, {
              x: currentX + 5,
              y: currentY - 15,
              size: 9,
              font: font,
              color: rgb(0, 0, 0),
            });

            currentX += scenarioColWidth;
          });
        });

        currentY -= rowHeight;
      });

      // PDF를 버퍼로 변환
      const pdfBytes = await pdfDoc.save();

      console.log('✅ 팀 훈련 결과 PDF 파일 생성 완료:', {
        teamId,
        userCount: Object.keys(userResults).length,
        totalResults: results.length,
      });

      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('❌ 팀 훈련 결과 PDF 파일 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 훈련 결과를 사용자별로 그룹화
   * @param results 훈련 결과 배열
   * @returns 사용자별 그룹화된 데이터
   */
  private groupResultsByUser(results: any[]): Record<string, any> {
    const userResults: Record<string, any> = {};

    results.forEach((result) => {
      const userId = result.userId.toString();
      const userName = result.user?.userName || `사용자${userId}`;
      const scenarioType = this.getScenarioTypeName(result.scenarioType);

      if (!userResults[userId]) {
        userResults[userId] = {
          userId,
          userName,
          totalAttempts: 0,
          totalScore: 0,
          bestScore: 0,
          scenarios: {},
        };
      }

      const userData = userResults[userId];
      userData.totalAttempts++;
      userData.totalScore += result.totalScore || 0;
      userData.bestScore = Math.max(userData.bestScore, result.totalScore || 0);

      // 시나리오별 데이터
      if (!userData.scenarios[scenarioType]) {
        userData.scenarios[scenarioType] = {
          attempts: 0,
          totalScore: 0,
          bestScore: 0,
        };
      }

      const scenarioData = userData.scenarios[scenarioType];
      scenarioData.attempts++;
      scenarioData.totalScore += result.totalScore || 0;
      scenarioData.bestScore = Math.max(
        scenarioData.bestScore,
        result.totalScore || 0,
      );
    });

    // 평균 점수와 완료율 계산
    Object.values(userResults).forEach((userData: any) => {
      userData.averageScore =
        userData.totalAttempts > 0
          ? Math.round((userData.totalScore / userData.totalAttempts) * 100) /
            100
          : 0;
      userData.completionRate = 100; // 완료된 훈련이므로 100%

      // 시나리오별 평균 점수 계산
      Object.values(userData.scenarios).forEach((scenarioData: any) => {
        scenarioData.averageScore =
          scenarioData.attempts > 0
            ? Math.round(
                (scenarioData.totalScore / scenarioData.attempts) * 100,
              ) / 100
            : 0;
      });
    });

    return userResults;
  }

  /**
   * 시나리오 타입을 한글명으로 변환
   * @param scenarioType 시나리오 타입
   * @returns 한글 시나리오 타입명
   */
  private getScenarioTypeName(scenarioType: string): string {
    const typeMap: Record<string, string> = {
      fire: '화재',
      earthquake: '지진',
      traffic: '교통사고',
      emergency: '응급처치',
      earthquake_training: '지진',
      fire_training: '화재',
      traffic_accident: '교통사고',
      emergency_first_aid: '응급처치',
    };

    // 이미 한글이면 그대로 반환
    if (['화재', '지진', '교통사고', '응급처치'].includes(scenarioType)) {
      return scenarioType;
    }

    return typeMap[scenarioType] || scenarioType;
  }
}
