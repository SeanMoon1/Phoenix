#!/usr/bin/env node

/**
 * 모든 시나리오 파일을 일괄 변환하는 스크립트
 * - 시나리오 ID 고유성 보장
 * - 씬 기반 데이터 구조
 * - 포인트 시스템 지원
 */

import * as fs from 'fs';
import * as path from 'path';
import { EnhancedScenarioConverter } from './enhanced-converter';
import { EnhancedSQLGenerator } from './enhanced-sql-generator';

interface ConversionOptions {
  teamId: number;
  createdBy: number;
  verbose: boolean;
  batchMode: boolean;
  enableShuffling: boolean;
  seed?: number;
}

async function convertAllScenarios(options: ConversionOptions): Promise<void> {
  console.log('🚀 Phoenix 시나리오 일괄 변환 시작');
  console.log('=====================================');

  // JSON 파일 목록
  const jsonFiles = [
    '../data/fire_training_scenario.json',
    '../data/emergency_first_aid_scenario.json',
    '../data/traffic_accident_scenario.json',
    '../data/earthquake_training_scenario.json',
  ];

  const converter = new EnhancedScenarioConverter(
    options.teamId,
    options.createdBy,
    options.enableShuffling
  );
  const sqlGenerator = new EnhancedSQLGenerator();

  // 변환 옵션 설정
  const conversionOptions = {
    teamId: options.teamId,
    createdBy: options.createdBy,
    enableShuffling: options.enableShuffling,
    shuffleOptions: {
      useSeed: true,
      seed: options.seed || Date.now(),
      preserveCorrectness: true
    }
  };

  const allScenarios: any[] = [];
  const allScenes: any[] = [];
  const allOptions: any[] = [];
  const conversionResults: Array<{
    file: string;
    success: boolean;
    error?: string;
    stats?: any;
  }> = [];

  // 각 파일 변환
  for (const file of jsonFiles) {
    try {
      console.log(`\n📁 변환 중: ${path.basename(file)}`);

      if (!fs.existsSync(file)) {
        console.log(`❌ 파일을 찾을 수 없습니다: ${file}`);
        conversionResults.push({
          file,
          success: false,
          error: '파일을 찾을 수 없습니다',
        });
        continue;
      }

      const jsonData = JSON.parse(fs.readFileSync(file, 'utf8'));
      const converted = converter.convertToDatabaseFormat(jsonData, conversionOptions);

      allScenarios.push(...converted.scenarios);
      allScenes.push(...converted.scenes);
      allOptions.push(...converted.options);

      const stats = converter.generateStatistics(converted);
      conversionResults.push({
        file,
        success: true,
        stats,
      });

      console.log(
        `✅ 변환 완료: 시나리오 ${stats.totalScenarios}개, 씬 ${stats.totalScenes}개, 선택지 ${stats.totalOptions}개`
      );
    } catch (error) {
      console.log(`❌ 변환 실패: ${file}`);
      console.log(
        `   오류: ${error instanceof Error ? error.message : String(error)}`
      );
      conversionResults.push({
        file,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // 전체 통계
  console.log('\n📊 전체 변환 결과');
  console.log('==================');
  console.log(
    `✅ 성공: ${conversionResults.filter(r => r.success).length}개 파일`
  );
  console.log(
    `❌ 실패: ${conversionResults.filter(r => !r.success).length}개 파일`
  );
  console.log(`📈 총 시나리오: ${allScenarios.length}개`);
  console.log(`🎬 총 씬: ${allScenes.length}개`);
  console.log(`🎯 총 선택지: ${allOptions.length}개`);

  // 실패한 파일 목록
  const failedFiles = conversionResults.filter(r => !r.success);
  if (failedFiles.length > 0) {
    console.log('\n❌ 실패한 파일들:');
    failedFiles.forEach(f => {
      console.log(`   - ${f.file}: ${f.error}`);
    });
  }

  // SQL 생성
  if (allScenarios.length > 0) {
    console.log('\n💾 SQL 파일 생성 중...');

    const sql = options.batchMode
      ? sqlGenerator.generateBatchSQL({
          scenarios: allScenarios,
          scenes: allScenes,
          options: allOptions,
        })
      : sqlGenerator.generateSQL({
          scenarios: allScenarios,
          scenes: allScenes,
          options: allOptions,
        });

    // 출력 디렉토리 생성
    const outputDir = './output/enhanced';
    fs.mkdirSync(outputDir, { recursive: true });

    // SQL 파일 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(outputDir, `all_scenarios_${timestamp}.sql`);
    fs.writeFileSync(outputFile, sql, 'utf8');
    console.log(`✅ SQL 파일 생성 완료: ${outputFile}`);

    // 롤백 SQL 생성
    const scenarioCodes = allScenarios.map(s => s.scenario_code);
    const rollbackSql = sqlGenerator.generateRollbackSQL(scenarioCodes);
    const rollbackFile = path.join(outputDir, `rollback_all_${timestamp}.sql`);
    fs.writeFileSync(rollbackFile, rollbackSql, 'utf8');
    console.log(`🔄 롤백 SQL 생성: ${rollbackFile}`);

    // 상세 통계 파일 생성
    if (options.verbose) {
      const statsFile = path.join(
        outputDir,
        `conversion_stats_${timestamp}.json`
      );
      const detailedStats = {
        timestamp: new Date().toISOString(),
        totalFiles: jsonFiles.length,
        successfulFiles: conversionResults.filter(r => r.success).length,
        failedFiles: conversionResults.filter(r => !r.success).length,
        totalScenarios: allScenarios.length,
        totalScenes: allScenes.length,
        totalOptions: allOptions.length,
        disasterTypes: [...new Set(allScenarios.map(s => s.disaster_type))],
        difficulties: [...new Set(allScenarios.map(s => s.difficulty))],
        riskLevels: [...new Set(allScenarios.map(s => s.risk_level))],
        conversionResults,
      };
      fs.writeFileSync(
        statsFile,
        JSON.stringify(detailedStats, null, 2),
        'utf8'
      );
      console.log(`📊 상세 통계 파일 생성: ${statsFile}`);
    }
  }

  console.log('\n🎉 일괄 변환 완료!');
}

// CLI 실행
if (require.main === module) {
  const options: ConversionOptions = {
    teamId: 1,
    createdBy: 1,
    verbose: true,
    batchMode: true,
    enableShuffling: true,
    seed: Date.now()
  };

  convertAllScenarios(options).catch(console.error);
}

export { convertAllScenarios };
