#!/usr/bin/env node

/**
 * Phoenix 시나리오 일괄 변환기 (TypeScript)
 * data 폴더의 모든 시나리오를 MySQL INSERT 문으로 변환
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import {
  ScenarioEvent,
  ConversionOptions,
  ConversionResult,
  Statistics,
} from "./types";
import { ScenarioValidator } from "./validator";
import { ScenarioConverter } from "./converter";
import { Logger } from "./logger";
import { config } from "./config";

const program = new Command();

program
  .name("convert-all")
  .description("data 폴더의 모든 시나리오를 MySQL INSERT 문으로 변환")
  .version("1.0.0")
  .option("-t, --team-id <id>", "팀 ID", config.defaultTeamId.toString())
  .option(
    "-c, --created-by <id>",
    "생성자 ID",
    config.defaultCreatedBy.toString()
  )
  .option("-b, --backup", "백업 생성")
  .option("-v, --verbose", "상세 로그")
  .option("-d, --debug", "디버그 모드")
  .option("-o, --output <dir>", "출력 디렉토리", config.outputDir)
  .action(async (options: any) => {
    const logger = new Logger(options.verbose, options.debug);

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

async function convertAllScenarios(
  options: any,
  logger: Logger
): Promise<void> {
  logger.header("Phoenix 시나리오 일괄 변환");

  // 출력 디렉토리 생성
  fs.mkdirSync(options.output, { recursive: true });

  // 시나리오 파일 찾기
  const scenarioFiles = findScenarioFiles(logger);

  if (scenarioFiles.length === 0) {
    logger.warn("변환할 시나리오 파일이 없습니다.");
    return;
  }

  // 변환 옵션 설정
  const conversionOptions: ConversionOptions = {
    teamId: parseInt(options.teamId),
    createdBy: parseInt(options.createdBy),
    backup: options.backup || false,
    verbose: options.verbose || false,
    debug: options.debug || false,
  };

  // 각 파일 변환
  const results: (ConversionResult | null)[] = [];
  const validator = new ScenarioValidator();
  const converter = new ScenarioConverter(logger);

  for (const filePath of scenarioFiles) {
    const result = await convertSingleFile(
      filePath,
      conversionOptions,
      validator,
      converter,
      logger
    );
    results.push(result);
  }

  // 통계 생성 및 출력
  const stats = generateStatistics(results);
  printResults(results, stats, logger);

  // 통합 SQL 파일 생성
  if (stats.successCount > 0) {
    await createIntegratedSQL(results, options.output, logger);
  }
}

function findScenarioFiles(logger: Logger): string[] {
  const dataPath = path.resolve(__dirname, config.dataDir);

  if (!fs.existsSync(dataPath)) {
    logger.error(`데이터 디렉토리를 찾을 수 없습니다: ${dataPath}`);
    return [];
  }

  const files = fs
    .readdirSync(dataPath)
    .filter((file) => file.endsWith(".json"))
    .map((file) => path.join(dataPath, file));

  logger.info(`발견된 시나리오 파일: ${files.length}개`);
  return files;
}

async function convertSingleFile(
  filePath: string,
  options: ConversionOptions,
  validator: ScenarioValidator,
  converter: ScenarioConverter,
  logger: Logger
): Promise<ConversionResult | null> {
  try {
    logger.info(`변환 시작: ${path.basename(filePath)}`);

    // JSON 파일 읽기
    const jsonData: ScenarioEvent[] = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    // 데이터 검증
    const validationResult = validator.validateScenarioData(jsonData);
    if (!validationResult.valid) {
      logger.error(`검증 실패: ${path.basename(filePath)}`);
      validationResult.errors.forEach((error) => logger.error(`  - ${error}`));
      return {
        inputFile: path.basename(filePath),
        outputFile: "",
        eventCount: 0,
        optionCount: 0,
        success: false,
        error: "데이터 검증 실패",
      };
    }

    // MySQL INSERT 문 생성
    const sqlContent = converter.convertToMySQL(jsonData, options);

    // 출력 파일명 생성
    const fileName = path.basename(filePath, ".json");
    const outputFile = path.join(
      options.output || config.outputDir,
      `${fileName}_converted.sql`
    );

    // SQL 파일 저장
    fs.writeFileSync(outputFile, sqlContent, "utf8");

    logger.success(`변환 완료: ${path.basename(outputFile)}`);

    return {
      inputFile: path.basename(filePath),
      outputFile: path.basename(outputFile),
      eventCount: jsonData.length,
      optionCount: jsonData.reduce(
        (sum, event) => sum + (event.options?.length || 0),
        0
      ),
      success: true,
    };
  } catch (error) {
    logger.error(
      `변환 실패: ${path.basename(filePath)} - ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return {
      inputFile: path.basename(filePath),
      outputFile: "",
      eventCount: 0,
      optionCount: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function generateStatistics(results: (ConversionResult | null)[]): Statistics {
  const totalEvents = results.reduce(
    (sum, result) => sum + (result?.eventCount || 0),
    0
  );
  const totalOptions = results.reduce(
    (sum, result) => sum + (result?.optionCount || 0),
    0
  );
  const successCount = results.filter((result) => result?.success).length;
  const failureCount = results.length - successCount;

  return {
    totalFiles: results.length,
    successCount,
    failureCount,
    totalEvents,
    totalOptions,
    averageOptionsPerEvent:
      totalEvents > 0 ? Number((totalOptions / totalEvents).toFixed(1)) : 0,
  };
}

function printResults(
  results: (ConversionResult | null)[],
  stats: Statistics,
  logger: Logger
): void {
  logger.header("변환 완료");

  logger.table({
    "총 파일 수": stats.totalFiles,
    성공: stats.successCount,
    실패: stats.failureCount,
    "총 이벤트 수": stats.totalEvents,
    "총 선택 옵션 수": stats.totalOptions,
    "평균 옵션 수/이벤트": stats.averageOptionsPerEvent,
  });

  logger.subheader("상세 결과");
  results.forEach((result, index) => {
    if (result?.success) {
      logger.success(
        `${index + 1}. ${result.inputFile} → ${result.outputFile}`
      );
      logger.info(
        `   이벤트: ${result.eventCount}, 옵션: ${result.optionCount}`
      );
    } else {
      logger.error(
        `${index + 1}. ${result?.inputFile || "알 수 없음"} → 변환 실패`
      );
      if (result?.error) {
        logger.error(`   오류: ${result.error}`);
      }
    }
  });
}

async function createIntegratedSQL(
  results: (ConversionResult | null)[],
  outputDir: string,
  logger: Logger
): Promise<void> {
  const integratedFile = path.join(outputDir, "all_scenarios_integrated.sql");
  let integratedContent = `-- Phoenix 시나리오 통합 SQL 파일
-- 생성일시: ${new Date().toISOString()}
-- 총 ${results.filter((r) => r?.success).length}개 시나리오

`;

  results.forEach((result, index) => {
    if (result?.success) {
      const sqlFile = path.join(outputDir, result.outputFile);
      if (fs.existsSync(sqlFile)) {
        integratedContent += `\n-- ========================================\n`;
        integratedContent += `-- 시나리오: ${result.inputFile}\n`;
        integratedContent += `-- ========================================\n\n`;
        integratedContent += fs.readFileSync(sqlFile, "utf8");
        integratedContent += "\n\n";
      }
    }
  });

  fs.writeFileSync(integratedFile, integratedContent, "utf8");
  logger.success(`통합 SQL 파일 생성: ${path.basename(integratedFile)}`);
}

// CLI 실행
if (require.main === module) {
  program.parse();
}

export { convertAllScenarios };
