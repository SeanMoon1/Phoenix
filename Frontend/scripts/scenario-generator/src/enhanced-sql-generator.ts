/**
 * 개선된 SQL 생성기
 * - 시나리오 씬 테이블 지원
 * - 포인트 시스템 지원
 * - 시나리오 ID 고유성 보장
 */

import { ScenarioData, SceneData, OptionData } from './enhanced-converter';

export class EnhancedSQLGenerator {
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
    data.scenarios.forEach(scenario => {
      const scenarioSql = this.generateScenarioSQL(scenario);
      sqlStatements.push(scenarioSql);
    });

    // 2. 씬 생성
    data.scenes.forEach(scene => {
      const sceneSql = this.generateSceneSQL(scene);
      sqlStatements.push(sceneSql);
    });

    // 3. 선택 옵션 생성
    data.options.forEach(option => {
      const optionSql = this.generateOptionSQL(option);
      sqlStatements.push(optionSql);
    });

    return sqlStatements.join('\n\n');
  }

  /**
   * 시나리오 SQL 생성
   */
  private generateScenarioSQL(scenario: ScenarioData): string {
    return `-- 시나리오 생성: ${scenario.title}
INSERT INTO scenario (team_id, scenario_code, title, description, disaster_type, risk_level, difficulty, status, created_by, created_at) 
VALUES (${scenario.team_id}, '${scenario.scenario_code}', '${this.escapeSQL(scenario.title)}', '${this.escapeSQL(scenario.description)}', '${scenario.disaster_type}', '${scenario.risk_level}', '${scenario.difficulty}', '${scenario.status}', ${scenario.created_by}, NOW());
SET @scenario_id_${scenario.scenario_code} = LAST_INSERT_ID();`;
  }

  /**
   * 씬 SQL 생성
   */
  private generateSceneSQL(scene: SceneData): string {
    return `-- 씬 생성: ${scene.title}
INSERT INTO scenario_scene (scenario_id, scene_code, scene_order, title, content, scene_script, created_by, created_at)
VALUES (@scenario_id_${scene.scenario_code}, '${scene.scene_code}', ${scene.scene_order}, '${this.escapeSQL(scene.title)}', '${this.escapeSQL(scene.content)}', '${this.escapeSQL(scene.scene_script)}', ${scene.created_by}, NOW());
SET @scene_id_${scene.scene_code} = LAST_INSERT_ID();`;
  }

  /**
   * 선택 옵션 SQL 생성
   */
  private generateOptionSQL(option: OptionData): string {
    const nextSceneCode = option.next_scene_code ? `'${option.next_scene_code}'` : 'NULL';
    const answerPreview = option.option_text.substring(0, 30) + (option.option_text.length > 30 ? '...' : '');
    
    return `-- 선택 옵션 생성: ${answerPreview}
INSERT INTO choice_option (scene_id, scenario_id, choice_code, choice_text, reaction_text, next_scene_code, speed_points, accuracy_points, exp_points, is_correct, created_by, created_at)
VALUES (@scene_id_${option.scene_code}, @scenario_id_${option.scene_code.split('-')[0]}, '${option.option_code}', '${this.escapeSQL(option.option_text)}', '${this.escapeSQL(option.reaction_text)}', ${nextSceneCode}, ${option.speed_points}, ${option.accuracy_points}, ${option.exp_points}, ${option.is_correct ? 1 : 0}, ${option.created_by}, NOW());`;
  }

  /**
   * SQL 문자열 이스케이프
   */
  private escapeSQL(str: string): string {
    return str.replace(/'/g, "''");
  }

  /**
   * 배치 SQL 생성 (트랜잭션 포함)
   */
  generateBatchSQL(data: {
    scenarios: ScenarioData[];
    scenes: SceneData[];
    options: OptionData[];
  }): string {
    const sqlStatements: string[] = [];

    sqlStatements.push('-- =====================================================');
    sqlStatements.push('-- Phoenix 시나리오 데이터 배치 삽입');
    sqlStatements.push(`-- 생성일: ${new Date().toISOString()}`);
    sqlStatements.push('-- =====================================================');
    sqlStatements.push('');
    sqlStatements.push('START TRANSACTION;');
    sqlStatements.push('');

    // 시나리오 생성
    if (data.scenarios.length > 0) {
      sqlStatements.push('-- 시나리오 데이터 삽입');
      data.scenarios.forEach(scenario => {
        sqlStatements.push(this.generateScenarioSQL(scenario));
        sqlStatements.push('');
      });
    }

    // 씬 생성
    if (data.scenes.length > 0) {
      sqlStatements.push('-- 씬 데이터 삽입');
      data.scenes.forEach(scene => {
        sqlStatements.push(this.generateSceneSQL(scene));
        sqlStatements.push('');
      });
    }

    // 선택 옵션 생성
    if (data.options.length > 0) {
      sqlStatements.push('-- 선택 옵션 데이터 삽입');
      data.options.forEach(option => {
        sqlStatements.push(this.generateOptionSQL(option));
        sqlStatements.push('');
      });
    }

    sqlStatements.push('COMMIT;');
    sqlStatements.push('');
    sqlStatements.push('-- 배치 삽입 완료');

    return sqlStatements.join('\n');
  }

  /**
   * 롤백 SQL 생성
   */
  generateRollbackSQL(scenarioCodes: string[]): string {
    const sqlStatements: string[] = [];

    sqlStatements.push('-- =====================================================');
    sqlStatements.push('-- Phoenix 시나리오 데이터 롤백');
    sqlStatements.push(`-- 생성일: ${new Date().toISOString()}`);
    sqlStatements.push('-- =====================================================');
    sqlStatements.push('');
    sqlStatements.push('START TRANSACTION;');
    sqlStatements.push('');

    scenarioCodes.forEach(code => {
      sqlStatements.push(`-- 시나리오 ${code} 관련 데이터 삭제`);
      sqlStatements.push(`DELETE FROM choice_option WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = '${code}');`);
      sqlStatements.push(`DELETE FROM scenario_scene WHERE scenario_id IN (SELECT scenario_id FROM scenario WHERE scenario_code = '${code}');`);
      sqlStatements.push(`DELETE FROM scenario WHERE scenario_code = '${code}';`);
      sqlStatements.push('');
    });

    sqlStatements.push('COMMIT;');
    sqlStatements.push('');
    sqlStatements.push('-- 롤백 완료');

    return sqlStatements.join('\n');
  }
}
