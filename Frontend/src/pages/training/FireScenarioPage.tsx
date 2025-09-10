// src/pages/training/FireScenarioPage.tsx
import ScenarioPage from './ScenarioPage';
import { fetchFireScenario } from '@/services/scenarioService';

export default function FireScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="화재 대응"
      fetchScenarios={fetchFireScenario}
      nextScenarioPath="/training/earthquake"
      persistKey="phoenix_training_state"
    />
  );
}
