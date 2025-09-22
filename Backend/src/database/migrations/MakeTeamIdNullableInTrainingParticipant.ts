import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTeamIdNullableInTrainingParticipant1700000000000
  implements MigrationInterface
{
  name = 'MakeTeamIdNullableInTrainingParticipant1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 먼저 외래키 제약조건을 안전하게 제거
    try {
      await queryRunner.query(`
        ALTER TABLE training_participant 
        DROP FOREIGN KEY training_participant_ibfk_2
      `);
    } catch (error) {
      console.log(
        '외래키 제약조건이 존재하지 않거나 다른 이름입니다:',
        error.message,
      );
    }

    // team_id 컬럼을 nullable로 변경
    await queryRunner.query(`
      ALTER TABLE training_participant 
      MODIFY COLUMN team_id BIGINT NULL COMMENT '팀 ID'
    `);

    // team_id가 null이 아닌 경우에만 외래키 제약조건 추가
    try {
      await queryRunner.query(`
        ALTER TABLE training_participant 
        ADD CONSTRAINT fk_training_participant_team 
        FOREIGN KEY (team_id) REFERENCES team(team_id) 
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
    } catch (error) {
      console.log('외래키 제약조건 추가 실패:', error.message);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 외래키 제약조건 제거
    await queryRunner.query(`
      ALTER TABLE training_participant 
      DROP FOREIGN KEY fk_training_participant_team
    `);

    // team_id 컬럼을 NOT NULL로 되돌리기
    await queryRunner.query(`
      ALTER TABLE training_participant 
      MODIFY COLUMN team_id BIGINT NOT NULL COMMENT '팀 ID'
    `);

    // 기존 외래키 제약조건 복원
    await queryRunner.query(`
      ALTER TABLE training_participant 
      ADD CONSTRAINT training_participant_ibfk_2 
      FOREIGN KEY (team_id) REFERENCES team(team_id)
    `);
  }
}
