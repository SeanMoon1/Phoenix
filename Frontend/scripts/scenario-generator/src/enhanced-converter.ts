/**
 * 개선된 시나리오 변환기
 * - 시나리오 ID 고유성 보장
 * - 씬 기반 데이터 구조
 * - 포인트 시스템 지원
 * - 선택 옵션 랜덤 섞기
 */

import { OptionShuffler, ShuffleOptions } from './option-shuffler';

export interface ScenarioData {
  scenario_code: string;
  team_id: number;
  title: string;
  description: string;
  disaster_type: string;
  risk_level: string;
  difficulty: string;
  status: string;
  created_by: number;
}

export interface SceneData {
  scenario_code: string;
  scene_code: string;
  scene_order: number;
  title: string;
  content: string;
  scene_script: string;
  created_by: number;
}

export interface OptionData {
  scene_code: string;
  option_code: string;
  option_text: string;
  reaction_text: string;
  next_scene_code: string | null;
  speed_points: number;
  accuracy_points: number;
  exp_points: number;
  is_correct: boolean;
  created_by: number;
}

export interface ConversionResult {
  scenarios: ScenarioData[];
  scenes: SceneData[];
  options: OptionData[];
}

export interface ConversionOptions {
  teamId?: number;
  createdBy?: number;
  shuffleOptions?: ShuffleOptions;
  enableShuffling?: boolean;
}

export class EnhancedScenarioConverter {
  private teamId: number;
  private createdBy: number;
  private optionShuffler: OptionShuffler;
  private enableShuffling: boolean;

  constructor(teamId: number = 1, createdBy: number = 1, enableShuffling: boolean = true) {
    this.teamId = teamId;
    this.createdBy = createdBy;
    this.enableShuffling = enableShuffling;
    this.optionShuffler = new OptionShuffler();
  }

  /**
   * JSON 시나리오를 DB 형식으로 변환
   */
  convertToDatabaseFormat(jsonData: any[], options: ConversionOptions = {}): ConversionResult {
    const scenarios: ScenarioData[] = [];
    const scenes: SceneData[] = [];
    const optionsData: OptionData[] = [];

    // 옵션 섞기 설정
    const shuffleOptions = options.shuffleOptions || {
      useSeed: true,
      seed: Date.now(),
      preserveCorrectness: true
    };

    // 옵션 섞기 적용
    let processedData = jsonData;
    if (this.enableShuffling && options.enableShuffling !== false) {
      processedData = this.optionShuffler.shuffleScenarioOptions(jsonData, shuffleOptions);
    }

    // 시나리오별로 그룹화
    const scenarioGroups = this.groupByScenario(processedData);

    scenarioGroups.forEach((scenes, scenarioCode) => {
      const firstScene = scenes[0];

      // 시나리오 데이터 생성
      const scenario: ScenarioData = {
        scenario_code: scenarioCode,
        team_id: this.teamId,
        title: this.extractScenarioTitle(firstScene),
        description: this.extractScenarioDescription(firstScene),
        disaster_type: firstScene.disasterType || 'fire',
        risk_level: firstScene.riskLevel || 'MEDIUM',
        difficulty: firstScene.difficulty || 'easy',
        status: 'ACTIVE',
        created_by: this.createdBy,
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
          created_by: this.createdBy,
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
              next_scene_code: option.nextId || null,
              speed_points: option.points?.speed || 0,
              accuracy_points: option.points?.accuracy || 0,
              exp_points: option.exp || 0,
              is_correct: this.determineCorrectness(option),
              created_by: this.createdBy,
            };
            optionsData.push(optionData);
          });
        }
      });
    });

    return { scenarios, scenes, options: optionsData };
  }

  /**
   * 시나리오별로 씬 그룹화
   */
  private groupByScenario(data: any[]): Map<string, any[]> {
    const groups = new Map<string, any[]>();

    data.forEach(item => {
      const scenarioCode = item.scenarioCode || this.generateScenarioCode(item);
      if (!groups.has(scenarioCode)) {
        groups.set(scenarioCode, []);
      }
      groups.get(scenarioCode)!.push(item);
    });

    return groups;
  }

  /**
   * 시나리오 코드 생성 (고유성 보장)
   */
  private generateScenarioCode(item: any): string {
    const disasterType = item.disasterType || 'fire';
    const typeCode = this.getDisasterTypeCode(disasterType);
    const timestamp = Date.now().toString().slice(-6); // 마지막 6자리
    return `${typeCode}${timestamp}`;
  }

  /**
   * 재난 유형별 코드 매핑
   */
  private getDisasterTypeCode(disasterType: string): string {
    const typeMap: { [key: string]: string } = {
      fire: 'FIR',
      earthquake: 'EAR',
      emergency: 'EME',
      traffic: 'TRA',
      flood: 'FLO',
      complex: 'COM',
    };
    return typeMap[disasterType] || 'GEN';
  }

  /**
   * 시나리오 제목 추출
   */
  private extractScenarioTitle(scene: any): string {
    // 첫 번째 씬의 제목을 시나리오 제목으로 사용
    return scene.title || '시나리오';
  }

  /**
   * 시나리오 설명 추출
   */
  private extractScenarioDescription(scene: any): string {
    // 첫 번째 씬의 내용을 시나리오 설명으로 사용
    return scene.content || '시나리오 설명';
  }

  /**
   * 정답 여부 판단
   */
  private determineCorrectness(option: any): boolean {
    const points = option.points;
    return points && points.speed > 0 && points.accuracy > 0;
  }

  /**
   * 변환 통계 생성
   */
  generateStatistics(result: ConversionResult): {
    totalScenarios: number;
    totalScenes: number;
    totalOptions: number;
    disasterTypes: string[];
    difficulties: string[];
    riskLevels: string[];
  } {
    const disasterTypes = [
      ...new Set(result.scenarios.map(s => s.disaster_type)),
    ];
    const difficulties = [...new Set(result.scenarios.map(s => s.difficulty))];
    const riskLevels = [...new Set(result.scenarios.map(s => s.risk_level))];

    return {
      totalScenarios: result.scenarios.length,
      totalScenes: result.scenes.length,
      totalOptions: result.options.length,
      disasterTypes,
      difficulties,
      riskLevels,
    };
  }
}
