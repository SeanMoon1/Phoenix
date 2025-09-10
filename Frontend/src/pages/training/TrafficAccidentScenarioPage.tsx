// src/pages/training/TrafficAccidentScenarioPage.tsx
import ScenarioPage from './ScenarioPage';
import { fetchTrafficAccidentScenario } from '@/services/scenarioService';

export default function TrafficAccidentScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="교통사고 대응"
      fetchScenarios={fetchTrafficAccidentScenario}
      nextScenarioPath="/training/earthquake"
      persistKey="phoenix_training_state"
    />
  );
}
