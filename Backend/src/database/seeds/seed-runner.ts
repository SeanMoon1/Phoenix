import { DataSource } from 'typeorm';
import { InitialDataSeed } from './initial-data.seed';

export async function runSeeds(dataSource: DataSource): Promise<void> {
  try {
    console.log('🚀 데이터베이스 시드 실행 시작...');

    const initialDataSeed = new InitialDataSeed(dataSource);
    await initialDataSeed.run();

    console.log('🎉 모든 시드가 성공적으로 실행되었습니다!');
  } catch (error) {
    console.error('❌ 시드 실행 중 오류 발생:', error);
    throw error;
  }
}
