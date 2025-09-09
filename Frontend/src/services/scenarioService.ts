import type { Scenario } from '@/types/scenario';

export async function fetchFireScenario(): Promise<Scenario[]> {
  const res = await fetch(
    '/scenarios/fireTrainingScenario.json?ts=' + Date.now(),
    {
      cache: 'no-store',
    }
  );
  if (!res.ok) throw new Error('failed to load scenario');
  return res.json();
}

export async function fetchEmergencyScenario(): Promise<Scenario[]> {
  const res = await fetch(
    '/scripts/data/emergency_first_aid_scenario.json?ts=' + Date.now(),
    {
      cache: 'no-store',
    }
  );
  if (!res.ok) throw new Error('failed to load emergency scenario');
  return res.json();
}

export async function fetchTrafficScenario(): Promise<Scenario[]> {
  const res = await fetch(
    '/scripts/data/traffic_accident_scenario.json?ts=' + Date.now(),
    {
      cache: 'no-store',
    }
  );
  if (!res.ok) throw new Error('failed to load traffic scenario');
  return res.json();
}

export async function fetchScenarioByType(type: string): Promise<Scenario[]> {
  switch (type) {
    case 'fire':
      return fetchFireScenario();
    case 'emergency':
      return fetchEmergencyScenario();
    case 'traffic':
      return fetchTrafficScenario();
    default:
      throw new Error(`Unknown scenario type: ${type}`);
  }
}
