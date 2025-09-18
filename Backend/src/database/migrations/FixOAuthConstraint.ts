import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOAuthConstraint1700000000002 implements MigrationInterface {
  name = 'FixOAuthConstraint1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 uk_team_name 제약조건이 있는지 확인하고 제거
    // 이는 OAuth 로그인 시 같은 팀 내에서 이름 중복으로 인한 오류를 방지합니다.

    try {
      // 제약조건 존재 여부 확인
      const indexExists = await queryRunner.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.statistics 
        WHERE table_schema = DATABASE() 
        AND table_name = 'user' 
        AND index_name = 'uk_team_name'
      `);

      if (indexExists[0].count > 0) {
        console.log('🔧 uk_team_name 제약조건을 제거합니다...');
        await queryRunner.query(`ALTER TABLE user DROP INDEX uk_team_name`);
        console.log('✅ uk_team_name 제약조건이 성공적으로 제거되었습니다.');
      } else {
        console.log('ℹ️ uk_team_name 제약조건이 이미 존재하지 않습니다.');
      }
    } catch (error) {
      console.warn(
        '⚠️ uk_team_name 제약조건 제거 중 오류 (무시 가능):',
        error.message,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: uk_team_name 제약조건 다시 추가
    try {
      await queryRunner.query(`
        ALTER TABLE user ADD UNIQUE KEY uk_team_name (team_id, name)
      `);
      console.log('🔄 uk_team_name 제약조건이 복원되었습니다.');
    } catch (error) {
      console.warn('⚠️ uk_team_name 제약조건 복원 중 오류:', error.message);
    }
  }
}
