import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class CreateInitialAdmin1700000000002 implements MigrationInterface {
  name = 'CreateInitialAdmin1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 기본 권한 레벨 생성
    await queryRunner.query(`
      INSERT IGNORE INTO admin_level (
        level_name, 
        level_code, 
        description, 
        can_manage_team, 
        can_manage_users, 
        can_manage_scenarios, 
        can_approve_scenarios, 
        can_view_results,
        is_active
      ) VALUES 
      (
        '슈퍼 관리자', 
        'SUPER_ADMIN', 
        '모든 권한을 가진 최고 관리자', 
        1, 1, 1, 1, 1, 1
      ),
      (
        '팀 관리자', 
        'TEAM_ADMIN', 
        '팀 단위 관리 권한', 
        1, 1, 1, 0, 1, 1
      ),
      (
        '시나리오 관리자', 
        'SCENARIO_ADMIN', 
        '시나리오 관리 권한', 
        0, 0, 1, 1, 1, 1
      ),
      (
        '조회 전용 관리자', 
        'VIEWER_ADMIN', 
        '조회 권한만 가진 관리자', 
        0, 0, 0, 0, 1, 1
      )
    `);

    // 2. 기본 팀이 없으면 생성
    const teamExists = await queryRunner.query(`
      SELECT COUNT(*) as count FROM team WHERE team_code = 'DEFAULT_TEAM'
    `);

    if (teamExists[0].count === 0) {
      await queryRunner.query(`
        INSERT INTO team (
          team_code, 
          team_name, 
          description, 
          status, 
          created_by, 
          is_active
        ) VALUES (
          'DEFAULT_TEAM', 
          '기본 팀', 
          '시스템 기본 팀', 
          'ACTIVE', 
          1, 
          1
        )
      `);
    }

    // 3. 환경변수에서 초기 관리자 정보 가져오기
    const adminLoginId = process.env.INITIAL_ADMIN_LOGIN_ID;
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
    const adminName = process.env.INITIAL_ADMIN_NAME;
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const adminPhone = process.env.INITIAL_ADMIN_PHONE;

    // 환경변수 검증
    if (
      !adminLoginId ||
      !adminPassword ||
      !adminName ||
      !adminEmail ||
      !adminPhone
    ) {
      console.log(
        '⚠️ 초기 관리자 환경변수가 설정되지 않았습니다. 관리자 계정을 생성하지 않습니다.',
      );
      console.log(
        '필요한 환경변수: INITIAL_ADMIN_LOGIN_ID, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PHONE',
      );
      return;
    }

    // 4. 관리자가 이미 존재하는지 확인
    const adminExists = await queryRunner.query(
      `SELECT COUNT(*) as count FROM admin WHERE login_id = ?`,
      [adminLoginId],
    );

    if (adminExists[0].count === 0) {
      // 5. 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // 6. 초기 관리자 계정 생성
      await queryRunner.query(
        `INSERT INTO admin (
          team_id, 
          admin_level_id, 
          login_id, 
          password, 
          name, 
          email, 
          phone, 
          use_yn, 
          created_by, 
          is_active
        ) VALUES (
          (SELECT team_id FROM team WHERE team_code = 'DEFAULT_TEAM' LIMIT 1),
          (SELECT level_id FROM admin_level WHERE level_code = 'SUPER_ADMIN' LIMIT 1),
          ?, ?, ?, ?, ?, 'Y', 1, 1
        )`,
        [adminLoginId, hashedPassword, adminName, adminEmail, adminPhone],
      );

      console.log(`✅ 초기 관리자 계정 생성 완료: ${adminLoginId}`);
    } else {
      console.log(`ℹ️ 관리자 계정이 이미 존재합니다: ${adminLoginId}`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 초기 관리자 계정 삭제
    await queryRunner.query(
      `
      DELETE FROM admin WHERE login_id = ?
    `,
      [process.env.INITIAL_ADMIN_LOGIN_ID || 'admin'],
    );

    // 권한 레벨 삭제
    await queryRunner.query(`
      DELETE FROM admin_level WHERE level_code IN ('SUPER_ADMIN', 'TEAM_ADMIN', 'SCENARIO_ADMIN', 'VIEWER_ADMIN')
    `);
  }
}
