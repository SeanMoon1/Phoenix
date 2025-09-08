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
