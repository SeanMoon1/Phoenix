#!/usr/bin/env node

/**
 * Phoenix 시나리오 변환기 (TypeScript)
 * JSON 시나리오 데이터를 MySQL INSERT 문으로 변환
 */

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { ScenarioEvent, ConversionOptions } from "./types";
import { ScenarioValidator } from "./validator";
import { ScenarioConverter } from "./converter";
import { Logger } from "./logger";
import { config } from "./config";

const program = new Command();

program
  .name("convert-scenario")
  .description("Phoenix 시나리오 JSON을 MySQL INSERT 문으로 변환")
  .version("1.0.0")
  .argument("<input-file>", "변환할 JSON 파일 경로")
  .option("-t, --team-id <id>", "팀 ID", config.defaultTeamId.toString())
  .option(
    "-c, --created-by <id>",
    "생성자 ID",
    config.defaultCreatedBy.toString()
  )
  .option("-b, --backup", "백업 생성")
  .option("-v, --verbose", "상세 로그")
  .option("-d, --debug", "디버그 모드")
  .option("-o, --output <file>", "출력 파일 경로")
  .action(async (inputFile: string, options: any) => {
    const logger = new Logger(options.verbose, options.debug);

    try {
      await convertScenario(inputFile, options, logger);
    } catch (error) {
      logger.error(
        `변환 실패: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

async function convertScenario(
  inputFile: string,
  options: any,
  logger: Logger
): Promise<void> {
  // 입력 파일 확인
  if (!fs.existsSync(inputFile)) {
    throw new Error(`입력 파일을 찾을 수 없습니다: ${inputFile}`);
  }

  logger.info(`시나리오 변환 시작: ${path.basename(inputFile)}`);

  // 옵션 파싱
  const conversionOptions: ConversionOptions = {
    teamId: parseInt(options.teamId),
    createdBy: parseInt(options.createdBy),
    backup: options.backup || false,
    verbose: options.verbose || false,
    debug: options.debug || false,
  };

  logger.debug(
    `팀 ID: ${conversionOptions.teamId}, 생성자 ID: ${conversionOptions.createdBy}`
  );

  // 백업 생성
  if (conversionOptions.backup) {
    await createBackup(inputFile, logger);
  }

  // JSON 파일 읽기
  const jsonData: ScenarioEvent[] = JSON.parse(
    fs.readFileSync(inputFile, "utf8")
  );
  logger.success(`JSON 파일 로드 완료: ${jsonData.length}개 이벤트`);

  // 데이터 검증
  const validator = new ScenarioValidator();
  const validationResult = validator.validateScenarioData(jsonData);

  if (!validationResult.valid) {
    logger.error("데이터 검증 실패:");
    validationResult.errors.forEach((error) => logger.error(`  - ${error}`));
    throw new Error("데이터 검증 실패");
  }

  if (validationResult.warnings.length > 0) {
    logger.warn("검증 경고:");
    validationResult.warnings.forEach((warning) =>
      logger.warn(`  - ${warning}`)
    );
  }

  logger.success("데이터 검증 완료");

  // MySQL INSERT 문 생성
  const converter = new ScenarioConverter(logger);
  const sqlContent = converter.convertToMySQL(jsonData, conversionOptions);

  // 출력 디렉토리 생성
  fs.mkdirSync(config.outputDir, { recursive: true });

  // 출력 파일 경로 결정
  const outputFile =
    options.output || path.join(config.outputDir, `scenario_${Date.now()}.sql`);
  fs.writeFileSync(outputFile, sqlContent, "utf8");

  logger.success(`SQL 파일 생성 완료: ${outputFile}`);

  const sqlStatementCount = (sqlContent.match(/INSERT INTO/g) || []).length;
  logger.info(`생성된 SQL 문 수: ${sqlStatementCount}`);

  // 통계 출력
  if (conversionOptions.verbose) {
    const stats = converter.generateStatistics(jsonData);
    logger.subheader("변환 통계");
    logger.table({
      "이벤트 수": stats.totalEvents,
      "선택 옵션 수": stats.totalOptions,
      "평균 옵션 수": stats.averageOptionsPerEvent,
      "재난 유형": stats.disasterTypes.join(", ") || "없음",
      난이도: stats.difficulties.join(", ") || "없음",
      위험도: stats.riskLevels.join(", ") || "없음",
    });
  }
}

async function createBackup(inputFile: string, logger: Logger): Promise<void> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(config.backupDir, `backup_${timestamp}.json`);

    fs.mkdirSync(config.backupDir, { recursive: true });
    fs.copyFileSync(inputFile, backupFile);
    logger.success(`백업 생성: ${backupFile}`);
  } catch (error) {
    logger.error(
      `백업 생성 실패: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

// CLI 실행
if (require.main === module) {
  program.parse();
}

export { convertScenario };
