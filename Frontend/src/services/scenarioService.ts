import type { Scenario } from '@/types/scenario';
import { scenarioApi } from './api';

export async function fetchFireScenario(): Promise<Scenario[]> {
  try {
    const response = await scenarioApi.getScenariosByType('fire');
    if (response.success && response.data) {
      return response.data as Scenario[];
    }
    throw new Error(response.error || '화재 시나리오 로드 실패');
  } catch (error) {
    console.error('화재 시나리오 로드 실패:', error);
    // Fallback to JSON file if API fails
    const res = await fetch('/scripts/data/fire_training_scenario.json', {
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
}

export async function fetchEarthquakeScenario(): Promise<Scenario[]> {
  try {
    const response = await scenarioApi.getScenariosByType('earthquake');
    if (response.success && response.data) {
      return response.data as Scenario[];
    }
    throw new Error(response.error || '지진 시나리오 로드 실패');
  } catch (error) {
    console.error('지진 시나리오 로드 실패:', error);
    // Fallback to JSON file if API fails
    const res = await fetch('/scripts/data/earthquake_training_scenario.json', {
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
}

export async function fetchFirstAidScenario(): Promise<Scenario[]> {
  try {
    const response = await scenarioApi.getScenariosByType('emergency');
    if (response.success && response.data) {
      return response.data as Scenario[];
    }
    throw new Error(response.error || '응급처치 시나리오 로드 실패');
  } catch (error) {
    console.error('응급처치 시나리오 로드 실패:', error);
    // Fallback to JSON file if API fails
    const res = await fetch('/scripts/data/emergency_first_aid_scenario.json', {
      headers: { 'Content-Type': 'application/json' },
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
}

export async function fetchTrafficAccidentScenario(): Promise<Scenario[]> {
  try {
    const response = await scenarioApi.getScenariosByType('traffic');
    if (response.success && response.data) {
      return response.data as Scenario[];
    }
    throw new Error(response.error || '교통사고 시나리오 로드 실패');
  } catch (error) {
    console.error('교통사고 시나리오 로드 실패:', error);
    // Fallback to JSON file if API fails
    const res = await fetch('/scripts/data/traffic_accident_scenario.json', {
      headers: { 'Content-Type': 'application/json' },
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
}

export async function fetchEmergencyScenario(): Promise<Scenario[]> {
  return fetchFirstAidScenario(); // Same as fetchFirstAidScenario
}

export async function fetchTrafficScenario(): Promise<Scenario[]> {
  return fetchTrafficAccidentScenario(); // Same as fetchTrafficAccidentScenario
}

export async function fetchScenarioByType(type: string): Promise<Scenario[]> {
  try {
    const response = await scenarioApi.getScenariosByType(type);
    if (response.success && response.data) {
      return response.data as Scenario[];
    }
    throw new Error(response.error || `${type} 시나리오 로드 실패`);
  } catch (error) {
    console.error(`${type} 시나리오 로드 실패:`, error);
    // Fallback to individual functions
    switch (type) {
      case 'fire':
        return fetchFireScenario();
      case 'emergency':
        return fetchEmergencyScenario();
      case 'traffic':
        return fetchTrafficScenario();
      case 'earthquake':
        return fetchEarthquakeScenario();
      default:
        throw new Error(`Unknown scenario type: ${type}`);
    }
  }
}
