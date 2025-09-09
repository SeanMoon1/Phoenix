export type ChoiceOption = {
  id: number;
  eventId: number;
  scenarioId: number;
  choiceCode: string;
  choiceText: string;
  isCorrect: boolean;
  scoreWeight: number;
  nextEventId?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DecisionEvent = {
  id: number;
  scenarioId: number;
  eventCode: string;
  eventOrder: number;
  eventDescription: string;
  eventType: string;
  createdBy: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Scenario = {
  id: number;
  teamId: number;
  scenarioCode: string;
  title: string;
  disasterType: string;
  description: string;
  riskLevel: string;
  occurrenceCondition?: string;
  status: string;
  approvalComment?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdBy: number;
  approvedAt?: string;
  approvedBy?: number;
  updatedBy?: number;
  deletedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
