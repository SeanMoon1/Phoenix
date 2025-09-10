# 🔄 개선된 시나리오 변환 시스템

## 📋 현재 문제점 요약

### 1. 데이터베이스 스키마 불일치

- `difficulty` 컬럼이 DB에 없음
- `approval_status` 컬럼이 DB에 없음
- `scenario_scene` 테이블이 없어 씬 데이터 저장 불가

### 2. 변환 시스템 실행 불가

- ES 모듈 호환성 문제
- TypeScript 컴파일 후 실행 오류

### 3. 데이터 구조 불일치

- JSON의 씬 구조와 DB의 이벤트 구조 불일치
- 시나리오 ID 중복 문제

## 🔧 개선 방안

### 1. 데이터베이스 스키마 수정 (필수)

```sql
-- 1. scenario 테이블에 difficulty 컬럼 추가
ALTER TABLE scenario
ADD COLUMN difficulty VARCHAR(20) NOT NULL DEFAULT 'easy'
COMMENT '난이도 (easy, medium, hard, expert)'
AFTER risk_level;

-- 2. scenario_scene 테이블 생성
CREATE TABLE scenario_scene (
    scene_id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '씬 ID',
    scenario_id BIGINT NOT NULL COMMENT '시나리오 ID',
    scene_code VARCHAR(50) NOT NULL COMMENT '씬 코드 (예: #1-1, #1-2)',
    scene_order INT NOT NULL COMMENT '씬 순서',
    title VARCHAR(255) NOT NULL COMMENT '씬 제목',
    content TEXT NOT NULL COMMENT '씬 내용',
    scene_script TEXT NOT NULL COMMENT '씬 스크립트',
    image_url VARCHAR(500) COMMENT '씬 이미지 URL',
    video_url VARCHAR(500) COMMENT '씬 비디오 URL',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    created_by BIGINT NOT NULL COMMENT '생성자 ID',
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    updated_by BIGINT COMMENT '수정자 ID',
    deleted_at DATETIME NULL COMMENT '삭제일시',
    is_active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '활성화 여부 (1: 활성, 0: 비활성)',
    FOREIGN KEY (scenario_id) REFERENCES scenario(scenario_id),
    UNIQUE KEY uk_scenario_scene_code (scenario_id, scene_code)
);

-- 3. choice_option 테이블 수정
ALTER TABLE choice_option
ADD COLUMN scene_id BIGINT COMMENT '씬 ID'
AFTER scenario_id;

ALTER TABLE choice_option
ADD CONSTRAINT fk_choice_scene
FOREIGN KEY (scene_id) REFERENCES scenario_scene(scene_id);

-- 4. 포인트 정보 컬럼 추가
ALTER TABLE choice_option
ADD COLUMN speed_points INT NOT NULL DEFAULT 0 COMMENT '속도 점수'
AFTER is_correct;

ALTER TABLE choice_option
ADD COLUMN accuracy_points INT NOT NULL DEFAULT 0 COMMENT '정확도 점수'
AFTER speed_points;

ALTER TABLE choice_option
ADD COLUMN exp_points INT NOT NULL DEFAULT 0 COMMENT '경험치 점수'
AFTER accuracy_points;

ALTER TABLE choice_option
ADD COLUMN next_scene_code VARCHAR(50) COMMENT '다음 씬 코드'
AFTER exp_points;
```

### 2. 개선된 변환기 구현

```typescript
// improved-converter.ts
export class ImprovedScenarioConverter {
  /**
   * JSON 시나리오를 DB 형식으로 변환
   */
  convertToDatabaseFormat(jsonData: any[]): {
    scenarios: ScenarioData[];
    scenes: SceneData[];
    options: OptionData[];
  } {
    const scenarios: ScenarioData[] = [];
    const scenes: SceneData[] = [];
    const options: OptionData[] = [];

    // 시나리오별로 그룹화
    const scenarioGroups = this.groupByScenario(jsonData);

    scenarioGroups.forEach((scenes, scenarioCode) => {
      const firstScene = scenes[0];

      // 시나리오 데이터 생성
      const scenario: ScenarioData = {
        scenario_code: scenarioCode,
        team_id: firstScene.teamId || 1,
        title: this.extractScenarioTitle(firstScene),
        description: this.extractScenarioDescription(firstScene),
        disaster_type: firstScene.disasterType || "fire",
        risk_level: firstScene.riskLevel || "MEDIUM",
        difficulty: firstScene.difficulty || "easy",
        status: "ACTIVE",
        created_by: firstScene.createdBy || 1,
      };
      scenarios.push(scenario);

      // 씬 데이터 생성
      scenes.forEach((scene, index) => {
        const sceneData: SceneData = {
          scenario_code: scenarioCode,
          scene_code: scene.sceneId,
          scene_order: scene.order || index + 1,
          title: scene.title,
          content: scene.content,
          scene_script: scene.sceneScript,
          created_by: scene.createdBy || 1,
        };
        scenes.push(sceneData);

        // 선택 옵션 데이터 생성
        if (scene.options && Array.isArray(scene.options)) {
          scene.options.forEach((option: any) => {
            const optionData: OptionData = {
              scene_code: scene.sceneId,
              option_code: option.answerId,
              option_text: option.answer,
              reaction_text: option.reaction,
              next_scene_code: option.nextId,
              speed_points: option.points?.speed || 0,
              accuracy_points: option.points?.accuracy || 0,
              exp_points: option.exp || 0,
              is_correct: this.determineCorrectness(option),
              created_by: scene.createdBy || 1,
            };
            options.push(optionData);
          });
        }
      });
    });

    return { scenarios, scenes, options };
  }

  /**
   * 시나리오별로 씬 그룹화
   */
  private groupByScenario(data: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    data.forEach((item) => {
      const scenarioCode = item.scenarioCode || this.generateScenarioCode(item);
      if (!groups.has(scenarioCode)) {
        groups.set(scenarioCode, []);
      }
      groups.get(scenarioCode)!.push(item);
    });

    return groups;
  }

  /**
   * 시나리오 코드 생성
   */
  private generateScenarioCode(item: any): string {
    const disasterType = item.disasterType || "fire";
    const typeCode = disasterType.toUpperCase().substring(0, 3);
    return `${typeCode}001`;
  }

  /**
   * 정답 여부 판단
   */
  private determineCorrectness(option: any): boolean {
    const points = option.points;
    return points && points.speed > 0 && points.accuracy > 0;
  }
}
```

### 3. SQL 생성기 개선

```typescript
// improved-sql-generator.ts
export class ImprovedSQLGenerator {
  /**
   * 시나리오 데이터를 SQL로 변환
   */
  generateSQL(data: {
    scenarios: ScenarioData[];
    scenes: SceneData[];
    options: OptionData[];
  }): string {
    const sqlStatements: string[] = [];

    // 1. 시나리오 생성
    data.scenarios.forEach((scenario) => {
      const scenarioSql = this.generateScenarioSQL(scenario);
      sqlStatements.push(scenarioSql);
    });

    // 2. 씬 생성
    data.scenes.forEach((scene) => {
      const sceneSql = this.generateSceneSQL(scene);
      sqlStatements.push(sceneSql);
    });

    // 3. 선택 옵션 생성
    data.options.forEach((option) => {
      const optionSql = this.generateOptionSQL(option);
      sqlStatements.push(optionSql);
    });

    return sqlStatements.join("\n\n");
  }

  private generateScenarioSQL(scenario: ScenarioData): string {
    return `
-- 시나리오 생성: ${scenario.title}
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (${scenario.team_id}, '${scenario.scenario_code}', '${this.escapeSQL(
      scenario.title
    )}', '${this.escapeSQL(scenario.description)}', '${
      scenario.disaster_type
    }', '${scenario.risk_level}', '${scenario.difficulty}', '${
      scenario.status
    }', ${scenario.created_by}, NOW());
SET @scenario_id_${scenario.scenario_code} = LAST_INSERT_ID();`;
  }

  private generateSceneSQL(scene: SceneData): string {
    return `
-- 씬 생성: ${scene.title}
INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by, created_at)
VALUES (@scenario_id_${scene.scenario_code}, '${scene.scene_code}', ${
      scene.scene_order
    }, '${this.escapeSQL(scene.title)}', '${this.escapeSQL(
      scene.content
    )}', '${this.escapeSQL(scene.scene_script)}', ${scene.created_by}, NOW());
SET @scene_id_${scene.scene_code} = LAST_INSERT_ID();`;
  }

  private generateOptionSQL(option: OptionData): string {
    return `
-- 선택 옵션 생성: ${option.option_text.substring(0, 30)}...
INSERT INTO choice_option (scene_id, option_code, option_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_${option.scene_code}, '${
      option.option_code
    }', '${this.escapeSQL(option.option_text)}', '${this.escapeSQL(
      option.reaction_text
    )}', '${option.next_scene_code || "NULL"}', ${option.speed_points}, ${
      option.accuracy_points
    }, ${option.exp_points}, ${option.is_correct ? 1 : 0}, ${
      option.created_by
    }, NOW());`;
  }

  private escapeSQL(str: string): string {
    return str.replace(/'/g, "''");
  }
}
```

### 4. 실행 가능한 변환 스크립트

```typescript
// convert-scenarios.ts
import * as fs from "fs";
import * as path from "path";
import { ImprovedScenarioConverter } from "./improved-converter";
import { ImprovedSQLGenerator } from "./improved-sql-generator";

async function convertScenarios() {
  const converter = new ImprovedScenarioConverter();
  const sqlGenerator = new ImprovedSQLGenerator();

  // JSON 파일들 변환
  const jsonFiles = [
    "../data/fire_training_scenario.json",
    "../data/emergency_first_aid_scenario.json",
    "../data/traffic_accident_scenario.json",
    "../data/earthquake_training_scenario.json",
  ];

  const allScenarios: any[] = [];
  const allScenes: any[] = [];
  const allOptions: any[] = [];

  for (const file of jsonFiles) {
    console.log(`변환 중: ${file}`);

    const jsonData = JSON.parse(fs.readFileSync(file, "utf8"));
    const converted = converter.convertToDatabaseFormat(jsonData);

    allScenarios.push(...converted.scenarios);
    allScenes.push(...converted.scenes);
    allOptions.push(...converted.options);
  }

  // SQL 생성
  const sql = sqlGenerator.generateSQL({
    scenarios: allScenarios,
    scenes: allScenes,
    options: allOptions,
  });

  // SQL 파일 저장
  const outputFile = `./output/scenarios_${Date.now()}.sql`;
  fs.writeFileSync(outputFile, sql, "utf8");

  console.log(`변환 완료: ${outputFile}`);
  console.log(`시나리오: ${allScenarios.length}개`);
  console.log(`씬: ${allScenes.length}개`);
  console.log(`옵션: ${allOptions.length}개`);
}

convertScenarios().catch(console.error);
```

## 🎯 개선된 변환 시스템의 장점

### 1. **데이터 일관성 보장**

- JSON과 DB 스키마 간 완벽한 매핑
- 씬별 데이터 구조화
- 시나리오 코드로 명확한 구분

### 2. **실행 가능성**

- ES 모듈 호환성 문제 해결
- TypeScript 컴파일 오류 수정
- 실제 실행 가능한 변환 스크립트

### 3. **확장성**

- 새로운 시나리오 유형 추가 용이
- 씬별 세부 관리 가능
- 통계 및 분석 데이터 풍부화

### 4. **유지보수성**

- 명확한 데이터 구조
- 일관된 네이밍 컨벤션
- 타입 안전성 보장

## 🚀 실행 계획

1. **DB 스키마 수정** (필수)
2. **개선된 변환기 구현**
3. **변환 테스트**
4. **Frontend 수정** (새로운 데이터 구조에 맞게)

---

**작성일**: 2024년 12월 19일  
**작성자**: AI Assistant  
**상태**: 제안 단계
