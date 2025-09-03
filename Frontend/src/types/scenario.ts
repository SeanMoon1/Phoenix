export type ScenarioStep = {
  description: string;
  choices: string[];
  correctIndex: number; // 정답 인덱스 (0-based)
};
