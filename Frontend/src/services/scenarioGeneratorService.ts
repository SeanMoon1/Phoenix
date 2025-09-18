/**
 * 시나리오 생성기 서비스
 * 관리자 페이지에서 사용할 시나리오 생성 관련 기능들을 제공
 */

import type { ScenarioGeneratorEvent, ConversionOptions, ValidationResult } from '../types';
import { ScenarioValidator } from '../utils/scenario-generator/validator.js';
import { ScenarioConverter } from '../utils/scenario-generator/converter.js';

export class ScenarioGeneratorService {
  private validator: ScenarioValidator;
  private converter: ScenarioConverter;

  constructor() {
    this.validator = new ScenarioValidator();
    this.converter = new ScenarioConverter();
  }

  /**
   * 시나리오 데이터 검증
   */
  validateScenarioData(data: ScenarioGeneratorEvent[]): ValidationResult {
    return this.validator.validateScenarioData(data);
  }

  /**
   * 시나리오 데이터를 MySQL INSERT 문으로 변환
   */
  convertToMySQL(data: ScenarioGeneratorEvent[], options: ConversionOptions): string {
    return this.converter.convertToMySQL(data, options);
  }

  /**
   * 시나리오 통계 생성
   */
  generateStatistics(data: ScenarioGeneratorEvent[]) {
    return this.converter.generateStatistics(data);
  }

  /**
   * JSON 파일을 시나리오 데이터로 로드
   */
  async loadScenarioFromFile(file: File): Promise<ScenarioGeneratorEvent[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('파일 형식이 올바르지 않습니다.'));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
      reader.readAsText(file);
    });
  }

  /**
   * 시나리오 데이터를 JSON 파일로 다운로드
   */
  downloadScenarioAsJSON(data: ScenarioGeneratorEvent[], filename?: string): void {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `scenarios_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 시나리오 데이터를 SQL 파일로 다운로드
   */
  downloadScenarioAsSQL(data: ScenarioGeneratorEvent[], options: ConversionOptions, filename?: string): void {
    const sqlContent = this.convertToMySQL(data, options);
    const dataBlob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `scenarios_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 시나리오 코드 생성
   */
  generateScenarioCode(disasterType: string, index: number): string {
    return this.converter.generateScenarioCode(disasterType, index);
  }

  /**
   * 이벤트 ID 생성
   */
  generateEventId(scenarioIndex: number, eventIndex: number): string {
    return this.converter.generateEventId(scenarioIndex, eventIndex);
  }
}

// 싱글톤 인스턴스
export const scenarioGeneratorService = new ScenarioGeneratorService();