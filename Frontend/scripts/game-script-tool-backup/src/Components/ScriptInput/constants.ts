import { ApprovalStatus, UserRole } from '../../types';

export interface SceneOption {
  answer: string;
  reaction: string;
  nextId: string;
  points: {
    speed: number;
    accuracy: number;
  };
}

export interface DefaultScene {
  sceneId: string;
  sceneScript: string;
  nextSceneId: string;
  disasterType: string;
  difficulty: string;
  timeLimit: number;
  approvalStatus: ApprovalStatus;
  createdBy: string;
  createdAt: string;
  approvedBy: string;
  approvedAt: string;
  rejectionReason: string;
  options: SceneOption[];
  sceneType: string;
}

export const DEFAULT_SCENE: DefaultScene = {
  sceneId: "",
  sceneScript: "",
  nextSceneId: "",
  disasterType: "fire",
  difficulty: "medium",
  timeLimit: 60,
  approvalStatus: ApprovalStatus.DRAFT,
  createdBy: "",
  createdAt: new Date().toISOString(),
  approvedBy: "",
  approvedAt: "",
  rejectionReason: "",
  options: [
    {
      answer: "",
      reaction: "",
      nextId: "",
      points: {
        speed: 0,
        accuracy: 0,
      },
    },
  ],
  sceneType: "disaster",
};

export const DISASTER_TYPES = {
  FIRE: "fire",
  EARTHQUAKE: "earthquake",
  EMERGENCY: "emergency",
  FLOOD: "flood",
  COMPLEX: "complex",
} as const;

export const DIFFICULTY_LEVELS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
} as const;

export const SCENE_TYPE_DISASTER = "disaster";
export const SCENE_TYPE_ENDING = "ending";
export const SCENE_TYPE_TRAINING = "training";
export const SCENE_TYPE_ANALYSIS = "analysis";

export const SCORE_WEIGHTS = {
  SPEED: 0.4,
  ACCURACY: 0.6,
} as const;

export interface ScoreGrade {
  min: number;
  name: string;
  emoji: string;
}

export const SCORE_GRADES: Record<string, ScoreGrade> = {
  EXCELLENT: { min: 90, name: "우수", emoji: "🏆" },
  GOOD: { min: 80, name: "양호", emoji: "🥈" },
  AVERAGE: { min: 70, name: "보통", emoji: "🥉" },
  BELOW_AVERAGE: { min: 60, name: "미흡", emoji: "⚠️" },
  POOR: { min: 0, name: "불량", emoji: "❌" },
};

export const APPROVAL_STATUS = {
  PENDING: ApprovalStatus.PENDING,
  APPROVED: ApprovalStatus.APPROVED,
  REJECTED: ApprovalStatus.REJECTED,
  DRAFT: ApprovalStatus.DRAFT,
} as const;

export interface ApprovalStatusInfo {
  emoji: string;
  name: string;
  color: string;
}

export const APPROVAL_STATUS_INFO: Record<ApprovalStatus, ApprovalStatusInfo> = {
  [ApprovalStatus.PENDING]: { emoji: "⏳", name: "승인 대기", color: "#FFA500" },
  [ApprovalStatus.APPROVED]: { emoji: "✅", name: "승인됨", color: "#4CAF50" },
  [ApprovalStatus.REJECTED]: { emoji: "❌", name: "거부됨", color: "#F44336" },
  [ApprovalStatus.DRAFT]: { emoji: "📝", name: "초안", color: "#9E9E9E" },
};

export const USER_ROLES = {
  ADMIN: UserRole.ADMIN,
  TRAINER: UserRole.TRAINER,
  VIEWER: UserRole.VIEWER,
} as const;
