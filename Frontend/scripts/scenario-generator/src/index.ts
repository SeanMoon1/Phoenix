#!/usr/bin/env node

/**
 * Phoenix 시나리오 생성기 메인 진입점
 */

import { Command } from 'commander';
import { Logger } from './logger';

const program = new Command();

program
  .name('phoenix-scenario-generator')
  .description('Phoenix 시나리오 데이터 변환 및 검증 도구')
  .version('1.0.0');

// 하위 명령어 등록
program
  .command('convert <input-file>')
  .description('단일 시나리오 파일을 MySQL INSERT 문으로 변환')
  .option('-t, --team-id <id>', '팀 ID', '1')
  .option('-c, --created-by <id>', '생성자 ID', '1')
  .option('-b, --backup', '백업 생성')
  .option('-v, --verbose', '상세 로그')
  .option('-d, --debug', '디버그 모드')
  .option('-o, --output <file>', '출력 파일 경로')
  .action(async (inputFile: string, options: Record<string, unknown>) => {
    const { convertScenario } = await import('./convert-scenario');
    const logger = new Logger(Boolean(options.verbose), Boolean(options.debug));

    try {
      await convertScenario(inputFile, options, logger);
    } catch (error) {
      logger.error(
        `변환 실패: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

program
  .command('convert-all')
  .description('data 폴더의 모든 시나리오를 MySQL INSERT 문으로 변환')
  .option('-t, --team-id <id>', '팀 ID', '1')
  .option('-c, --created-by <id>', '생성자 ID', '1')
  .option('-b, --backup', '백업 생성')
  .option('-v, --verbose', '상세 로그')
  .option('-d, --debug', '디버그 모드')
  .option('-o, --output <dir>', '출력 디렉토리', './output/sql')
  .action(async (options: Record<string, unknown>) => {
    const { convertAllScenarios } = await import('./convert-all');
    const logger = new Logger(Boolean(options.verbose), Boolean(options.debug));

    try {
      await convertAllScenarios(options, logger);
    } catch (error) {
      logger.error(
        `일괄 변환 실패: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }
  });

program
  .command('validate [input-file]')
  .description('시나리오 JSON 데이터의 유효성을 검사')
  .option('-v, --verbose', '상세 로그')
  .option('-d, --debug', '디버그 모드')
  .option('-s, --strict', '엄격 모드 (경고도 오류로 처리)')
  .action(async (inputFile?: string, options?: Record<string, unknown>) => {
    const { validateFile, validateAllFiles } = await import('./validate-data');
    const logger = new Logger(
      Boolean(options?.verbose),
      Boolean(options?.debug)
    );

    try {
      if (inputFile) {
        const result = await validateFile(inputFile, options || {}, logger);
        process.exit(result.valid ? 0 : 1);
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

program
  .command('stats')
  .description('시나리오 데이터 통계 생성')
  .option('-v, --verbose', '상세 로그')
  .action(async (options: Record<string, unknown>) => {
    const logger = new Logger(Boolean(options.verbose), false);

    try {
      await generateStats(logger);
    } catch (error) {
      logger.error(
        `통계 생성 실패: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }
  });

async function generateStats(logger: Logger): Promise<void> {
  const { config } = await import('./config');
  const { ScenarioValidator } = await import('./validator');
  const { ScenarioConverter } = await import('./converter');
  const fs = await import('fs');
  const path = await import('path');

  logger.header('Phoenix 시나리오 통계');

  const dataDir = path.resolve(__dirname, config.dataDir);

  if (!fs.existsSync(dataDir)) {
    throw new Error(`데이터 디렉토리를 찾을 수 없습니다: ${dataDir}`);
  }

  const files = fs
    .readdirSync(dataDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(dataDir, file));

  if (files.length === 0) {
    logger.warn('분석할 파일이 없습니다.');
    return;
  }

  // const validator = new ScenarioValidator();
  const converter = new ScenarioConverter(logger);

  let totalEvents = 0;
  let totalOptions = 0;
  const disasterTypes = new Set<string>();
  const difficulties = new Set<string>();
  const riskLevels = new Set<string>();

  logger.info(`분석할 파일: ${files.length}개`);

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const stats = converter.generateStatistics(data);

      totalEvents += stats.totalEvents;
      totalOptions += stats.totalOptions;
      stats.disasterTypes.forEach(type => disasterTypes.add(type));
      stats.difficulties.forEach(diff => difficulties.add(diff));
      stats.riskLevels.forEach(risk => riskLevels.add(risk));

      logger.info(
        `${path.basename(file)}: ${stats.totalEvents}개 이벤트, ${
          stats.totalOptions
        }개 옵션`
      );
    } catch {
      logger.error(`파일 분석 실패: ${path.basename(file)}`);
    }
  }

  logger.subheader('전체 통계');
  logger.table({
    '총 파일 수': files.length,
    '총 이벤트 수': totalEvents,
    '총 선택 옵션 수': totalOptions,
    '평균 옵션 수/이벤트':
      totalEvents > 0 ? (totalOptions / totalEvents).toFixed(1) : '0',
    '재난 유형': Array.from(disasterTypes).join(', ') || '없음',
    난이도: Array.from(difficulties).join(', ') || '없음',
    위험도: Array.from(riskLevels).join(', ') || '없음',
  });
}

// CLI 실행
if (require.main === module) {
  program.parse();
}

export { program };
