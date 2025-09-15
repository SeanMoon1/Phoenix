import ScenarioPage from './ScenarioPage';

export default function FireScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="화재 대응 훈련"
      nextScenarioPath="/training"
      persistKey="phoenix_fire_training"
    />
  );
}
