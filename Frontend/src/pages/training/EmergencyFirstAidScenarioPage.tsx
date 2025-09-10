import ScenarioPage from './ScenarioPage';
import { fetchFirstAidScenario } from '@/services/scenarioService';

export default function EmergencyFirstAidScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="응급처치 대응"
      fetchScenarios={fetchFirstAidScenario}
      nextScenarioPath="/training/traffic-accident"
      persistKey="phoenix_training_state"
    />
  );
}
