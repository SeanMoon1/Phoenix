import ScenarioPage from './ScenarioPage';
import { fetchFireScenario } from '@/services/scenarioService';

export default function FireScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="화재 훈련"
      fetchScenarios={fetchFireScenario}
      nextScenarioPath="/training/"
      persistKey="phoenix_training_state"
    />
  );
}
