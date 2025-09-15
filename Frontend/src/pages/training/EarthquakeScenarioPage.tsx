import ScenarioPage from './ScenarioPage';
import { fetchEarthquakeScenario } from '@/services/scenarioService';

export default function EarthquakeScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="지진 대응 훈련"
      fetchScenarios={fetchEarthquakeScenario}
      nextScenarioPath="/training"
      persistKey="phoenix_earthquake_training"
    />
  );
}
