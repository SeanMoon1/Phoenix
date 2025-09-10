#!/usr/bin/env node

/**
 * 간단한 옵션 섞기 테스트
 */

import * as fs from 'fs';

// 간단한 섞기 함수
function shuffleArray<T>(array: T[], seed?: number): T[] {
  const shuffled = [...array];
  let random = Math.random;

  if (seed) {
    // 간단한 시드 기반 랜덤
    let currentSeed = seed;
    random = () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function testSimpleShuffle() {
  console.log('🧪 간단한 옵션 섞기 테스트');
  console.log('============================');

  try {
    // JSON 파일 읽기
    const jsonData = JSON.parse(
      fs.readFileSync('../data/fire_training_scenario_fixed.json', 'utf8')
    );
    console.log(`📁 JSON 파일 로드 완료: ${jsonData.length}개 이벤트`);

    // 첫 번째 씬의 옵션 확인
    const firstScene = jsonData[0];
    if (firstScene && firstScene.options) {
      console.log('\n📋 원본 옵션 순서:');
      firstScene.options.forEach((option: any, index: number) => {
        const isCorrect =
          option.points &&
          option.points.speed > 0 &&
          option.points.accuracy > 0;
        console.log(
          `   ${index + 1}. ${option.answer.substring(0, 50)}... (${
            isCorrect ? '정답' : '오답'
          })`
        );
      });

      // 옵션 섞기
      const shuffledOptions = shuffleArray(firstScene.options, 12345);

      console.log('\n🎲 섞인 옵션 순서:');
      shuffledOptions.forEach((option: any, index: number) => {
        const isCorrect =
          option.points &&
          option.points.speed > 0 &&
          option.points.accuracy > 0;
        console.log(
          `   ${index + 1}. ${option.answer.substring(0, 50)}... (${
            isCorrect ? '정답' : '오답'
          })`
        );
      });

      // 정답 위치 확인
      const correctPositions: number[] = [];
      shuffledOptions.forEach((option: any, index: number) => {
        const isCorrect =
          option.points &&
          option.points.speed > 0 &&
          option.points.accuracy > 0;
        if (isCorrect) {
          correctPositions.push(index + 1);
        }
      });

      console.log('\n📊 섞기 결과:');
      console.log(`   - 정답 위치: ${correctPositions.join(', ')}`);
      console.log(
        `   - 평균 정답 위치: ${(
          correctPositions.reduce((sum, pos) => sum + pos, 0) /
          correctPositions.length
        ).toFixed(1)}`
      );

      // 결과 저장
      const outputFile = './output/enhanced/simple_shuffled_test.json';
      fs.mkdirSync('./output/enhanced', { recursive: true });
      fs.writeFileSync(
        outputFile,
        JSON.stringify(shuffledOptions, null, 2),
        'utf8'
      );
      console.log(`💾 섞인 옵션 저장: ${outputFile}`);
    } else {
      console.log('❌ 옵션 데이터를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error(
      `❌ 테스트 실패: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  console.log('\n🎉 테스트 완료!');
}

// CLI 실행
if (require.main === module) {
  testSimpleShuffle();
}

export { testSimpleShuffle };
