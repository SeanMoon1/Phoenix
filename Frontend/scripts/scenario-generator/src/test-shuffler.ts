#!/usr/bin/env node

/**
 * 옵션 섞기 기능 테스트 스크립트
 */

import * as fs from 'fs';
import { OptionShuffler } from './option-shuffler';

async function testShuffler() {
  console.log('🧪 옵션 섞기 기능 테스트 시작');
  console.log('================================');

  try {
    // JSON 파일 읽기
    const jsonData = JSON.parse(fs.readFileSync('../data/fire_training_scenario.json', 'utf8'));
    console.log(`📁 JSON 파일 로드 완료: ${jsonData.length}개 이벤트`);

    // 첫 번째 씬의 옵션 확인
    const firstScene = jsonData[0];
    if (firstScene && firstScene.options) {
      console.log('\n📋 원본 옵션 순서:');
      firstScene.options.forEach((option: any, index: number) => {
        const isCorrect = option.points && option.points.speed > 0 && option.points.accuracy > 0;
        console.log(`   ${index + 1}. ${option.answer.substring(0, 50)}... (${isCorrect ? '정답' : '오답'})`);
      });

      // 옵션 섞기 테스트
      const shuffler = new OptionShuffler(12345);
      const shuffledOptions = shuffler.shuffleOptions(firstScene.options, {
        useSeed: true,
        seed: 12345,
        preserveCorrectness: true
      });

      console.log('\n🎲 섞인 옵션 순서:');
      shuffledOptions.forEach((option, index) => {
        console.log(`   ${index + 1}. ${option.answer.substring(0, 50)}... (${option.isCorrect ? '정답' : '오답'})`);
      });

      // 통계 생성
      const stats = shuffler.generateShuffleStatistics(firstScene.options, shuffledOptions);
      console.log('\n📊 섞기 통계:');
      console.log(`   - 총 옵션: ${stats.totalOptions}개`);
      console.log(`   - 정답: ${stats.correctOptions}개`);
      console.log(`   - 오답: ${stats.incorrectOptions}개`);
      console.log(`   - 정답 위치: ${stats.correctPositions.join(', ')}`);
      console.log(`   - 평균 정답 위치: ${stats.averageCorrectPosition}`);

      // 시나리오 전체에 섞기 적용
      console.log('\n🔄 전체 시나리오에 섞기 적용...');
      const shuffledScenario = shuffler.shuffleScenarioOptions(jsonData, {
        useSeed: true,
        seed: 12345,
        preserveCorrectness: true
      });

      console.log(`✅ 섞기 완료: ${shuffledScenario.length}개 씬 처리`);

      // 결과 저장
      const outputFile = './output/enhanced/test_shuffled_scenario.json';
      fs.mkdirSync('./output/enhanced', { recursive: true });
      fs.writeFileSync(outputFile, JSON.stringify(shuffledScenario, null, 2), 'utf8');
      console.log(`💾 섞인 시나리오 저장: ${outputFile}`);

    } else {
      console.log('❌ 옵션 데이터를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error(`❌ 테스트 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log('\n🎉 테스트 완료!');
}

// CLI 실행
if (require.main === module) {
  testShuffler().catch(console.error);
}

export { testShuffler };
