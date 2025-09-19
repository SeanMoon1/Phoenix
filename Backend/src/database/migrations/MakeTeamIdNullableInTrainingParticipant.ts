import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTeamIdNullableInTrainingParticipant1700000000000
  implements MigrationInterface
{
  name = 'MakeTeamIdNullableInTrainingParticipant1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // team_id 컬럼을 nullable로 변경
    await queryRunner.query(`
      ALTER TABLE training_participant 
      MODIFY COLUMN team_id BIGINT NULL COMMENT '팀 ID'
    `);

    // 외래키 제약조건 제거 (team_id가 null일 수 있으므로)
    await queryRunner.query(`
      ALTER TABLE training_participant 
      DROP FOREIGN KEY training_participant_ibfk_2
    `);

    // team_id가 null이 아닌 경우에만 외래키 제약조건 추가
    await queryRunner.query(`
      ALTER TABLE training_participant 
      ADD CONSTRAINT fk_training_participant_team 
      FOREIGN KEY (team_id) REFERENCES team(team_id) 
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
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
