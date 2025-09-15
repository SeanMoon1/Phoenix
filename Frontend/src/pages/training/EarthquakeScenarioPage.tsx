import ScenarioPage from './ScenarioPage';

export default function EarthquakeScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="지진 대응"
      nextScenarioPath="/training"
      persistKey="earthquake_training_state"
    />
  );
}
