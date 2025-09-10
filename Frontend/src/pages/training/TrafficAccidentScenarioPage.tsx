import ScenarioPage from './ScenarioPage';
import { fetchTrafficScenario } from '@/services/scenarioService';

export default function TrafficAccidentScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="교통사고 대응 훈련"
      fetchScenarios={fetchTrafficScenario}
      nextScenarioPath="/training"
      persistKey="phoenix_traffic_training"
    />
  );
}
