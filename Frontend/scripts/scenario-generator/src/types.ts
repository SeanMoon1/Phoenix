/**
 * Phoenix 시나리오 데이터 타입 정의
 */

export interface ScenarioEvent {
  id?: number;
  teamId?: number;
  scenarioCode?: string;
  sceneId: string;
  title: string;
  content: string;
  sceneScript: string;
  status?: string;
  approvalStatus?: string;
  createdAt?: string;
  createdBy?: number | string;
  order?: number;
  disasterType?: string;
  riskLevel?: string;
  difficulty?: string;
  options: ChoiceOption[];
}

export interface ChoiceOption {
  answerId: string;
  answer: string;
  reaction: string;
  nextId?: string;
  points?: {
    speed: number;
    accuracy: number;
  };
  exp?: number;
  isCorrect?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConversionOptions {
  teamId: number;
  createdBy: number;
  backup: boolean;
  verbose: boolean;
  debug: boolean;
  output?: string;
}

export interface ConversionResult {
  inputFile: string;
  outputFile: string;
  eventCount: number;
  optionCount: number;
  success: boolean;
  error?: string;
}

export interface Statistics {
  totalFiles: number;
  successCount: number;
  failureCount: number;
  totalEvents: number;
  totalOptions: number;
  averageOptionsPerEvent: number;
}

export interface ValidationStats {
  totalEvents: number;
  totalOptions: number;
  disasterTypes: Set<string>;
  difficulties: Set<string>;
  riskLevels: Set<string>;
}

export interface ValidationConfig {
  required: string[];
  types: Record<string, string>;
  maxLengths: Record<string, number>;
  allowedValues: Record<string, string[]>;
}
