export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = "ADMIN",
  TRAINER = "TRAINER",
  VIEWER = "VIEWER",
}

export interface ScriptBlock {
  sceneId: string;
  title?: string;
  content?: string;
  sceneScript?: string;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  updatedAt?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  order: number;
  disasterType?: string;
  difficulty?: string;
  rejectionReason?: string;
  options?: Array<{
    answer: string;
    reaction: string;
    nextId: string;
    points: {
      speed: number;
      accuracy: number;
    };
  }>;
  sceneType?: string;
  nextSceneId?: string;
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DRAFT = "DRAFT",
}

export interface AppState {
  isSceneFormOpened: boolean;
  modifySceneId: string | null;
}

export interface TrainingResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: string;
}

export interface SceneFormData {
  title: string;
  content: string;
  order: number;
}

export interface ApprovalUpdateData {
  sceneId: string;
  approvalStatus: ApprovalStatus;
  approvedBy: string;
  approvedAt: string;
}
