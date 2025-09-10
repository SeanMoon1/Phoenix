import type { Scenario } from '@/types/scenario';

export async function fetchFireScenario(): Promise<Scenario[]> {
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

export async function fetchEarthquakeScenario(): Promise<Scenario[]> {
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

export async function fetchFirstAidScenario(): Promise<Scenario[]> {
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

export async function fetchTrafficAccidentScenario(): Promise<Scenario[]> {
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

export async function fetchTrafficAccidentScenario(): Promise<Scenario[]> {
  const res = await fetch(
    '/scripts/data/traffic_accident_training_scenario.json',
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  if (!res.ok) {
    throw new Error(`교통사고 시나리오 로드 실패: ${res.status}`);
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error('시나리오 형식 오류: 배열이 아님');
  }

  return data as Scenario[];
}
