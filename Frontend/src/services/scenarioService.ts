import { scenarioApi } from './api';
import type { Scenario } from '@/types';

// Database 스키마 기준 시나리오 서비스
export class ScenarioService {
  /**
   * 재난 유형별 시나리오 조회
   * @param disasterType 재난 유형
   * @returns 시나리오 목록
   */
  static async getByType(disasterType: string): Promise<Scenario[]> {
    const response = await scenarioApi.getByType(disasterType);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || '시나리오 조회에 실패했습니다.');
  }

  /**
   * 모든 시나리오 조회
   * @returns 시나리오 목록
   */
  static async getAll(): Promise<Scenario[]> {
    const response = await scenarioApi.getAll();
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || '시나리오 조회에 실패했습니다.');
  }

  /**
   * 특정 시나리오 조회
   * @param id 시나리오 ID
   * @returns 시나리오 정보
   */
  static async getById(id: number): Promise<Scenario> {
    const response = await scenarioApi.getById(id);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || '시나리오 조회에 실패했습니다.');
  }

  /**
   * 새 시나리오 생성
   * @param scenarioData 시나리오 생성 데이터
   * @returns 생성된 시나리오
   */
  static async create(scenarioData: Partial<Scenario>): Promise<Scenario> {
    const response = await scenarioApi.create(scenarioData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || '시나리오 생성에 실패했습니다.');
  }

  /**
   * 시나리오 정보 수정
   * @param id 시나리오 ID
   * @param scenarioData 수정할 시나리오 데이터
   * @returns 수정된 시나리오
   */
  static async update(
    id: number,
    scenarioData: Partial<Scenario>
  ): Promise<Scenario> {
    const response = await scenarioApi.update(id, scenarioData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || '시나리오 수정에 실패했습니다.');
  }

  /**
   * 시나리오 삭제
   * @param id 시나리오 ID
   * @returns 삭제 결과
   */
  static async delete(id: number): Promise<void> {
    const response = await scenarioApi.delete(id);
    if (!response.success) {
      throw new Error(response.error || '시나리오 삭제에 실패했습니다.');
    }
  }

  /**
   * 파일에서 시나리오 임포트
   * @param file 업로드할 JSON 파일
   * @returns 임포트 결과
   */
  static async importFromFile(
    file: File
  ): Promise<{ success: boolean; message: string }> {
    const response = await scenarioApi.importFromFile(file);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || '시나리오 임포트에 실패했습니다.');
  }

  /**
   * JSON 데이터에서 시나리오 동기화
   * @param jsonData 시나리오 JSON 데이터
   * @returns 동기화 결과
   */
  static async syncFromJson(
    jsonData: any
  ): Promise<{ success: boolean; message: string }> {
    const response = await scenarioApi.syncFromJson(jsonData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || '시나리오 동기화에 실패했습니다.');
  }
}

// 레거시 호환성을 위한 함수들 (기존 코드와의 호환성 유지)
export async function fetchFireScenario(): Promise<Scenario[]> {
  return ScenarioService.getByType('fire');
}

export async function fetchEarthquakeScenario(): Promise<Scenario[]> {
  return ScenarioService.getByType('earthquake');
}

export async function fetchEmergencyScenario(): Promise<Scenario[]> {
  return ScenarioService.getByType('emergency');
}

export async function fetchTrafficScenario(): Promise<Scenario[]> {
  return ScenarioService.getByType('traffic');
}

export async function fetchScenarioByType(type: string): Promise<Scenario[]> {
  return ScenarioService.getByType(type);
}

// 레거시 함수들 (하위 호환성을 위해 유지)
export const fetchFirstAidScenario = fetchEmergencyScenario;
export const fetchTrafficAccidentScenario = fetchTrafficScenario;
