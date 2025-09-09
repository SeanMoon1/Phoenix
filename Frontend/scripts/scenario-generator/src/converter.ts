/**
 * 시나리오 데이터 변환기
 */

import { ScenarioEvent, ChoiceOption, ConversionOptions } from './types';
import { config, sqlTemplates } from './config';
import { Logger } from './logger';

export class ScenarioConverter {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * 시나리오 데이터를 MySQL INSERT 문으로 변환
   */
  convertToMySQL(data: ScenarioEvent[], options: ConversionOptions): string {
    const sqlStatements: string[] = [];

    // 첫 번째 이벤트에서 시나리오 정보 추출
    const firstEvent = data[0];
    if (!firstEvent) {
      throw new Error('변환할 데이터가 없습니다.');
    }

    // 시나리오 생성
    const scenarioSql = this.generateScenarioSQL(firstEvent, options);
    sqlStatements.push(scenarioSql);

    // 각 이벤트 처리
    data.forEach((event, index) => {
      const eventSql = this.generateEventSQL(event, index, options);
      sqlStatements.push(eventSql);

      // 선택 옵션 처리
      if (event.options && Array.isArray(event.options)) {
        event.options.forEach((option, optionIndex) => {
          const optionSql = this.generateOptionSQL(
            option,
            index,
            optionIndex,
            options
          );
          sqlStatements.push(optionSql);
        });
      }
    });

    return sqlStatements.join('\n\n');
  }

  /**
   * 시나리오 SQL 생성
   */
  private generateScenarioSQL(
    event: ScenarioEvent,
    options: ConversionOptions
  ): string {
    const scenarioCode =
      event.scenarioCode || `${config.defaultScenarioCode}_${Date.now()}`;
    const disasterType = event.disasterType || 'fire';
    const riskLevel = event.riskLevel || 'MEDIUM';
    const difficulty = event.difficulty || 'easy';

    return sqlTemplates.scenario
      .replace('{{teamId}}', options.teamId.toString())
      .replace('{{scenarioCode}}', scenarioCode)
      .replace('{{title}}', this.escapeSQL(event.title))
      .replace('{{content}}', this.escapeSQL(event.content))
      .replace('{{disasterType}}', disasterType)
      .replace('{{riskLevel}}', riskLevel)
      .replace('{{difficulty}}', difficulty)
      .replace('{{createdBy}}', options.createdBy.toString());
  }

  /**
   * 이벤트 SQL 생성
   */
  private generateEventSQL(
    event: ScenarioEvent,
    index: number,
    options: ConversionOptions
  ): string {
    const eventCode = `${config.defaultEventCode}_${String(index + 1).padStart(
      3,
      '0'
    )}`;
    const eventOrder = index + 1;
    const eventType = 'CHOICE'; // 기본값

    return sqlTemplates.event
      .replace('{{title}}', this.escapeSQL(event.title))
      .replace('{{eventCode}}', eventCode)
      .replace('{{content}}', this.escapeSQL(event.content))
      .replace('{{sceneScript}}', this.escapeSQL(event.sceneScript))
      .replace('{{eventOrder}}', eventOrder.toString())
      .replace('{{eventType}}', eventType)
      .replace('{{index}}', index.toString())
      .replace('{{createdBy}}', options.createdBy.toString());
  }

  /**
   * 선택 옵션 SQL 생성
   */
  private generateOptionSQL(
    option: ChoiceOption,
    eventIndex: number,
    optionIndex: number,
    options: ConversionOptions
  ): string {
    const optionCode = `${config.defaultOptionCode}_${String(
      eventIndex + 1
    ).padStart(3, '0')}_${String(optionIndex + 1).padStart(2, '0')}`;
    const pointsSpeed = option.points?.speed || 0;
    const pointsAccuracy = option.points?.accuracy || 0;
    const expReward = option.exp || 0;
    const isCorrect = pointsSpeed > 0 && pointsAccuracy > 0 ? 1 : 0;
    const nextEventId = option.nextId ? `'${option.nextId}'` : 'NULL';
    const answerPreview =
      option.answer.substring(0, 30) + (option.answer.length > 30 ? '...' : '');

    return sqlTemplates.option
      .replace('{{answerPreview}}', this.escapeSQL(answerPreview))
      .replace('{{index}}', eventIndex.toString())
      .replace('{{optionCode}}', optionCode)
      .replace('{{answer}}', this.escapeSQL(option.answer))
      .replace('{{reaction}}', this.escapeSQL(option.reaction))
      .replace('{{nextEventId}}', nextEventId)
      .replace('{{pointsSpeed}}', pointsSpeed.toString())
      .replace('{{pointsAccuracy}}', pointsAccuracy.toString())
      .replace('{{expReward}}', expReward.toString())
      .replace('{{isCorrect}}', isCorrect.toString())
      .replace('{{createdBy}}', options.createdBy.toString());
  }

  /**
   * SQL 문자열 이스케이프
   */
  private escapeSQL(str: string): string {
    return str.replace(/'/g, "''");
  }

  /**
   * 통계 생성
   */
  generateStatistics(data: ScenarioEvent[]): {
    totalEvents: number;
    totalOptions: number;
    averageOptionsPerEvent: number;
    disasterTypes: string[];
    difficulties: string[];
    riskLevels: string[];
  } {
    const totalEvents = data.length;
    const totalOptions = data.reduce(
      (sum, event) => sum + (event.options?.length || 0),
      0
    );
    const averageOptionsPerEvent =
      totalEvents > 0 ? totalOptions / totalEvents : 0;

    const disasterTypes = [
      ...new Set(
        data
          .map(event => event.disasterType)
          .filter((type): type is string => Boolean(type))
      ),
    ];
    const difficulties = [
      ...new Set(
        data
          .map(event => event.difficulty)
          .filter((diff): diff is string => Boolean(diff))
      ),
    ];
    const riskLevels = [
      ...new Set(
        data
          .map(event => event.riskLevel)
          .filter((level): level is string => Boolean(level))
      ),
    ];

    return {
      totalEvents,
      totalOptions,
      averageOptionsPerEvent: Number(averageOptionsPerEvent.toFixed(1)),
      disasterTypes,
      difficulties,
      riskLevels,
    };
  }

  /**
   * ID 생성기
   */
  generateId(prefix: string, index: number, padding = 3): string {
    return `${prefix}_${String(index).padStart(padding, '0')}`;
  }

  /**
   * 시나리오 코드 생성
   */
  generateScenarioCode(disasterType: string, index: number): string {
    const typeCode = disasterType.toUpperCase().substring(0, 3);
    return `${typeCode}_${String(index).padStart(3, '0')}`;
  }

  /**
   * 이벤트 ID 생성
   */
  generateEventId(scenarioIndex: number, eventIndex: number): string {
    return `#${scenarioIndex}-${eventIndex}`;
  }
}
