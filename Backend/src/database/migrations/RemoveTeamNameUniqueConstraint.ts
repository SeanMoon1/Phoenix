import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTeamNameUniqueConstraint1700000000001
  implements MigrationInterface
{
  name = 'RemoveTeamNameUniqueConstraint1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // uk_team_name 제약조건 제거 (같은 팀 내에서 이름 중복 허용)
    await queryRunner.query(`
      ALTER TABLE user DROP INDEX uk_team_name
    `);

    console.log('✅ uk_team_name 유니크 제약조건이 제거되었습니다.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 롤백: uk_team_name 제약조건 다시 추가
    await queryRunner.query(`
      ALTER TABLE user ADD UNIQUE KEY uk_team_name (team_id, name)
    `);

    console.log('🔄 uk_team_name 유니크 제약조건이 복원되었습니다.');
  }
}
