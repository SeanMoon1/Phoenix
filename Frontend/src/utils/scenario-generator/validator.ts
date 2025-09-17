/**
 * 시나리오 데이터 검증기
 */

import type {
  ScenarioGeneratorEvent,
  ChoiceOption,
  ValidationResult,
  ValidationStats,
} from '../../types';
import { validationConfig } from './config';

export class ScenarioValidator {
  private config = validationConfig;

  /**
   * 전체 시나리오 데이터 검증
   */
  validateScenarioData(data: ScenarioGeneratorEvent[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const stats: ValidationStats = {
      totalEvents: 0,
      totalOptions: 0,
      disasterTypes: new Set(),
      difficulties: new Set(),
      riskLevels: new Set(),
    };

    if (!Array.isArray(data)) {
      errors.push('데이터는 배열 형태여야 합니다.');
      return { valid: false, errors, warnings };
    }

    if (data.length === 0) {
      errors.push('데이터가 비어있습니다.');
      return { valid: false, errors, warnings };
    }

    // 각 이벤트 검증
    data.forEach((event, index) => {
      const eventResult = this.validateEvent(event, index);
      errors.push(...eventResult.errors);
      warnings.push(...eventResult.warnings);

      // 통계 수집
      stats.totalEvents++;
      if (event.options) {
        stats.totalOptions += event.options.length;
      }
      if (event.disasterType) {
        stats.disasterTypes.add(event.disasterType);
      }
      if (event.difficulty) {
        stats.difficulties.add(event.difficulty);
      }
      if (event.riskLevel) {
        stats.riskLevels.add(event.riskLevel);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 개별 이벤트 검증
   */
  private validateEvent(event: ScenarioGeneratorEvent, index: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 필수 필드 검증
    this.config.required.forEach(field => {
      if (!event[field as keyof ScenarioGeneratorEvent]) {
        errors.push(
          `이벤트 ${index + 1}: 필수 필드 '${field}'가 누락되었습니다.`
        );
      }
    });

    // 타입 검증
    Object.entries(this.config.types).forEach(([field, expectedType]) => {
      const value = event[field as keyof ScenarioGeneratorEvent];
      if (value !== undefined) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== expectedType) {
          errors.push(
            `이벤트 ${
              index + 1
            }: 필드 '${field}'의 타입이 잘못되었습니다. (예상: ${expectedType}, 실제: ${actualType})`
          );
        }
      }
    });

    // 길이 검증
    Object.entries(this.config.maxLengths).forEach(([field, maxLength]) => {
      const value = event[field as keyof ScenarioGeneratorEvent] as string;
      if (value && value.length > maxLength) {
        warnings.push(
          `이벤트 ${index + 1}: 필드 '${field}'의 길이가 너무 깁니다. (${
            value.length
          }/${maxLength})`
        );
      }
    });

    // 허용된 값 검증
    Object.entries(this.config.allowedValues).forEach(
      ([field, allowedValues]) => {
        const value = event[field as keyof ScenarioGeneratorEvent] as string;
        if (value && !allowedValues.includes(value)) {
          warnings.push(
            `이벤트 ${
              index + 1
            }: 필드 '${field}'의 값이 허용되지 않습니다. (${value})`
          );
        }
      }
    );

    // 옵션 검증
    if (event.options && Array.isArray(event.options)) {
      if (event.options.length === 0) {
        errors.push(`이벤트 ${index + 1}: 최소 1개의 선택 옵션이 필요합니다.`);
      }

      event.options.forEach((option, optionIndex) => {
        const optionErrors = this.validateOption(
          option,
          index + 1,
          optionIndex + 1
        );
        errors.push(...optionErrors);
      });
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  /**
   * 선택 옵션 검증
   */
  private validateOption(
    option: ChoiceOption,
    eventIndex: number,
    optionIndex: number
  ): string[] {
    const errors: string[] = [];

    // 필수 필드
    const requiredFields: (keyof ChoiceOption)[] = [
      'choiceText',
      'reactionText',
    ];
    requiredFields.forEach(field => {
      if (!option[field]) {
        errors.push(
          `이벤트 ${eventIndex} 옵션 ${optionIndex}: 필수 필드 '${field}'가 누락되었습니다.`
        );
      }
    });

    // 타입 검증
    if (option.choiceText && typeof option.choiceText !== 'string') {
      errors.push(
        `이벤트 ${eventIndex} 옵션 ${optionIndex}: 'choiceText'는 문자열이어야 합니다.`
      );
    }

    if (option.reactionText && typeof option.reactionText !== 'string') {
      errors.push(
        `이벤트 ${eventIndex} 옵션 ${optionIndex}: 'reactionText'는 문자열이어야 합니다.`
      );
    }

    // 포인트 검증
    if (typeof option.speedPoints !== 'number' || option.speedPoints < 0) {
      errors.push(
        `이벤트 ${eventIndex} 옵션 ${optionIndex}: 'speedPoints'는 0 이상의 숫자여야 합니다.`
      );
    }

    if (typeof option.accuracyPoints !== 'number' || option.accuracyPoints < 0) {
      errors.push(
        `이벤트 ${eventIndex} 옵션 ${optionIndex}: 'accuracyPoints'는 0 이상의 숫자여야 합니다.`
      );
    }

    // 경험치 검증
    if (
      option.expPoints !== undefined &&
      (typeof option.expPoints !== 'number' || option.expPoints < 0)
    ) {
      errors.push(
        `이벤트 ${eventIndex} 옵션 ${optionIndex}: 'expPoints'는 0 이상의 숫자여야 합니다.`
      );
    }

    return errors;
  }

  /**
   * 파일 경로 검증
   */
  validateFilePath(filePath: string): boolean {
    return filePath.endsWith('.json');
  }

  /**
   * 시나리오 코드 검증
   */
  validateScenarioCode(code: string): boolean {
    return /^[A-Z0-9_]+$/.test(code);
  }

  /**
   * 이벤트 ID 검증
   */
  validateEventId(id: string): boolean {
    return /^#[0-9]+-[0-9]+$/.test(id);
  }
}
