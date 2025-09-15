import ScenarioPage from './ScenarioPage';
import { fetchEmergencyScenario } from '@/services/scenarioService';

export default function EmergencyFirstAidScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="응급처치 훈련"
      fetchScenarios={fetchEmergencyScenario}
      nextScenarioPath="/training"
      persistKey="phoenix_emergency_training"
    />
  );
}
