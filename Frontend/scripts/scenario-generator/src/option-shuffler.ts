/**
 * 선택 옵션 랜덤 섞기 유틸리티
 * - 정답과 오답의 순서를 랜덤하게 섞어서 훈련 효과 향상
 * - 시드 기반 랜덤으로 재현 가능한 섞기 지원
 */

export interface ShuffleOptions {
  useSeed?: boolean;
  seed?: number;
  preserveCorrectness?: boolean;
}

export interface ShuffledOption {
  answerId: string;
  answer: string;
  reaction: string;
  nextId?: string;
  points?: {
    speed: number;
    accuracy: number;
  };
  exp?: number;
  isCorrect?: boolean;
  originalIndex: number; // 원래 순서를 추적하기 위한 필드
}

export class OptionShuffler {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || Date.now();
  }

  /**
   * 선택 옵션들을 랜덤하게 섞기
   */
  shuffleOptions(options: any[], shuffleOptions: ShuffleOptions = {}): ShuffledOption[] {
    const {
      useSeed = true,
      seed = this.seed,
      preserveCorrectness = true
    } = shuffleOptions;

    // 정답 여부 판단
    const optionsWithCorrectness = options.map((option, index) => ({
      ...option,
      originalIndex: index,
      isCorrect: this.determineCorrectness(option)
    }));

    // 정답과 오답 분리
    const correctOptions = optionsWithCorrectness.filter(opt => opt.isCorrect);
    const incorrectOptions = optionsWithCorrectness.filter(opt => !opt.isCorrect);

    let shuffledOptions: ShuffledOption[] = [];

    if (preserveCorrectness) {
      // 정답과 오답을 각각 섞은 후 합치기
      const shuffledCorrect = this.shuffleArray(correctOptions, useSeed ? seed : undefined);
      const shuffledIncorrect = this.shuffleArray(incorrectOptions, useSeed ? seed + 1 : undefined);
      
      // 정답과 오답을 랜덤하게 배치
      shuffledOptions = this.interleaveOptions(shuffledCorrect, shuffledIncorrect, useSeed ? seed + 2 : undefined);
    } else {
      // 모든 옵션을 완전히 랜덤하게 섞기
      shuffledOptions = this.shuffleArray(optionsWithCorrectness, useSeed ? seed : undefined);
    }

    return shuffledOptions;
  }

  /**
   * 배열을 랜덤하게 섞기 (Fisher-Yates 알고리즘)
   */
  private shuffleArray<T>(array: T[], seed?: number): T[] {
    const shuffled = [...array];
    const random = seed ? this.seededRandom(seed) : Math.random;

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }

  /**
   * 정답과 오답을 번갈아가며 배치
   */
  private interleaveOptions(
    correctOptions: ShuffledOption[],
    incorrectOptions: ShuffledOption[],
    seed?: number
  ): ShuffledOption[] {
    const result: ShuffledOption[] = [];
    const random = seed ? this.seededRandom(seed) : Math.random;

    let correctIndex = 0;
    let incorrectIndex = 0;

    // 정답과 오답을 랜덤하게 배치
    while (correctIndex < correctOptions.length || incorrectIndex < incorrectOptions.length) {
      const shouldAddCorrect = correctIndex < correctOptions.length && 
        (incorrectIndex >= incorrectOptions.length || random() < 0.5);

      if (shouldAddCorrect) {
        result.push(correctOptions[correctIndex++]);
      } else {
        result.push(incorrectOptions[incorrectIndex++]);
      }
    }

    return result;
  }

  /**
   * 정답 여부 판단
   */
  private determineCorrectness(option: any): boolean {
    const points = option.points;
    return points && points.speed > 0 && points.accuracy > 0;
  }

  /**
   * 시드 기반 랜덤 함수 (선형 합동 생성기)
   */
  private seededRandom(seed: number): () => number {
    let currentSeed = seed;
    return () => {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      return currentSeed / 233280;
    };
  }

  /**
   * 시나리오 데이터의 모든 씬에 대해 옵션 섞기 적용
   */
  shuffleScenarioOptions(scenarioData: any[], shuffleOptions: ShuffleOptions = {}): any[] {
    return scenarioData.map(scene => {
      if (scene.options && Array.isArray(scene.options)) {
        const shuffledOptions = this.shuffleOptions(scene.options, shuffleOptions);
        return {
          ...scene,
          options: shuffledOptions
        };
      }
      return scene;
    });
  }

  /**
   * 섞기 통계 생성
   */
  generateShuffleStatistics(originalOptions: any[], shuffledOptions: ShuffledOption[]): {
    totalOptions: number;
    correctOptions: number;
    incorrectOptions: number;
    correctPositions: number[];
    incorrectPositions: number[];
    averageCorrectPosition: number;
  } {
    const correctPositions: number[] = [];
    const incorrectPositions: number[] = [];

    shuffledOptions.forEach((option, index) => {
      if (option.isCorrect) {
        correctPositions.push(index);
      } else {
        incorrectPositions.push(index);
      }
    });

    const averageCorrectPosition = correctPositions.length > 0 
      ? correctPositions.reduce((sum, pos) => sum + pos, 0) / correctPositions.length 
      : 0;

    return {
      totalOptions: shuffledOptions.length,
      correctOptions: correctPositions.length,
      incorrectOptions: incorrectPositions.length,
      correctPositions,
      incorrectPositions,
      averageCorrectPosition: Math.round(averageCorrectPosition * 100) / 100
    };
  }

  /**
   * 섞기 설정 검증
   */
  validateShuffleOptions(options: ShuffleOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (options.useSeed && options.seed !== undefined) {
      if (options.seed < 0) {
        errors.push('시드는 0 이상이어야 합니다.');
      }
      if (options.seed > 2147483647) {
        errors.push('시드는 2147483647 이하여야 합니다.');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
