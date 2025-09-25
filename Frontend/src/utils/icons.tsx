import React from 'react';
import {
  FaFire,
  FaGlobeAmericas,
  FaAmbulance,
  FaCar,
  FaWater,
  FaExclamationTriangle,
  FaQuestion,
  FaQuestionCircle,
  FaCircle,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaExclamation,
  FaChartBar,
  FaTrophy,
  FaUser,
  FaGamepad,
  FaPlay,
  FaRedo,
  FaUsers,
  FaShieldAlt,
  FaMobileAlt,
  FaGripfire,
} from 'react-icons/fa';

// 재난 유형별 아이콘 매핑
export const disasterIcons = {
  fire: <FaFire className="text-red-500" />,
  gripfire: <FaGripfire className="text-red-500" />,
  earthquake: <FaGlobeAmericas className="text-yellow-500" />,
  emergency: <FaAmbulance className="text-green-500" />,
  traffic: <FaCar className="text-blue-500" />,
  flood: <FaWater className="text-cyan-500" />,
  complex: <FaExclamationTriangle className="text-orange-500" />,
  unknown: <FaQuestion className="text-gray-500" />,
};

// 난이도별 아이콘 매핑
export const difficultyIcons = {
  easy: <FaCircle className="text-green-500" />,
  medium: <FaCircle className="text-yellow-500" />,
  hard: <FaCircle className="text-red-500" />,
  default: <FaCircle className="text-gray-400" />,
};

// 상태별 아이콘 매핑
export const statusIcons = {
  success: <FaCheckCircle className="text-green-500" />,
  error: <FaTimesCircle className="text-red-500" />,
  warning: <FaExclamationTriangle className="text-yellow-500" />,
  info: <FaInfoCircle className="text-blue-500" />,
  alert: <FaExclamation className="text-red-500" />,
  question: <FaQuestionCircle className="text-blue-500" />,
};

// UI 아이콘 매핑
export const uiIcons = {
  chart: <FaChartBar />,
  trophy: <FaTrophy />,
  user: <FaUser />,
};

// 훈련 시스템 아이콘 매핑
export const trainingIcons = {
  vr: <FaGamepad />,
  scenario: <FaPlay />,
  analytics: <FaChartBar />,
  repeat: <FaRedo />,
  teamwork: <FaUsers />,
  safety: <FaShieldAlt />,
  mobile: <FaMobileAlt />,
};

// 아이콘 컴포넌트 타입
export interface IconProps {
  type:
    | keyof typeof disasterIcons
    | keyof typeof difficultyIcons
    | keyof typeof statusIcons
    | keyof typeof uiIcons
    | keyof typeof trainingIcons;
  category: 'disaster' | 'difficulty' | 'status' | 'ui' | 'training';
  className?: string;
}

// 통합 아이콘 컴포넌트
export const Icon: React.FC<IconProps> = ({
  type,
  category,
  className = '',
}) => {
  let icon;

  switch (category) {
    case 'disaster':
      icon =
        disasterIcons[type as keyof typeof disasterIcons] ||
        disasterIcons.unknown;
      break;
    case 'difficulty':
      icon =
        difficultyIcons[type as keyof typeof difficultyIcons] ||
        difficultyIcons.default;
      break;
    case 'status':
      icon = statusIcons[type as keyof typeof statusIcons] || statusIcons.info;
      break;
    case 'ui':
      icon = uiIcons[type as keyof typeof uiIcons] || uiIcons.user;
      break;
    case 'training':
      icon =
        trainingIcons[type as keyof typeof trainingIcons] || trainingIcons.vr;
      break;
    default:
      icon = disasterIcons.unknown;
  }

  return (
    <span className={`inline-flex items-center ${className}`}>{icon}</span>
  );
};

// 기존 이모티콘을 아이콘으로 변환하는 헬퍼 함수들
export const getDisasterIcon = (type: string) => {
  const iconMap: Record<string, keyof typeof disasterIcons> = {
    fire: 'fire',
    earthquake: 'earthquake',
    emergency: 'emergency',
    traffic: 'traffic',
    trafficAccident: 'traffic',
    flood: 'flood',
    complex: 'complex',
  };

  return iconMap[type] || 'unknown';
};

export const getDifficultyIcon = (difficulty: string) => {
  const iconMap: Record<string, keyof typeof difficultyIcons> = {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
  };

  return iconMap[difficulty] || 'default';
};

export const getStatusIcon = (status: string) => {
  const iconMap: Record<string, keyof typeof statusIcons> = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    alert: 'alert',
  };

  return iconMap[status] || 'info';
};
