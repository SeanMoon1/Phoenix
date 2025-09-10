#!/usr/bin/env node

/**
 * 개선된 시나리오 변환기 실행 스크립트
 * - 시나리오 ID 고유성 보장
 * - 씬 기반 데이터 구조
 * - 포인트 시스템 지원
 */

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { EnhancedScenarioConverter } from './enhanced-converter';
import { EnhancedSQLGenerator } from './enhanced-sql-generator';
import { OptionShuffler } from './option-shuffler';

const program = new Command();

program
  .name('convert-enhanced')
  .description('개선된 Phoenix 시나리오 JSON을 MySQL INSERT 문으로 변환')
  .version('2.0.0')
  .argument('<input-file>', '변환할 JSON 파일 경로')
  .option('-t, --team-id <id>', '팀 ID', '1')
  .option('-c, --created-by <id>', '생성자 ID', '1')
  .option('-o, --output <file>', '출력 파일 경로')
  .option('-b, --batch', '배치 모드 (트랜잭션 포함)')
  .option('-v, --verbose', '상세 로그')
  .option('--shuffle', '선택 옵션 랜덤 섞기 활성화', true)
  .option('--no-shuffle', '선택 옵션 랜덤 섞기 비활성화')
  .option('--seed <number>', '랜덤 시드 (재현 가능한 섞기)')
  .action(async (inputFile: string, options: Record<string, unknown>) => {
    try {
      await convertEnhanced(inputFile, options);
    } catch (error) {
      console.error(
        `변환 실패: ${error instanceof Error ? error.message : String(error)}`
      );
      process.exit(1);
    }
  });

async function convertEnhanced(
  inputFile: string,
  options: Record<string, unknown>
): Promise<void> {
  // 입력 파일 확인
  if (!fs.existsSync(inputFile)) {
    throw new Error(`입력 파일을 찾을 수 없습니다: ${inputFile}`);
  }

  console.log(`🔄 개선된 시나리오 변환 시작: ${path.basename(inputFile)}`);

  // 옵션 파싱
  const teamId = parseInt(options.teamId as string);
  const createdBy = parseInt(options.createdBy as string);
  const verbose = Boolean(options.verbose);
  const batchMode = Boolean(options.batch);
  const enableShuffling = Boolean(options.shuffle);
  const seed = options.seed ? parseInt(options.seed as string) : Date.now();

  if (verbose) {
    console.log(`📊 팀 ID: ${teamId}, 생성자 ID: ${createdBy}`);
    console.log(`🔧 배치 모드: ${batchMode ? 'ON' : 'OFF'}`);
    console.log(`🎲 옵션 섞기: ${enableShuffling ? 'ON' : 'OFF'}`);
    if (enableShuffling) {
      console.log(`🎯 랜덤 시드: ${seed}`);
    }
  }

  // JSON 파일 읽기
  const jsonData: any[] = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
  console.log(`📁 JSON 파일 로드 완료: ${jsonData.length}개 이벤트`);

  // 변환기 초기화
  const converter = new EnhancedScenarioConverter(
    teamId,
    createdBy,
    enableShuffling
  );
  const sqlGenerator = new EnhancedSQLGenerator();

  // 변환 옵션 설정
  const conversionOptions = {
    teamId,
    createdBy,
    enableShuffling,
    shuffleOptions: {
      useSeed: true,
      seed: seed,
      preserveCorrectness: true,
    },
  };

  // 데이터 변환
  const converted = converter.convertToDatabaseFormat(
    jsonData,
    conversionOptions
  );
  console.log(`✅ 데이터 변환 완료`);

  // 통계 출력
  const stats = converter.generateStatistics(converted);
  console.log(`📈 변환 통계:`);
  console.log(`   - 시나리오: ${stats.totalScenarios}개`);
  console.log(`   - 씬: ${stats.totalScenes}개`);
  console.log(`   - 선택지: ${stats.totalOptions}개`);
  console.log(`   - 재난 유형: ${stats.disasterTypes.join(', ')}`);
  console.log(`   - 난이도: ${stats.difficulties.join(', ')}`);
  console.log(`   - 위험도: ${stats.riskLevels.join(', ')}`);

  // SQL 생성
  const sql = batchMode
    ? sqlGenerator.generateBatchSQL(converted)
    : sqlGenerator.generateSQL(converted);

  // 출력 디렉토리 생성
  const outputDir = './output/enhanced';
  fs.mkdirSync(outputDir, { recursive: true });

  // 출력 파일 경로 결정
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputFile =
    (options.output as string) ||
    path.join(outputDir, `enhanced_scenarios_${timestamp}.sql`);

  fs.writeFileSync(outputFile, sql, 'utf8');
  console.log(`💾 SQL 파일 생성 완료: ${outputFile}`);

  // 롤백 SQL 생성 (선택사항)
  if (verbose) {
    const scenarioCodes = converted.scenarios.map(s => s.scenario_code);
    const rollbackSql = sqlGenerator.generateRollbackSQL(scenarioCodes);
    const rollbackFile = path.join(outputDir, `rollback_${timestamp}.sql`);
    fs.writeFileSync(rollbackFile, rollbackSql, 'utf8');
    console.log(`🔄 롤백 SQL 생성: ${rollbackFile}`);
  }

  console.log(`🎉 변환 완료!`);
}

// CLI 실행
if (require.main === module) {
  program.parse();
}

export { convertEnhanced };
