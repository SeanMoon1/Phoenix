/**
 * 시나리오 생성기 설정
 */

import { ValidationConfig } from "./types";

export const config = {
  dataDir: "../data",
  outputDir: "./output/sql",
  backupDir: "./output/backup",
  defaultTeamId: 1,
  defaultCreatedBy: 1,
  defaultScenarioCode: "SCEN",
  defaultEventCode: "EVENT",
  defaultOptionCode: "OPT",
};

export const validationConfig: ValidationConfig = {
  // 필수 필드
  required: ["sceneId", "title", "content", "options"],

  // 필드 타입 검증
  types: {
    sceneId: "string",
    title: "string",
    content: "string",
    sceneScript: "string",
    options: "array",
    disasterType: "string",
    difficulty: "string",
    riskLevel: "string",
  },

  // 필드 길이 제한
  maxLengths: {
    title: 200,
    content: 2000,
    sceneScript: 1000,
  },

  // 허용된 값들
  allowedValues: {
    disasterType: ["fire", "earthquake", "emergency", "flood", "complex"],
    difficulty: ["easy", "medium", "hard", "expert"],
    riskLevel: ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"],
    approvalStatus: ["DRAFT", "PENDING", "APPROVED", "REJECTED"],
  },
};

export const sqlTemplates = {
  scenario: `
-- 시나리오 생성
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, approval_status, created_by, created_at) 
VALUES ({{teamId}}, '{{scenarioCode}}', '{{title}}', '{{content}}', '{{disasterType}}', '{{riskLevel}}', '{{difficulty}}', 'ACTIVE', 'APPROVED', {{createdBy}}, NOW());
SET @scenario_id = LAST_INSERT_ID();`,

  event: `
-- 의사결정 이벤트 생성 ({{title}})
INSERT INTO decision_event (scenario_id, event_code, title, content, event_script, event_order, event_type, created_by, created_at)
VALUES (@scenario_id, '{{eventCode}}', '{{title}}', '{{content}}', '{{sceneScript}}', {{eventOrder}}, '{{eventType}}', {{createdBy}}, NOW());
SET @event_id_{{index}} = LAST_INSERT_ID();`,

  option: `
-- 선택 옵션 생성 ({{answerPreview}})
INSERT INTO choice_option (event_id, option_code, option_text, reaction_text, next_event_id, points_speed, points_accuracy, exp_reward, is_correct, created_by, created_at)
VALUES (@event_id_{{index}}, '{{optionCode}}', '{{answer}}', '{{reaction}}', {{nextEventId}}, {{pointsSpeed}}, {{pointsAccuracy}}, {{expReward}}, {{isCorrect}}, {{createdBy}}, NOW());`,
};
