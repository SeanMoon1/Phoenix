import ScenarioPage from './ScenarioPage';
import { fetchEarthquakeScenario } from '@/services/scenarioService';

export default function EarthquakeScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="지진 대응"
      fetchScenarios={fetchEarthquakeScenario}
      nextScenarioPath="/training" // 필요 시 다른 다음 경로
      persistKey="phoenix_training_state"
    />
  );
}
