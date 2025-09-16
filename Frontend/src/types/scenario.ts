// 이 파일은 더 이상 사용되지 않습니다.
// 모든 타입 정의는 Frontend/src/types/index.ts로 통합되었습니다.
// Database 스키마 기준으로 정의된 타입들을 사용하세요.

// 기존 코드와의 호환성을 위해 re-export
export type {
  ChoiceOption,
  ScenarioEvent as DecisionEvent,
  Scenario,
  ScenarioScene,
  ScenarioEvent,
} from './index';

// 레거시 호환성을 위한 타입 별칭
export type ScenarioOption = ChoiceOption;
