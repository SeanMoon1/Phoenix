#!/usr/bin/env node

/**
 * Phoenix 시나리오 데이터 검증기 (TypeScript)
 * 시나리오 JSON 데이터의 유효성을 검사
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { ScenarioEvent } from './types';
import { ScenarioValidator } from './validator';
import { Logger } from './logger';
import { config } from './config';

const program = new Command();

program
  .name('validate-data')
  .description('Phoenix 시나리오 JSON 데이터의 유효성을 검사')
  .version('1.0.0')
  .argument(
    '[input-file]',
    '검증할 JSON 파일 경로 (생략 시 data 폴더 전체 검증)'
  )
  .option('-v, --verbose', '상세 로그')
  .option('-d, --debug', '디버그 모드')
  .option('-s, --strict', '엄격 모드 (경고도 오류로 처리)')
  .action(async (inputFile?: string, options?: Record<string, unknown>) => {
    const logger = new Logger(
      Boolean(options?.verbose),
      Boolean(options?.debug)
    );

    try {
      if (inputFile) {
        await validateSingleFile(inputFile, options || {}, logger);
      } else {
        await validateAllFiles(options || {}, logger);
      }
    } catch (error) {
      logger.error(
        `검증 실패: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

async function validateSingleFile(
  inputFile: string,
  options: Record<string, unknown>,
  logger: Logger
): Promise<void> {
  if (!fs.existsSync(inputFile)) {
    throw new Error(`파일을 찾을 수 없습니다: ${inputFile}`);
  }

  const result = await validateFile(inputFile, options, logger);
  process.exit(result.valid ? 0 : 1);
}

async function validateAllFiles(options: any, logger: Logger): Promise<void> {
  const dataDir = path.resolve(__dirname, config.dataDir);

  if (!fs.existsSync(dataDir)) {
    throw new Error(`데이터 디렉토리를 찾을 수 없습니다: ${dataDir}`);
  }

  const files = fs
    .readdirSync(dataDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(dataDir, file));

  if (files.length === 0) {
    logger.warn('검증할 파일이 없습니다.');
    return;
  }

  logger.header(`시나리오 데이터 검증 (${files.length}개 파일)`);

  const results = await Promise.all(
    files.map(file => validateFile(file, options, logger))
  );

  // 전체 결과 요약
  const totalErrors = results.reduce(
    (sum, result) => sum + result.errorCount,
    0
  );
  const totalWarnings = results.reduce(
    (sum, result) => sum + result.warningCount,
    0
  );
  const validFiles = results.filter(result => result.valid).length;

  logger.header('검증 완료');

  logger.table({
    '총 파일 수': files.length,
    '유효한 파일': validFiles,
    '오류가 있는 파일': files.length - validFiles,
    '총 오류 수': totalErrors,
    '총 경고 수': totalWarnings,
  });

  // 상세 결과
  logger.subheader('상세 결과');
  results.forEach((result, index) => {
    if (result.valid) {
      logger.success(`${index + 1}. ${result.file} - 유효함`);
    } else {
      logger.error(`${index + 1}. ${result.file} - 오류 있음`);
      if (result.error) {
        logger.error(`   오류: ${result.error}`);
      }
    }
  });

  process.exit(totalErrors > 0 ? 1 : 0);
}

async function validateFile(
  filePath: string,
  options: any,
  logger: Logger
): Promise<{
  file: string;
  valid: boolean;
  errorCount: number;
  warningCount: number;
  stats?: any;
  error?: string;
}> {
  try {
    logger.info(`검증 시작: ${path.basename(filePath)}`);

    // JSON 파일 읽기
    const jsonData: ScenarioEvent[] = JSON.parse(
      fs.readFileSync(filePath, 'utf8')
    );

    // 데이터 검증
    const validator = new ScenarioValidator();
    const validationResult = validator.validateScenarioData(jsonData);

    // 엄격 모드에서는 경고도 오류로 처리
    const hasErrors = options?.strict
      ? validationResult.errors.length > 0 ||
        validationResult.warnings.length > 0
      : validationResult.errors.length > 0;

    // 결과 출력
    if (hasErrors) {
      logger.error(`검증 실패: ${path.basename(filePath)}`);
    } else {
      logger.success(`검증 완료: ${path.basename(filePath)}`);
    }

    if (validationResult.errors.length > 0) {
      logger.error(`오류: ${validationResult.errors.length}개`);
      validationResult.errors.forEach(error => logger.error(`  ❌ ${error}`));
    }

    if (validationResult.warnings.length > 0) {
      logger.warn(`경고: ${validationResult.warnings.length}개`);
      validationResult.warnings.forEach(warning =>
        logger.warn(`  ⚠️ ${warning}`)
      );
    }

    // 통계 생성
    const stats = generateValidationStats(jsonData);

    if (options?.verbose) {
      logger.subheader('통계');
      logger.table({
        '이벤트 수': stats.totalEvents,
        '선택 옵션 수': stats.totalOptions,
        '재난 유형': stats.disasterTypes.join(', ') || '없음',
        난이도: stats.difficulties.join(', ') || '없음',
        위험도: stats.riskLevels.join(', ') || '없음',
      });
    }

    return {
      file: path.basename(filePath),
      valid: !hasErrors,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length,
      stats,
    };
  } catch (error) {
    logger.error(
      `파일 읽기 실패: ${path.basename(filePath)} - ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return {
      file: path.basename(filePath),
      valid: false,
      errorCount: 1,
      warningCount: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function generateValidationStats(data: ScenarioEvent[]): {
  totalEvents: number;
  totalOptions: number;
  disasterTypes: string[];
  difficulties: string[];
  riskLevels: string[];
} {
  const totalEvents = data.length;
  const totalOptions = data.reduce(
    (sum, event) => sum + (event.options?.length || 0),
    0
  );

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
    disasterTypes,
    difficulties,
    riskLevels,
  };
}

// CLI 실행
if (require.main === module) {
  program.parse();
}

export { validateFile, validateAllFiles };
