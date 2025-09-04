export type ScenarioOption = {
  answerId: string;
  answer: string;
  reaction: string;
  nextId: string;
  points: {
    speed: number;
    accuracy: number;
  };
};

export type Scenario = {
  sceneId: string;
  title: string;
  content: string;
  sceneScript: string;
  approvalStatus: string;
  createdAt: string;
  createdBy: string;
  order: number;
  disasterType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  options: ScenarioOption[];
};
