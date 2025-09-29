import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TrainingResultService } from './training-result.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfExportService {
  constructor(private readonly trainingResultService: TrainingResultService) {}

  /**
   * 한글 지원 폰트 경로 반환
   * @returns 폰트 파일 경로 또는 null
   */
  private getKoreanFontPath(): string | null {
    const possiblePaths = [
      // Linux 시스템 폰트 경로
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
      '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
      '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
      // Windows 시스템 폰트 경로 (WSL 환경)
      '/mnt/c/Windows/Fonts/malgun.ttf', // 맑은 고딕
      '/mnt/c/Windows/Fonts/gulim.ttc', // 굴림
      '/mnt/c/Windows/Fonts/batang.ttc', // 바탕
      // macOS 시스템 폰트 경로
      '/System/Library/Fonts/AppleGothic.ttf',
      '/System/Library/Fonts/Helvetica.ttc',
    ];

    for (const fontPath of possiblePaths) {
      if (fs.existsSync(fontPath)) {
        console.log('✅ 한글 폰트 발견:', fontPath);
        return fontPath;
      }
    }

    console.warn('⚠️ 한글 폰트를 찾을 수 없습니다. 기본 폰트를 사용합니다.');
    return null;
  }

  /**
   * 한글 텍스트를 안전하게 처리
   * @param text 원본 텍스트
   * @param hasKoreanFont 한글 폰트 사용 가능 여부
   * @returns 처리된 텍스트
   */
  private safeText(text: string, hasKoreanFont: boolean): string {
    if (hasKoreanFont) {
      return text;
    }

    // 한글 폰트가 없을 때 영문으로 대체
    const replacements: { [key: string]: string } = {
      '팀 훈련 결과 통계': 'Team Training Results Report',
      생성일: 'Generated',
      사용자명: 'User Name',
      총훈련횟수: 'Total Attempts',
      평균점수: 'Average Score',
      최고점수: 'Best Score',
      완료율: 'Completion Rate',
      통계: 'Stats',
      화재: 'Fire',
      지진: 'Earthquake',
      응급처치: 'First Aid',
      교통사고: 'Traffic Accident',
      복합재난: 'Complex Disaster',
      '(계속)': '(Continued)',
    };

    let result = text;
    for (const [korean, english] of Object.entries(replacements)) {
      result = result.replace(new RegExp(korean, 'g'), english);
    }

    return result;
  }

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

      // PDF 문서 생성
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 크기
      const { width, height } = page.getSize();

      // 한글 지원 폰트 로드 (시스템 폰트 사용)
      let font,
        boldFont,
        hasKoreanFont = false;
      try {
        // 시스템에 설치된 한글 폰트 사용 시도
        const fontPath = this.getKoreanFontPath();
        if (fontPath && fs.existsSync(fontPath)) {
          const fontBytes = fs.readFileSync(fontPath);
          font = await pdfDoc.embedFont(fontBytes);
          boldFont = await pdfDoc.embedFont(fontBytes);
          hasKoreanFont = true;
          console.log('✅ 한글 폰트 로드 성공');
        } else {
          // 폰트가 없으면 기본 폰트 사용 (한글 대신 영문 표시)
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          hasKoreanFont = false;
          console.log('⚠️ 한글 폰트 없음, 기본 폰트 사용');
        }
      } catch (error) {
        console.warn('⚠️ 한글 폰트 로드 실패, 기본 폰트 사용:', error.message);
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        hasKoreanFont = false;
      }

      // 사용자별로 그룹화
      const userResults = this.groupResultsByUser(results, hasKoreanFont);

      // 실제 훈련 결과에서 사용된 시나리오 타입만 가져오기
      const scenarioTypes = [
        ...new Set(
          results.map((result) =>
            this.getScenarioTypeName(result.scenarioType, hasKoreanFont),
          ),
        ),
      ];

      // 제목
      page.drawText(this.safeText('팀 훈련 결과 통계', hasKoreanFont), {
        x: 50,
        y: height - 50,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // 생성 날짜
      const now = new Date();
      const dateStr = hasKoreanFont
        ? now.toLocaleDateString('ko-KR')
        : now.toLocaleDateString('en-US');
      page.drawText(`${this.safeText('생성일', hasKoreanFont)}: ${dateStr}`, {
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
        this.safeText('사용자명', hasKoreanFont),
        this.safeText('총훈련횟수', hasKoreanFont),
        this.safeText('평균점수', hasKoreanFont),
        this.safeText('최고점수', hasKoreanFont),
        this.safeText('완료율', hasKoreanFont),
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

        page.drawText(
          `${this.safeText(type, hasKoreanFont)} ${this.safeText('통계', hasKoreanFont)}`,
          {
            x: currentX + 5,
            y: headerY - 15,
            size: 10,
            font: boldFont,
            color: rgb(0, 0, 0),
          },
        );

        currentX += scenarioColWidth * 3;
      });

      // 데이터 행 생성
      let currentY = headerY - 40;
      const rowHeight = 25;

      Object.entries(userResults).forEach(([userId, userData]) => {
        // 페이지 넘김 체크
        if (currentY < 100) {
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          page.drawText(this.safeText('(계속)', hasKoreanFont), {
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
   * @param hasKoreanFont 한글 폰트 사용 가능 여부
   * @returns 사용자별 그룹화된 데이터
   */
  private groupResultsByUser(
    results: any[],
    hasKoreanFont: boolean,
  ): Record<string, any> {
    const userResults: Record<string, any> = {};

    results.forEach((result) => {
      const userId = result.userId.toString();
      // 실제 사용자 이름 사용 (user.name 또는 user.userName)
      const userName =
        result.user?.name || result.user?.userName || `사용자${userId}`;
      const scenarioType = this.getScenarioTypeName(
        result.scenarioType,
        hasKoreanFont,
      );

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
   * @param hasKoreanFont 한글 폰트 사용 가능 여부
   * @returns 한글 또는 영문 시나리오 타입명
   */
  private getScenarioTypeName(
    scenarioType: string,
    hasKoreanFont: boolean = true,
  ): string {
    const koreanTypeMap: Record<string, string> = {
      FIRE: '화재',
      EARTHQUAKE: '지진',
      TRAFFIC: '교통사고',
      EMERGENCY: '응급처치',
      fire: '화재',
      earthquake: '지진',
      traffic: '교통사고',
      emergency: '응급처치',
      earthquake_training: '지진',
      fire_training: '화재',
      traffic_accident: '교통사고',
      emergency_first_aid: '응급처치',
    };

    const englishTypeMap: Record<string, string> = {
      FIRE: 'Fire',
      EARTHQUAKE: 'Earthquake',
      TRAFFIC: 'Traffic',
      EMERGENCY: 'Emergency',
      fire: 'Fire',
      earthquake: 'Earthquake',
      traffic: 'Traffic',
      emergency: 'Emergency',
      earthquake_training: 'Earthquake',
      fire_training: 'Fire',
      traffic_accident: 'Traffic',
      emergency_first_aid: 'Emergency',
    };

    // 이미 한글이면 그대로 반환
    if (['화재', '지진', '교통사고', '응급처치'].includes(scenarioType)) {
      return hasKoreanFont
        ? scenarioType
        : this.safeText(scenarioType, hasKoreanFont);
    }

    if (hasKoreanFont) {
      return koreanTypeMap[scenarioType] || scenarioType;
    } else {
      return englishTypeMap[scenarioType] || scenarioType;
    }
  }
}
