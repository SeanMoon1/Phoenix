import ScenarioPage from './ScenarioPage';

export default function EmergencyFirstAidScenarioPage() {
  return (
    <ScenarioPage
      scenarioSetName="응급처치 훈련"
      nextScenarioPath="/training"
      persistKey="phoenix_emergency_training"
    />
  );
}
