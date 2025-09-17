import type { Scenario } from '@/types';
import { scenarioApi } from './api';

// 데이터 소스 설정
const DATA_SOURCE = {
  // 환경 변수로 제어 가능 (기본값: 'static')
  // 'static': public/data 폴더의 정적 파일 사용
  // 'api': 백엔드 API 사용
  // 'auto': 정적 파일 우선, 실패 시 API 사용
  source: import.meta.env.VITE_SCENARIO_DATA_SOURCE || 'auto',

  // 정적 파일 사용 여부
  useStaticFiles: () => {
    const source = DATA_SOURCE.source;
    return source === 'static' || source === 'auto';
  },

  // API 사용 여부
  useApi: () => {
    const source = DATA_SOURCE.source;
    return source === 'api' || source === 'auto';
  },
};

// Database 스키마 기준 시나리오 서비스
export class ScenarioService {
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
  console.log(
    `[시나리오 로딩] 타입: ${type}, 데이터 소스: ${DATA_SOURCE.source}`
  );

  // 1. 정적 파일 사용이 활성화된 경우
  if (DATA_SOURCE.useStaticFiles()) {
    try {
      const scenarios = await loadFromStaticFiles(type);
      console.log(
        `[시나리오 로딩] 정적 파일에서 ${scenarios.length}개 시나리오 로드 성공`
      );
      return scenarios;
    } catch (error) {
      console.warn(`[시나리오 로딩] 정적 파일 로드 실패 (${type}):`, error);

      // auto 모드가 아니면 정적 파일 실패 시 에러 발생
      if (DATA_SOURCE.source === 'static') {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `정적 파일에서 시나리오를 로드할 수 없습니다: ${errorMessage}`
        );
      }
    }
  }

  // 2. API 사용이 활성화된 경우
  if (DATA_SOURCE.useApi()) {
    try {
      const scenarios = await loadFromApi(type);
      console.log(
        `[시나리오 로딩] API에서 ${scenarios.length}개 시나리오 로드 성공`
      );
      return scenarios;
    } catch (error) {
      console.error(`[시나리오 로딩] API 로드 실패 (${type}):`, error);

      // auto 모드가 아니면 API 실패 시 에러 발생
      if (DATA_SOURCE.source === 'api') {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `API에서 시나리오를 로드할 수 없습니다: ${errorMessage}`
        );
      }
    }
  }

  // 3. 모든 방법이 실패한 경우
  throw new Error(`시나리오를 로드할 수 없습니다. 타입: ${type}`);
}

// 정적 파일에서 시나리오 로드
async function loadFromStaticFiles(type: string): Promise<Scenario[]> {
  const fileName = getScenarioFileName(type);
  const response = await fetch(`/data/${fileName}`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return convertJsonToScenarios(data, type);
}

// API에서 시나리오 로드
async function loadFromApi(type: string): Promise<Scenario[]> {
  return await ScenarioService.getByType(type);
}

// 시나리오 타입에 따른 파일명 매핑
function getScenarioFileName(type: string): string {
  const fileMap: Record<string, string> = {
    fire: 'fire_training_scenario.json',
    earthquake: 'earthquake_training_scenario.json',
    emergency: 'emergency_first_aid_scenario.json',
    traffic: 'traffic_accident_scenario.json',
  };

  return fileMap[type] || 'fire_training_scenario.json';
}

// JSON 데이터를 Scenario 형식으로 변환
function convertJsonToScenarios(
  jsonData: any[],
  disasterType: string
): Scenario[] {
  return jsonData.map((item, index) => ({
    id: index + 1,
    teamId: 1,
    scenarioCode: item.sceneId || `SCENARIO_${disasterType}_${index + 1}`,
    title: item.title || '제목 없음',
    disasterType: disasterType,
    description: item.content || item.description || '설명 없음',
    riskLevel: item.riskLevel || 'MEDIUM',
    difficulty: item.difficulty || 'easy',
    approvalStatus: 'APPROVED',
    status: 'ACTIVE',
    occurrenceCondition: item.occurrenceCondition || undefined,
    approvalComment: undefined,
    imageUrl: undefined,
    videoUrl: undefined,
    createdBy: 1,
    approvedAt: new Date().toISOString(),
    approvedBy: 1,
    isActive: true,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: item.options
      ? item.options.map((opt: any, optIndex: number) => ({
          id: optIndex + 1,
          scenarioId: index + 1,
          eventCode: opt.answerId || `EVENT_${optIndex + 1}`,
          eventOrder: optIndex + 1,
          eventDescription: opt.answer || '선택지 없음',
          eventType: 'CHOICE',
          createdBy: 1,
          updatedBy: 1,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          choices: [
            {
              id: optIndex + 1,
              eventId: optIndex + 1,
              scenarioId: index + 1,
              choiceCode: opt.answerId || `CHOICE_${optIndex + 1}`,
              choiceText: opt.answer || '선택지 없음',
              isCorrect:
                (opt.points?.speed || 0) > 0 && (opt.points?.accuracy || 0) > 0,
              speedPoints: opt.points?.speed || 0,
              accuracyPoints: opt.points?.accuracy || 0,
              expPoints: 0,
              reactionText: opt.reaction || undefined,
              nextEventId: opt.nextId
                ? parseInt(opt.nextId.replace('#', ''))
                : undefined,
              scoreWeight: 1,
              createdBy: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              isActive: true,
            },
          ],
        }))
      : [],
  }));
}

// 데이터 소스 관리 유틸리티 함수들
export const ScenarioDataSource = {
  // 현재 데이터 소스 확인
  getCurrentSource: () => DATA_SOURCE.source,

  // 데이터 소스 변경 (런타임에서도 가능)
  setSource: (source: 'static' | 'api' | 'auto') => {
    DATA_SOURCE.source = source;
    console.log(`[시나리오 데이터 소스] 변경됨: ${source}`);
  },

  // 정적 파일 사용 여부 확인
  isUsingStaticFiles: () => DATA_SOURCE.useStaticFiles(),

  // API 사용 여부 확인
  isUsingApi: () => DATA_SOURCE.useApi(),

  // 데이터 소스 상태 정보
  getStatus: () => ({
    currentSource: DATA_SOURCE.source,
    staticFilesEnabled: DATA_SOURCE.useStaticFiles(),
    apiEnabled: DATA_SOURCE.useApi(),
    availableSources: ['static', 'api', 'auto'] as const,
  }),
};

// 개발자 도구에서 사용할 수 있는 전역 함수 (개발 환경에서만)
if (import.meta.env.DEV) {
  (window as any).ScenarioDataSource = ScenarioDataSource;
  console.log('[개발자 도구] ScenarioDataSource가 전역에서 사용 가능합니다.');
  console.log(
    '사용법: ScenarioDataSource.setSource("api") 또는 ScenarioDataSource.getStatus()'
  );
}

// 레거시 함수들 (하위 호환성을 위해 유지)
export const fetchFirstAidScenario = fetchEmergencyScenario;
export const fetchTrafficAccidentScenario = fetchTrafficScenario;
