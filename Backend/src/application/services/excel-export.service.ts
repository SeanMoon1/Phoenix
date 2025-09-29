import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { TrainingResultService } from './training-result.service';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class ExcelExportService {
  constructor(private readonly trainingResultService: TrainingResultService) {}

  /**
   * 팀원들의 훈련 결과를 엑셀 파일로 생성
   * @param teamId 팀 ID
   * @returns 엑셀 파일 버퍼
   */
  async generateTeamTrainingResultsExcel(teamId: number): Promise<Buffer> {
    try {
      console.log('팀 훈련 결과 엑셀 파일 생성 시작:', { teamId });

      // 팀 훈련 결과 조회
      const results =
        await this.trainingResultService.getTrainingResultsByTeam(teamId);

      if (!results || results.length === 0) {
        throw new Error('팀 훈련 결과가 없습니다.');
      }

      // 사용자별로 그룹화
      const userResults = this.groupResultsByUser(results);

      // 엑셀 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('팀 훈련 결과');

      // 헤더 스타일 정의
      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFF' } },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid' as const,
          fgColor: { argb: '366092' },
        },
        alignment: {
          horizontal: 'center' as const,
          vertical: 'middle' as const,
        },
        border: {
          top: { style: 'thin' as const },
          left: { style: 'thin' as const },
          bottom: { style: 'thin' as const },
          right: { style: 'thin' as const },
        },
      };

      // 데이터 스타일 정의
      const dataStyle = {
        alignment: {
          horizontal: 'center' as const,
          vertical: 'middle' as const,
        },
        border: {
          top: { style: 'thin' as const },
          left: { style: 'thin' as const },
          bottom: { style: 'thin' as const },
          right: { style: 'thin' as const },
        },
      };

      // 실제 훈련 결과에서 사용된 시나리오 타입만 가져오기
      const scenarioTypes = [
        ...new Set(
          results.map((result) =>
            this.getScenarioTypeName(result.scenarioType),
          ),
        ),
      ];

      // 헤더 행 생성 - 시나리오 타입별로 구분된 구조
      const headers = [
        '사용자명',
        '총 훈련 횟수',
        '평균 점수',
        '최고 점수',
        '완료율',
      ];

      // 시나리오별 헤더 추가 (타입별로 명확히 구분)
      scenarioTypes.forEach((type) => {
        headers.push(
          `${type} 시나리오`,
          `${type} 훈련 횟수`,
          `${type} 평균 점수`,
          `${type} 최고 점수`,
          `${type} 정확도`,
        );
      });

      // 헤더 행 추가
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell, colNumber) => {
        cell.style = headerStyle;
      });

      // 데이터 행 생성
      Object.entries(userResults).forEach(([userId, userData]) => {
        const row = [
          userData.userName,
          userData.totalAttempts,
          userData.averageScore,
          userData.bestScore,
          userData.completionRate,
        ];

        // 시나리오별 데이터 추가 (타입별로 명확히 구분)
        scenarioTypes.forEach((type) => {
          const scenarioData = userData.scenarios[type] || {
            attempts: 0,
            averageScore: 0,
            bestScore: 0,
          };
          // 정확도 계산 (평균 점수를 백분율로 변환)
          const accuracy = Math.round(scenarioData.averageScore * 100) / 100;

          row.push(
            type, // 시나리오 타입
            scenarioData.attempts,
            scenarioData.averageScore,
            scenarioData.bestScore,
            `${accuracy}%`, // 정확도
          );
        });

        const dataRow = worksheet.addRow(row);
        dataRow.eachCell((cell, colNumber) => {
          cell.style = dataStyle;
        });
      });

      // 열 너비 자동 조정 (개선된 알고리즘)
      worksheet.columns.forEach((column, index) => {
        let maxLength = 0;
        let maxContentLength = 0;

        // 헤더와 데이터 셀 모두 확인
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellValue = cell.value ? cell.value.toString() : '';
          const cellLength = cellValue.length;

          if (cellLength > maxLength) {
            maxLength = cellLength;
          }

          // 실제 내용 길이 측정 (한글은 2배로 계산)
          const contentLength = this.calculateContentLength(cellValue);
          if (contentLength > maxContentLength) {
            maxContentLength = contentLength;
          }
        });

        // 컬럼 타입에 따른 최소 너비 설정
        const minWidth = this.getMinWidthForColumn(index, headers);
        const calculatedWidth = Math.max(minWidth, maxContentLength + 2);

        column.width = Math.min(calculatedWidth, 50); // 최대 50으로 제한
      });

      // 엑셀 파일을 버퍼로 변환
      const buffer = await workbook.xlsx.writeBuffer();

      console.log('팀 훈련 결과 엑셀 파일 생성 완료:', {
        teamId,
        userCount: Object.keys(userResults).length,
        totalResults: results.length,
      });

      return Buffer.from(buffer);
    } catch (error) {
      console.error('팀 훈련 결과 엑셀 파일 생성 실패:', error);
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
      // 실제 사용자 이름 사용 (user.name 또는 user.userName)
      const userName =
        result.user?.name || result.user?.userName || `사용자${userId}`;
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
   * 텍스트 내용의 실제 길이 계산 (한글은 2배로 계산)
   * @param text 텍스트
   * @returns 계산된 길이
   */
  private calculateContentLength(text: string): number {
    let length = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      // 한글, 중국어, 일본어는 2배로 계산
      if (
        /[\u3131-\u3163\uac00-\ud7a3\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(
          char,
        )
      ) {
        length += 2;
      } else {
        length += 1;
      }
    }
    return length;
  }

  /**
   * 컬럼 인덱스에 따른 최소 너비 반환
   * @param columnIndex 컬럼 인덱스
   * @param headers 헤더 배열
   * @returns 최소 너비
   */
  private getMinWidthForColumn(columnIndex: number, headers: string[]): number {
    const header = headers[columnIndex] || '';

    // 기본 컬럼들
    if (header.includes('사용자명')) return 15;
    if (header.includes('총 훈련 횟수')) return 12;
    if (header.includes('평균 점수')) return 12;
    if (header.includes('최고 점수')) return 12;
    if (header.includes('완료율')) return 10;

    // 시나리오별 컬럼들
    if (header.includes('시나리오')) return 12;
    if (header.includes('훈련 횟수')) return 10;
    if (header.includes('정확도')) return 10;

    return 8; // 기본값
  }

  /**
   * 시나리오 타입을 한글명으로 변환
   * @param scenarioType 시나리오 타입
   * @returns 한글 시나리오 타입명
   */
  private getScenarioTypeName(scenarioType: string): string {
    const typeMap: Record<string, string> = {
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

    // 이미 한글이면 그대로 반환
    if (['화재', '지진', '교통사고', '응급처치'].includes(scenarioType)) {
      return scenarioType;
    }

    return typeMap[scenarioType] || scenarioType;
  }
}
