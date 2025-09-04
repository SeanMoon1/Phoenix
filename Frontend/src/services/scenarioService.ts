import type { Scenario } from '@/types/scenario';

export async function fetchFireScenario(): Promise<Scenario[]> {
  const res = await fetch('/scenarios/fireTrainingScenario.json');
  if (!res.ok) {
    throw new Error('Failed to load fire scenario');
  }
  return (await res.json()) as Scenario[];
}
