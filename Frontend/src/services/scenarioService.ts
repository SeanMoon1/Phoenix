import type { Scenario } from '@/types/scenario';

// 화재 시나리오 로드
export async function fetchFireScenario(): Promise<Scenario[]> {
  const res = await fetch('/data/fire_training_scenario.json', {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`화재 시나리오 로드 실패: ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('시나리오 형식 오류: 배열이 아님');
  }
  return data as Scenario[];
}

// 지진 시나리오 로드
export async function fetchEarthquakeScenario(): Promise<Scenario[]> {
  const res = await fetch('/data/earthquake_training_scenario.json', {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`지진 시나리오 로드 실패: ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('시나리오 형식 오류: 배열이 아님');
  }
  return data as Scenario[];
}

// 응급처치 시나리오 로드
export async function fetchEmergencyScenario(): Promise<Scenario[]> {
  const res = await fetch('/data/emergency_first_aid_scenario.json', {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`응급처치 시나리오 로드 실패: ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('시나리오 형식 오류: 배열이 아님');
  }
  return data as Scenario[];
}

// 교통사고 시나리오 로드
export async function fetchTrafficScenario(): Promise<Scenario[]> {
  const res = await fetch('/data/traffic_accident_scenario.json', {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`교통사고 시나리오 로드 실패: ${res.status}`);
  }
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('시나리오 형식 오류: 배열이 아님');
  }
  return data as Scenario[];
}

// 타입별 시나리오 로드 (ScenarioPage에서 사용)
export async function fetchScenarioByType(type: string): Promise<Scenario[]> {
  switch (type) {
    case 'fire':
      return fetchFireScenario();
    case 'earthquake':
      return fetchEarthquakeScenario();
    case 'emergency':
    case 'first-aid':
      return fetchEmergencyScenario();
    case 'traffic':
    case 'traffic-accident':
      return fetchTrafficScenario();
    default:
      throw new Error(`지원하지 않는 시나리오 타입: ${type}`);
  }
}

// 레거시 함수들 (하위 호환성을 위해 유지)
export const fetchFirstAidScenario = fetchEmergencyScenario;
export const fetchTrafficAccidentScenario = fetchTrafficScenario;
