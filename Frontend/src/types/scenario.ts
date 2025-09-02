export interface UIScenarioStep {
  id: string;
  title: string;
  step: string; // "1단계 / 5단계"
  description: string;
  choices: string[];
}
